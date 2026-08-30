#!/usr/bin/env node
/**
 * Verify that no API keys are required or used anywhere in this skill.
 * This skill is pure browser automation against the Facebook Marketplace UI.
 *
 * Usage:
 *   npm run verify:no-api
 */

import { readFileSync } from 'fs'
import { resolve, dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

const API_PATTERNS = [
  /GEMINI_API_KEY/,
  /OPENAI_API_KEY/,
  /ANTHROPIC_API_KEY/,
  /FACEBOOK_ACCESS_TOKEN/,
  /FACEBOOK_API_KEY/,
  /X_API_KEY|TWITTER_API_KEY/,
  /GOOGLE_API_KEY|GOOGLE_SEARCH_API/,
  /SEARCH_ENGINE_ID|CSE_ID/,
  /fetch\s*\(\s*["'](https?:\/\/)?api\./i,
  /axios\s*\.\s*(get|post)\s*\(\s*["'](https?:\/\/)?api\./i,
]

function main() {
  console.log('Verifying: no API keys in sell-on-facebook scripts...\n')

  const scripts = [
    'scripts/facebook_marketplace_draft.mjs',
    'scripts/facebook_marketplace_inbox.mjs',
    'scripts/facebook_marketplace_inventory.mjs',
    'scripts/facebook_marketplace_maintenance.mjs',
    'scripts/facebook_marketplace_autopilot.mjs',
    'scripts/facebook_marketplace_publish.mjs',
    'lib/marketplace_draft.mjs',
    'lib/publish_sure.mjs',
    'lib/duplicate_listings.mjs',
    'lib/facebook_form.mjs',
    'lib/listing_facts.mjs',
    'lib/browser_launch.mjs',
    'lib/runtime_paths.mjs',
    'scripts/write_listing_facts.mjs',
    'lib/overlay_card.mjs',
    'lib/group_cross_post.mjs',
    'lib/image_sort.mjs',
    'scripts/overlay_card.mjs',
    'scripts/group_cross_post.mjs',
    'scripts/sort_images.mjs',
    'scripts/render_overlay.py',
  ]

  let passed = true

  for (const script of scripts) {
    try {
      const content = readFileSync(join(ROOT, script), 'utf-8')

      for (const pattern of API_PATTERNS) {
        if (pattern.test(content)) {
          console.log(`✗ FAIL: ${script} contains API pattern: ${pattern}`)
          passed = false
        }
      }

      if (!passed) continue
      console.log(`✓ PASS: ${script}`)
    } catch (e) {
      console.log(`⚠️  ${script}: not found or unreadable`)
    }
  }

  console.log()
  if (passed) {
    console.log('✓ Verification passed: no API keys detected.')
    process.exit(0)
  } else {
    console.log('✗ Verification failed: API keys found!')
    process.exit(1)
  }
}

const isMain = resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))
if (isMain) main()
