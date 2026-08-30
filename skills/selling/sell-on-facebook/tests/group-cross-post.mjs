import assert from 'node:assert/strict'
import test from 'node:test'
import {
  buildGroupPostCaption,
  classifyGroupComposerState,
  expectedGroupApproval,
  filterGroupsForItem,
  pickGroupImages,
  validateJoinApproval,
  validateGroupPostPacket,
  validateGroupApproval,
} from '../lib/group_cross_post.mjs'

const groups = [
  { id: 'g-camera', name: 'Bangkok Camera Swap', tags: ['camera'], url: 'https://www.facebook.com/groups/example-camera' },
  { id: 'g-shoe', name: 'Bangkok Sneaker', tags: ['shoe'], url: 'https://www.facebook.com/groups/example-shoe' },
  { id: 'g-general', name: 'Huai Khwang Buy Sell', tags: ['general'], url: 'https://www.facebook.com/groups/example-general' },
]

test('filterGroupsForItem keeps category + general groups', () => {
  const picked = filterGroupsForItem(groups, { category: 'camera' })
  assert.deepEqual(picked.map((g) => g.id).sort(), ['g-camera', 'g-general'])
})

test('join approval is fail-closed without exact group ids', () => {
  const denied = validateJoinApproval({
    approvedGroupIds: ['g-camera'],
    requestedGroupIds: ['g-camera', 'g-general'],
  })
  assert.equal(denied.ok, false)
  const ok = validateJoinApproval({
    approvedGroupIds: ['g-camera', 'g-general'],
    requestedGroupIds: ['g-camera', 'g-general'],
  })
  assert.equal(ok.ok, true)
})

test('group post packet requires live marketplace url, 1-10 photos, and group ids', () => {
  const bad = validateGroupPostPacket({
    marketplaceItemUrl: '',
    overlayImagePath: '/tmp/card.png',
    approvedGroupIds: ['g-camera'],
    caption: 'x',
  })
  assert.equal(bad.ok, false)
  const good = validateGroupPostPacket({
    marketplaceItemUrl: 'https://www.facebook.com/marketplace/item/123/',
    imagePaths: ['/tmp/hook.jpg'],
    groupIds: ['g-camera'],
    caption: 'ขาย Leica D-Lux 7 ฿27,000',
  })
  assert.equal(good.ok, true)
})

test('group caption is Thai and has no emoji', () => {
  const caption = buildGroupPostCaption({
    titleTh: 'Leica D-Lux 7 สีเงิน',
    priceThb: 30000,
    conditionTh: 'สภาพดี',
    extra: 'นัดรับห้วยขวาง',
  })
  assert.match(caption, /^ส่งต่อของใช้ครับ\n/)
  assert.match(caption, /฿30,000/)
  assert.match(caption, /ห้วยขวาง/)
  assert.doesNotMatch(caption, /[\u{1F300}-\u{1FAFF}]/u)
})

test('group caption includes price, condition, Huai Khwang pickup, and marketplace url', () => {
  const caption = buildGroupPostCaption({
    titleTh: 'แท่นตัดกระดาษ A4 นัดรับห้วยขวาง',
    priceThb: 180,
    conditionTh: 'มือสอง สภาพดี',
    marketplaceItemUrl: 'https://www.facebook.com/marketplace/item/28238497012433240/',
  })
  assert.equal(
    caption,
    [
      'ส่งต่อของใช้ครับ',
      'แท่นตัดกระดาษ A4 นัดรับห้วยขวาง',
      'ราคา ฿180',
      'สภาพ: มือสอง สภาพดี',
      'นัดรับ: ห้วยขวาง',
      'https://www.facebook.com/marketplace/item/28238497012433240/',
    ].join('\n')
  )
})

test('group images cap at 10 and only normal group composers are eligible', () => {
  assert.equal(pickGroupImages(Array.from({ length: 12 }, (_, i) => `/${i}.jpg`)).length, 10)
  assert.equal(classifyGroupComposerState('Join this group to write a post'), 'skip-not-member')
  assert.equal(classifyGroupComposerState('Join group\nWrite something...'), 'ok-normal-composer')
  assert.equal(classifyGroupComposerState('Sell Something'), 'skip-buy-sell-only')
  assert.equal(classifyGroupComposerState('About\nDiscussion\nPeople'), 'fail-no-normal-composer')
})

test('group posting requires the exact live-id and ordered-group approval phrase', () => {
  const packet = {
    marketplaceItemUrl: 'https://www.facebook.com/marketplace/item/123/',
    imagePaths: ['/tmp/hook.jpg'],
    groupIds: ['g-camera', 'g-general'],
    caption: 'ขายกล้อง',
  }
  assert.equal(expectedGroupApproval(packet), 'approve-groups 123 g-camera,g-general')
  assert.equal(validateGroupApproval(packet, 'approve-groups 123 g-camera,g-general').ok, true)
  assert.equal(validateGroupApproval(packet, 'yes').ok, false)
  assert.equal(validateGroupApproval(packet, 'approve-groups 123 g-general,g-camera').ok, false)
})
