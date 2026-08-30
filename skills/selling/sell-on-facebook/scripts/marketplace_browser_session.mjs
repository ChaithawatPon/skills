#!/usr/bin/env node
import { spawn } from 'node:child_process'
import { request } from 'node:http'
import { BROWSER_STATE_DIR } from '../lib/runtime_paths.mjs'

const port = Number(process.env.MARKETPLACE_CDP_PORT || 9222)
const cdpUrl = `http://127.0.0.1:${port}`
const profile = BROWSER_STATE_DIR
const chrome = process.env.MARKETPLACE_CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

function endpointReady() {
  return new Promise((resolve) => {
    const req = request(`${cdpUrl}/json/version`, { method: 'GET', timeout: 800 }, (response) => {
      response.resume()
      resolve(response.statusCode === 200)
    })
    req.on('timeout', () => { req.destroy(); resolve(false) })
    req.on('error', () => resolve(false))
    req.end()
  })
}

async function waitReady() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    if (await endpointReady()) return true
    await new Promise((resolve) => setTimeout(resolve, 250))
  }
  return false
}

async function start() {
  if (await endpointReady()) {
    console.log(`Marketplace Chrome already running at ${cdpUrl}`)
    return
  }
  const child = spawn(chrome, [
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profile}`,
    'https://web.facebook.com/marketplace/',
  ], { detached: true, stdio: 'ignore' })
  child.unref()
  if (!await waitReady()) throw new Error(`Chrome did not expose CDP at ${cdpUrl}`)
  console.log(`Marketplace Chrome ready at ${cdpUrl}. Log in once and keep this window open.`)
}

async function main() {
  const command = process.argv[2] || 'status'
  if (command === 'status') {
    console.log(await endpointReady() ? `running ${cdpUrl}` : `stopped ${cdpUrl}`)
    return
  }
  if (command === 'start') return start()
  throw new Error('Usage: marketplace_browser_session.mjs start|status')
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
