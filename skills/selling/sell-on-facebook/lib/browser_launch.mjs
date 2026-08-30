import { existsSync, rmSync } from 'node:fs'
import { join } from 'node:path'

const CHROME_CRASH_ARGS = [
  '--disable-crash-reporter',
  '--disable-crashpad',
  '--disable-breakpad',
]

// Google SSO blocks Playwright-controlled Chrome outright ("This browser or
// app may not be secure") unless the automation fingerprint is hidden. Any
// phase that can hit a Google-authenticated login (Google/Gmail/Slack SSO)
// needs this, not just the one script it was originally patched into.
const AUTOMATION_STEALTH_ARGS = ['--disable-blink-features=AutomationControlled']
export const DEFAULT_CDP_URL = 'http://127.0.0.1:9222'

export function marketplaceCdpUrl(env = process.env) {
  if (String(env.MARKETPLACE_DISABLE_CDP || '').toLowerCase() === 'true') return ''
  return String(env.MARKETPLACE_CDP_URL || DEFAULT_CDP_URL).trim()
}

export function cdpConnectionError(error, url) {
  const message = String(error?.message || error)
  return new Error(
    `Marketplace Chrome session is not available at ${url}. ` +
    `Run \"node scripts/marketplace_browser_session.mjs start\", log in once, and keep that Chrome window open.\n` +
    `Original error: ${message}`
  )
}

export function unrefCdpSocket(url, handles = process._getActiveHandles()) {
  const port = Number(new URL(url).port || (url.startsWith('https:') ? 443 : 80))
  const socket = handles.find((handle) => (
    handle?.constructor?.name === 'Socket' &&
    handle.remotePort === port &&
    typeof handle.unref === 'function'
  ))
  if (!socket) throw new Error(`Playwright CDP socket for port ${port} was not found`)
  socket.unref()
}

export function sharedCdpContext(browser, url) {
  const context = browser.contexts()[0]
  if (!context) throw new Error('CDP browser has no default context')
  return new Proxy(context, {
    get(target, property, receiver) {
      if (property === 'close') return async () => unrefCdpSocket(url)
      return Reflect.get(target, property, receiver)
    },
  })
}

export async function connectSharedChrome(chromium, url) {
  const browser = await chromium.connectOverCDP(url)
  return sharedCdpContext(browser, url)
}

function wantsBundledBrowser(channel) {
  const requested = String(process.env.MARKETPLACE_BROWSER || '').toLowerCase()
  return requested === 'bundled' || requested === 'chromium' || channel === 'bundled'
}

function shouldAvoidInstalledChrome() {
  return process.env.CODEX_SANDBOX === 'seatbelt' && !process.env.MARKETPLACE_ALLOW_SANDBOX_CHROME
}

function withStableChromeOptions(options) {
  const next = { ...options }
  if (wantsBundledBrowser(next.channel) || shouldAvoidInstalledChrome()) {
    delete next.channel
  }
  if (next.channel) {
    next.args = Array.from(new Set([...(next.args || []), ...CHROME_CRASH_ARGS, ...AUTOMATION_STEALTH_ARGS]))
    next.ignoreDefaultArgs = Array.from(new Set([...(next.ignoreDefaultArgs || []), '--enable-automation']))
  }
  return next
}

function isBundledBrowserMissing(error) {
  return /Executable doesn't exist|playwright install/i.test(String(error?.message || error))
}

function isChromeStartupAbort(error) {
  const text = String(error?.message || error)
  return (
    /Target page, context or browser has been closed/i.test(text) &&
    (/Crashpad|RegisterApplication|Operation not permitted|SIGABRT|Abort trap/i.test(text))
  )
}

function appendBrowserHint(error, label) {
  const message = String(error?.message || error)
  const hint = [
    '',
    `[${label}] Chrome could not start from this process. On macOS this usually means the agent sandbox blocked Chrome AppKit/Crashpad startup.`,
    'Fix: run this phase with the approved/elevated command, or install the bundled Playwright browser with `npx playwright install chromium` and run with `MARKETPLACE_BROWSER=bundled`.',
  ].join('\n')
  error.message = `${message}${hint}`
  return error
}

function appendBundledBrowserHint(error, label) {
  const message = String(error?.message || error)
  const hint = [
    '',
    `[${label}] Installed Chrome was skipped because this command is running inside the Codex seatbelt sandbox.`,
    'Fix: install the bundled Playwright browser with `npx playwright install chromium`, or run the phase with the approved/elevated command so installed Chrome can start normally.',
  ].join('\n')
  error.message = `${message}${hint}`
  return error
}

async function retryWithBundled(open, options, label, originalError) {
  const fallbackOptions = { ...options }
  delete fallbackOptions.channel
  try {
    console.warn(`[${label}] Installed Chrome failed before startup; retrying with bundled Playwright Chromium.`)
    return await open(fallbackOptions)
  } catch (fallbackError) {
    if (isBundledBrowserMissing(fallbackError)) {
      throw appendBrowserHint(originalError, label)
    }
    throw fallbackError
  }
}

function cleanupStaleLocks(userDataDir) {
  if (!userDataDir || !existsSync(userDataDir)) return
  for (const name of ['SingletonLock', 'SingletonSocket', 'SingletonCookie']) {
    const lockPath = join(userDataDir, name)
    if (existsSync(lockPath)) {
      try { rmSync(lockPath, { force: true }) } catch {}
    }
  }
}

export async function launchPersistentContext(chromium, userDataDir, options, { label = 'browser' } = {}) {
  const cdpUrl = marketplaceCdpUrl()
  if (cdpUrl) {
    try {
      return await connectSharedChrome(chromium, cdpUrl)
    } catch (error) {
      throw cdpConnectionError(error, cdpUrl)
    }
  }
  cleanupStaleLocks(userDataDir)
  const launchOptions = withStableChromeOptions(options)
  try {
    return await chromium.launchPersistentContext(userDataDir, launchOptions)
  } catch (error) {
    if (!launchOptions.channel && shouldAvoidInstalledChrome() && isBundledBrowserMissing(error)) {
      throw appendBundledBrowserHint(error, label)
    }
    if (launchOptions.channel && isChromeStartupAbort(error)) {
      return retryWithBundled(
        (fallbackOptions) => chromium.launchPersistentContext(userDataDir, fallbackOptions),
        launchOptions,
        label,
        error
      )
    }
    throw error
  }
}

export async function launchBrowser(chromium, options, { label = 'browser' } = {}) {
  const launchOptions = withStableChromeOptions(options)
  try {
    return await chromium.launch(launchOptions)
  } catch (error) {
    if (!launchOptions.channel && shouldAvoidInstalledChrome() && isBundledBrowserMissing(error)) {
      throw appendBundledBrowserHint(error, label)
    }
    if (launchOptions.channel && isChromeStartupAbort(error)) {
      return retryWithBundled((fallbackOptions) => chromium.launch(fallbackOptions), launchOptions, label, error)
    }
    throw error
  }
}
