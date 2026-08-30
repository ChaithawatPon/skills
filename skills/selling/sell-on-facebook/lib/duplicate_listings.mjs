function normalize(value) {
  return String(value || '').replace(/\s+/g, ' ').trim().toLowerCase()
}

export function parsePriceThb(value) {
  const parsed = Number(String(value || '').replace(/[^\d.]/g, ''))
  return Number.isFinite(parsed) ? Math.round(parsed) : null
}

export function findDuplicateAction(rows, { title, priceThb, excludeId } = {}) {
  const wantTitle = normalize(title)
  const wantPrice = parsePriceThb(priceThb)
  const exclude = String(excludeId || '')
  const matches = (rows || []).filter((row) => {
    if (!wantTitle || wantPrice == null) return false
    if (exclude && String(row.listingId || '') === exclude) return false
    return normalize(row.title) === wantTitle && parsePriceThb(row.priceThb ?? row.price) === wantPrice
  })
  if (matches.length === 0) return { action: 'skip', matches }
  if (matches.length === 1) return { action: 'confirm-delete', match: matches[0], matches }
  return { action: 'stop', matches }
}
