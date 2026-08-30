#!/usr/bin/env node
/**
 * Write local listing-facts markdown for later Marketplace inbox replies.
 *
 *   node scripts/write_listing_facts.mjs --from-json references/listings/a4-paper-cutter.json \
 *     --photo-folder /path/to/a4-paper-cutter [--url URL] [--id ID] [--status live]
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { writeListingFacts } from '../lib/listing_facts.mjs'

function parseArgs(argv) {
  const out = { fromJson: '', photoFolder: '', url: '', id: '', status: 'draft', category: '' }
  for (let index = 0; index < argv.length; index += 1) {
    const key = argv[index]
    const value = argv[index + 1] || ''
    if (key === '--from-json') { out.fromJson = value; index += 1 }
    else if (key === '--photo-folder') { out.photoFolder = value; index += 1 }
    else if (key === '--url') { out.url = value; index += 1 }
    else if (key === '--id') { out.id = value; index += 1 }
    else if (key === '--status') { out.status = value; index += 1 }
    else if (key === '--category') { out.category = value; index += 1 }
  }
  return out
}

function main() {
  const args = parseArgs(process.argv.slice(2))
  if (!args.fromJson) {
    console.error('Usage: node scripts/write_listing_facts.mjs --from-json <listing.json> [--photo-folder <dir>] [--url <item-url>] [--id <id>] [--status draft|live]')
    process.exit(1)
  }

  const raw = JSON.parse(readFileSync(resolve(args.fromJson), 'utf8'))
  const facebookCondition = {
    'Like New': 'Used - Like New',
    'Excellent': 'Used - Like New',
    'Good': 'Used - Good',
    'Fair': 'Used - Fair',
  }[raw.condition] || raw.condition

  const target = writeListingFacts({
    folder: raw.folder || '',
    title: raw.title || '',
    status: args.status,
    price_thb: raw.price_thb || '',
    condition: raw.condition || '',
    facebook_condition: facebookCondition,
    category: args.category || raw.category || '',
    size: raw.size || '',
    includes: (raw.description || '').split('\n').find((line) => line.startsWith('รวม:'))?.replace(/^รวม:\s*/, '') || '',
    meetup: (raw.description || '').split('\n').find((line) => line.startsWith('นัดรับ:'))?.replace(/^นัดรับ:\s*/, '') || '',
    shipping: (raw.description || '').split('\n').find((line) => line.startsWith('ไม่รวมส่ง') || line.startsWith('ส่ง')) || '',
    marketplace_url: args.url,
    listing_id: args.id,
    description: raw.description || '',
    photo_folder: args.photoFolder ? resolve(args.photoFolder) : '',
  })
  console.log(`Wrote listing facts: ${target}`)
}

const isMain = resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))
if (isMain) main()
