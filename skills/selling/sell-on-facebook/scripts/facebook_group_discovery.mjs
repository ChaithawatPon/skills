#!/usr/bin/env node
import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'
import { launchPersistentContext } from '../lib/browser_launch.mjs'
import { BROWSER_STATE_DIR, STATE_DIR } from '../lib/runtime_paths.mjs'
import { requireOperatorProfile } from '../lib/operator_profile.mjs'

const args = process.argv.slice(2)
const flag = (name, fallback = '') => {
  const index = args.indexOf(`--${name}`)
  return index >= 0 ? (args[index + 1] || fallback) : fallback
}

function queryTerms({ category, brand, profile }) {
  const location = [profile.area, profile.city, profile.country].filter(Boolean).join(' ')
  return [...new Set([
    [brand, category, location].filter(Boolean).join(' '),
    [category, profile.city].filter(Boolean).join(' '),
    [category, profile.country].filter(Boolean).join(' '),
  ].filter(Boolean))]
}

function normalizeUrl(href) {
  try {
    const url = new URL(href, 'https://www.facebook.com')
    const match = url.pathname.match(/^\/groups\/([^/]+)/)
    return match ? `https://www.facebook.com/groups/${match[1]}/` : null
  } catch { return null }
}

function scoreGroup(group, profile, category) {
  const text = `${group.name} ${group.activityText}`.toLowerCase()
  let score = 0
  if (text.includes(String(category).toLowerCase())) score += 35
  if (text.includes(String(profile.city).toLowerCase())) score += 25
  if (profile.area && text.includes(String(profile.area).toLowerCase())) score += 10
  if (/(active|recent|โพสต์ใหม่|วันนี้|เมื่อวาน|สมาชิก)/i.test(text)) score += 15
  if (group.normalComposer) score += 15
  if (group.sellComposerOnly) score -= 60
  return score
}

async function discoverGroups({ category, brand = '' } = {}) {
  const profile = requireOperatorProfile()
  if (!category) throw new Error('Usage: npm run groups:discover -- --category <category> [--brand <brand>]')
  const context = await launchPersistentContext(chromium, BROWSER_STATE_DIR, { headless: false, channel: 'chrome' }, { label: 'facebook-group-discovery' })
  const page = context.pages()[0] || await context.newPage()
  const candidates = new Map()
  try {
    for (const term of queryTerms({ category, brand, profile })) {
      const url = `https://www.facebook.com/search/groups/?q=${encodeURIComponent(term)}`
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 })
      await page.waitForTimeout(1600)
      const links = await page.locator('a[href*="/groups/"]').evaluateAll((anchors) => anchors.map((anchor) => ({ href: anchor.href, text: anchor.innerText })).filter((item) => item.text.trim()))
      for (const item of links) {
        const groupUrl = normalizeUrl(item.href)
        if (!groupUrl) continue
        const id = groupUrl.split('/').filter(Boolean).pop()
        candidates.set(id, { id, url: groupUrl, name: item.text.trim(), foundBy: [...(candidates.get(id)?.foundBy || []), term] })
      }
    }
    const groups = []
    for (const candidate of candidates.values()) {
      await page.goto(candidate.url, { waitUntil: 'domcontentloaded', timeout: 90000 }).catch(() => {})
      await page.waitForTimeout(700)
      const body = await page.locator('body').innerText().catch(() => '')
      const normalComposer = /write something|what.?s on your mind|สร้างโพสต์|เขียนอะไรบางอย่าง/i.test(body)
      const sellComposerOnly = /sell something/i.test(body) && !normalComposer
      const group = { ...candidate, activityText: body.slice(0, 1200), normalComposer, sellComposerOnly }
      group.score = scoreGroup(group, profile, category)
      if (normalComposer && !sellComposerOnly) groups.push(group)
    }
    groups.sort((a, b) => b.score - a.score)
    const catalog = { generated_at: new Date().toISOString(), profile: { country: profile.country, city: profile.city, area: profile.area || '', radius_km: profile.radius_km, language: profile.language, fulfillment: profile.fulfillment }, category, brand, groups: groups.slice(0, 20).map(({ activityText, ...group }) => group) }
    await mkdir(STATE_DIR, { recursive: true })
    const outputPath = resolve(STATE_DIR, 'discovered-groups.json')
    await writeFile(outputPath, `${JSON.stringify(catalog, null, 2)}\n`, { mode: 0o600 })
    console.log(JSON.stringify({ status: 'discovered', candidateCount: groups.length, outputPath, groups: catalog.groups }, null, 2))
    return catalog
  } finally { await context.close() }
}

if (resolve(process.argv[1] || '') === resolve(fileURLToPath(import.meta.url))) discoverGroups({ category: flag('category'), brand: flag('brand') }).catch((error) => { console.error(`Group discovery failed: ${error.message}`); process.exit(1) })

export { discoverGroups, queryTerms, scoreGroup }
