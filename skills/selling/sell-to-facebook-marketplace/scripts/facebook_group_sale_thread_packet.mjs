#!/usr/bin/env node
import { readFile, mkdir, writeFile, readdir } from 'node:fs/promises'
import { resolve, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { OUTPUT_DIR, timestampSlug } from '../lib/runtime_paths.mjs'

const HEADLINE = 'ขายของย้ายหอ'

function canonicalizeListingUrl(rawUrl) {
  try {
    const url = new URL(String(rawUrl || ''), 'https://www.facebook.com')
    const match = url.pathname.match(/^\/marketplace\/item\/(\d+)(?:\/|$)/)
    if (!match || !/(^|\.)facebook\.com$/i.test(url.hostname)) return null
    return { listingId: match[1], listingUrl: `https://www.facebook.com/marketplace/item/${match[1]}/` }
  } catch {
    return null
  }
}

function normalizeInventory(input, { photoRoot = null } = {}) {
  const items = Array.isArray(input) ? input : input.items || input.listings || input.activeListings
  if (!Array.isArray(items) || !items.length) throw new Error('inventory must contain a non-empty items, listings, or activeListings array')
  const liveItems = items.filter((item) => String(item.status || '').toLowerCase() === 'live')
  if (!liveItems.length) throw new Error('inventory has no verified live Marketplace listings')
  return liveItems.map((item) => {
    const canonical = canonicalizeListingUrl(item.marketplace_url || item.listingUrl || item.url)
    const photos = (item.photos || item.photoFiles || []).map((photo) => {
      if (typeof photo === 'string') return photo
      if (!photoRoot || !photo.file) return null
      return join(photoRoot, photo.file)
    }).filter(Boolean).slice(0, 10)
    if (!canonical) throw new Error('every item must have a canonical Marketplace listing URL')
    if (item.marketplace_listing_id && String(item.marketplace_listing_id) !== canonical.listingId) throw new Error(`item ${canonical.listingId} has a mismatched Marketplace ID`)
    if (!Number.isInteger(item.price_thb ?? item.priceThb ?? item.price) || (item.price_thb ?? item.priceThb ?? item.price) <= 0) throw new Error(`item ${canonical.listingId} needs an exact positive THB price`)
    if (!Array.isArray(photos) || photos.length < 1) throw new Error(`item ${canonical.listingId} needs at least one truthful photo path`)
    if (!String(item.title || '').trim()) throw new Error(`item ${canonical.listingId} needs a verified title`)
    return {
      ...canonical,
      title: String(item.title).trim(),
      priceThb: item.price_thb ?? item.priceThb ?? item.price,
      photos,
      comment: `${String(item.title).trim()} — ${item.price_thb ?? item.priceThb ?? item.price} บาท\n${canonical.listingUrl}`,
    }
  })
}

function readArg(flag) {
  const index = process.argv.indexOf(flag)
  return index === -1 ? null : process.argv[index + 1]
}

async function loadInventory({ inventoryPath, inventoryDir }) {
  if (inventoryPath) return JSON.parse(await readFile(resolve(inventoryPath), 'utf8'))
  if (!inventoryDir) throw new Error('inventory or inventory-dir is required')
  const entries = await readdir(resolve(inventoryDir), { withFileTypes: true })
  const manifests = await Promise.all(entries.filter((entry) => entry.isDirectory()).map(async (entry) => {
    const path = join(resolve(inventoryDir), entry.name, 'listing.json')
    try { return JSON.parse(await readFile(path, 'utf8')) } catch { return null }
  }))
  return { items: manifests.filter(Boolean) }
}

async function buildPacket({ inventoryPath, inventoryDir, photoRoot, groupId, groupName }) {
  if (!/^[0-9]+$/.test(String(groupId || ''))) throw new Error('group-id must be numeric')
  if (!String(groupName || '').trim()) throw new Error('group-name is required')
  const inventory = await loadInventory({ inventoryPath, inventoryDir })
  const items = normalizeInventory(inventory, { photoRoot })
  const now = new Date()
  const expires = new Date(now.getTime() + 30 * 60 * 1000)
  const packet = {
    packetId: `FGST-${timestampSlug(now).slice(0, 10).replace(/-/g, '')}-01`,
    createdAt: now.toISOString(),
    expiresAt: expires.toISOString(),
    group: { id: String(groupId), name: String(groupName).trim(), url: `https://www.facebook.com/groups/${groupId}/` },
    announcement: { text: HEADLINE, background: 'red', composer: 'normal_group_post' },
    items,
    excludedItemCount: (Array.isArray(inventory) ? inventory : inventory.items || inventory.listings || inventory.activeListings).length - items.length,
    approval: `approve-group-sale-thread <packet_id> ${groupId} <listing_id,listing_id,...>`,
    status: 'draft_requires_live_preflight_and_exact_approval',
  }
  await mkdir(OUTPUT_DIR, { recursive: true })
  const outputPath = join(OUTPUT_DIR, `${timestampSlug(now)}-group-sale-thread-packet.json`)
  await writeFile(outputPath, `${JSON.stringify(packet, null, 2)}\n`, 'utf8')
  return { packet, outputPath }
}

async function main() {
  if (process.argv.includes('--self-test')) {
    const items = normalizeInventory([{ status: 'live', listingUrl: '/marketplace/item/123/', title: 'Desk lamp', price: 200, photos: ['lamp.jpg'] }])
    if (items[0].comment !== 'Desk lamp — 200 บาท\nhttps://www.facebook.com/marketplace/item/123/') throw new Error('comment generation changed unexpectedly')
    console.log('✓ facebook_group_sale_thread_packet.mjs self-test passed')
    return
  }
  const inventoryPath = readArg('--inventory')
  const inventoryDir = readArg('--inventory-dir')
  const photoRoot = readArg('--photo-root')
  const groupId = readArg('--group-id')
  const groupName = readArg('--group-name')
  if ((!inventoryPath && !inventoryDir) || !groupId || !groupName) throw new Error('Usage: --inventory <file> | --inventory-dir <items-dir>, --group-id <id> --group-name <name>')
  const { packet, outputPath } = await buildPacket({ inventoryPath, inventoryDir, photoRoot, groupId, groupName })
  console.log(JSON.stringify({ packetId: packet.packetId, outputPath, itemCount: packet.items.length, status: packet.status }, null, 2))
}

const isMain = resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))
if (isMain) main().catch((error) => { console.error(`Group sale-thread packet failed: ${error.message}`); process.exit(1) })

export { HEADLINE, canonicalizeListingUrl, normalizeInventory, loadInventory, buildPacket }
