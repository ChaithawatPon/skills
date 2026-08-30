#!/usr/bin/env node
/**
 * Approval-gated Facebook group cross-post planner.
 * Does not join groups or publish. Live send needs a later approved packet.
 *
 * Usage:
 *   node scripts/group_cross_post.mjs plan --category camera --groups references/bangkok_selling_groups.example.json
 *   node scripts/group_cross_post.mjs --self-test
 */

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  buildGroupPostCaption,
  filterGroupsForItem,
  validateGroupPostPacket,
  validateJoinApproval,
} from '../lib/group_cross_post.mjs'

const args = process.argv.slice(2)
const SELF_TEST = args.includes('--self-test')

function flag(name, fallback = '') {
  const idx = args.indexOf(`--${name}`)
  if (idx === -1 || !args[idx + 1]) return fallback
  return args[idx + 1]
}

function selfTest() {
  const groups = [
    { id: 'g-camera', tags: ['camera'] },
    { id: 'g-general', tags: ['general'] },
  ]
  const picked = filterGroupsForItem(groups, { category: 'camera' })
  if (picked.length !== 2) throw new Error('filter failed')
  const denied = validateJoinApproval({
    approvedGroupIds: ['g-camera'],
    requestedGroupIds: ['g-camera', 'g-general'],
  })
  if (denied.ok) throw new Error('approval should fail-closed')
  const packet = validateGroupPostPacket({
    marketplaceItemUrl: 'https://www.facebook.com/marketplace/item/1/',
    imagePaths: ['/tmp/hook.jpg'],
    groupIds: ['g-camera'],
    caption: buildGroupPostCaption({ titleTh: 'กล้อง', priceThb: 1000, conditionTh: 'สภาพดี' }),
  })
  if (!packet.ok) throw new Error(packet.error)
  console.log('✓ group_cross_post.mjs self-test passed')
}

function main() {
  if (SELF_TEST) return selfTest()

  const cmd = args[0] || 'plan'
  if (cmd !== 'plan') {
    console.error('Only `plan` is implemented. Live join/post is approval-gated and not wired.')
    process.exit(1)
  }

  const groupsPath = resolve(flag('groups', 'references/bangkok_selling_groups.example.json'))
  const catalog = JSON.parse(readFileSync(groupsPath, 'utf8'))
  const category = flag('category', 'general')
  const picked = filterGroupsForItem(catalog.groups || catalog, { category })
  console.log(`category: ${category}`)
  console.log(`candidates: ${picked.length}`)
  for (const group of picked) {
    console.log(`- ${group.id}  ${group.name || ''}  ${(group.tags || []).join(',')}`)
  }
  console.log('Next: the operator lists exact group ids to approve, then a live packet can be built.')
  console.log('Do not join or post until that approval exists.')
}

const isMain = resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))
if (isMain) main()
