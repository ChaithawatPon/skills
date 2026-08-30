#!/usr/bin/env node
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { createInterface } from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'
import { dirname, join } from 'node:path'
import { OPERATOR_PROFILE_PATH } from '../lib/runtime_paths.mjs'
import { validateOperatorProfile } from '../lib/operator_profile.mjs'

async function ask(rl, label, fallback = '') {
  const answer = (await rl.question(`${label}${fallback ? ` [${fallback}]` : ''}: `)).trim()
  return answer || fallback
}

async function setup() {
  let existing = {}
  try { existing = JSON.parse(await readFile(OPERATOR_PROFILE_PATH, 'utf8')) } catch {}
  const rl = createInterface({ input, output })
  try {
    console.log('Sell-on-Facebook first-run setup. Do not enter passwords, cookies, tokens, or account numbers.')
    const country = await ask(rl, 'Country', existing.country || '')
    const city = await ask(rl, 'City', existing.city || '')
    const area = await ask(rl, 'Area or pickup zone (optional)', existing.area || '')
    const radius = Number(await ask(rl, 'Search radius in km', String(existing.radius_km || 15)))
    const language = await ask(rl, 'Buyer language', existing.language || 'en')
    const fulfillmentText = await ask(rl, 'Fulfillment (pickup, shipping, or pickup,shipping)', (existing.fulfillment || ['pickup']).join(','))
    const profile = {
      country, city, ...(area ? { area } : {}), radius_km: radius, language,
      fulfillment: fulfillmentText.split(',').map((value) => value.trim()).filter(Boolean),
      updated_at: new Date().toISOString(),
    }
    const validation = validateOperatorProfile(profile)
    if (!validation.ok) throw new Error(validation.errors.join('\n'))
    await mkdir(dirname(OPERATOR_PROFILE_PATH), { recursive: true })
    await writeFile(OPERATOR_PROFILE_PATH, `${JSON.stringify(profile, null, 2)}\n`, { mode: 0o600 })
    console.log(`Saved private operator profile: ${OPERATOR_PROFILE_PATH}`)
    return profile
  } finally { rl.close() }
}

if (import.meta.url === `file://${process.argv[1]}`) setup().catch((error) => { console.error(`Setup failed: ${error.message}`); process.exit(1) })

export { setup }
