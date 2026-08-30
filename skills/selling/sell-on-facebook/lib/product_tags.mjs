export const MAX_PRODUCT_TAGS = 20

export function normalizeProductTags(tags) {
  if (!Array.isArray(tags)) return []
  return [...new Set(tags.map((tag) => String(tag || '').trim()).filter(Boolean))]
}

export function validateProductTags(tags) {
  const normalized = normalizeProductTags(tags)
  const errors = []
  if (normalized.length === 0) errors.push('metadata.tags must contain at least one relevant product tag')
  if (normalized.length > MAX_PRODUCT_TAGS) {
    errors.push(`metadata.tags must contain no more than ${MAX_PRODUCT_TAGS} unique product tags`)
  }
  return { isValid: errors.length === 0, errors, tags: normalized }
}
