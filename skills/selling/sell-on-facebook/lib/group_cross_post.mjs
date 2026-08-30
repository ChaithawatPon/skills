const MARKETPLACE_ITEM = /^https:\/\/www\.facebook\.com\/marketplace\/item\/\d+\/?$/

export function formatThb(priceThb) {
  const n = Number(priceThb)
  if (!Number.isFinite(n) || n <= 0) return ''
  return `฿${Math.round(n).toLocaleString('en-US')}`
}

export function filterGroupsForItem(groups, { category }) {
  const tag = String(category || 'general').toLowerCase()
  return (groups || []).filter((group) => {
    const tags = (group.tags || []).map((t) => String(t).toLowerCase())
    return tags.includes(tag) || tags.includes('general')
  })
}

export function validateJoinApproval({ approvedGroupIds, requestedGroupIds }) {
  const approved = new Set(approvedGroupIds || [])
  const missing = (requestedGroupIds || []).filter((id) => !approved.has(id))
  if (missing.length) {
    return { ok: false, error: `unapproved groups: ${missing.join(', ')}` }
  }
  if (!requestedGroupIds?.length) {
    return { ok: false, error: 'requestedGroupIds is required' }
  }
  return { ok: true }
}

export function pickGroupImages(imagePaths, { limit = 10 } = {}) {
  return (imagePaths || []).filter(Boolean).slice(0, limit)
}

export function classifyGroupComposerState(pageText) {
  const text = String(pageText || '')
  if (/write something|what.?s on your mind|สร้างโพสต์|เขียนอะไร/i.test(text)) return 'ok-normal-composer'
  if (/sell something|ขายสินค้า/i.test(text)) return 'skip-buy-sell-only'
  if (/join (this )?group|join to write|ต้องเข้าร่วม|เข้าร่วมกลุ่ม/i.test(text)) return 'skip-not-member'
  return 'fail-no-normal-composer'
}

export function validateGroupPostPacket(packet) {
  if (!packet?.marketplaceItemUrl || !MARKETPLACE_ITEM.test(packet.marketplaceItemUrl)) {
    return { ok: false, error: 'marketplaceItemUrl must be a live /marketplace/item/<id>/ URL' }
  }
  const images = pickGroupImages(packet.imagePaths)
  if (images.length === 0) {
    return { ok: false, error: 'imagePaths must include 1-10 product photos' }
  }
  if (!Array.isArray(packet.groupIds || packet.approvedGroupIds) || (packet.groupIds || packet.approvedGroupIds).length === 0) {
    return { ok: false, error: 'groupIds is required' }
  }
  if (!packet.caption || !String(packet.caption).trim()) {
    return { ok: false, error: 'caption is required' }
  }
  return { ok: true }
}

export function expectedGroupApproval(packet) {
  const validation = validateGroupPostPacket(packet)
  if (!validation.ok) throw new Error(validation.error)
  const listingId = packet.marketplaceItemUrl.match(/\/item\/(\d+)\/?$/)[1]
  return `approve-groups ${listingId} ${packet.groupIds.join(',')}`
}

export function validateGroupApproval(packet, phrase) {
  const expected = expectedGroupApproval(packet)
  return {
    ok: String(phrase || '').trim() === expected,
    expected,
  }
}

export function buildGroupPostCaption({
  titleTh,
  priceThb,
  conditionTh,
  extra,
  pickup = 'ห้วยขวาง',
  marketplaceItemUrl,
} = {}) {
  const condition = String(conditionTh || '').trim()
  const lines = [
    'ส่งต่อของใช้ครับ',
    String(titleTh || '').trim(),
    `ราคา ${formatThb(priceThb)}`,
    condition ? (/^สภาพ/.test(condition) ? condition : `สภาพ: ${condition}`) : '',
    pickup ? `นัดรับ: ${pickup}` : '',
    String(marketplaceItemUrl || '').trim(),
    String(extra || '').trim(),
  ].filter(Boolean)
  return lines.join('\n')
}
