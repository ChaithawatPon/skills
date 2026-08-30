import { facebookCategoryLeaf, facebookConditionLabel } from './facebook_form.mjs'
import { validateProductTags } from './product_tags.mjs'

function normalize(value) {
  return String(value || '')
    .normalize('NFC')
    .replace(/\u0e4d\u0e32/g, '\u0e33')
    .replace(/\s+/g, ' ')
    .trim()
}

function fieldValue(value, labels = []) {
  let text = normalize(value)
  for (const label of labels) {
    text = text.replace(new RegExp(`^${label}\\s*`, 'i'), '')
  }
  return normalize(text)
}

export function pricesMatch(price, priceText) {
  const expected = Number(price)
  const parsed = Number(String(priceText || '').replace(/[^\d.]/g, ''))
  if (!Number.isFinite(expected) || !Number.isFinite(parsed) || expected <= 0) return false
  return Math.round(expected) === Math.round(parsed)
}

export function evaluatePublishSureChecks({ snapshot = {}, draft = {}, form = {} } = {}) {
  const failures = []
  if (normalize(snapshot.stage) !== 'facebook-preview') failures.push('stage')
  if (!normalize(snapshot.publishButtonName)) failures.push('publish-button')
  if (normalize(snapshot.listingType || draft.listingType) !== 'item') failures.push('listing-type')
  if (normalize(form.title || snapshot.title) !== normalize(draft.title)) failures.push('title')
  if (!pricesMatch(draft.price, form.price || snapshot.priceText)) failures.push('price')

  const expectedCondition = facebookConditionLabel(draft.condition)
  const seenCondition = fieldValue(form.condition || snapshot.condition, ['condition', 'สภาพ'])
  if (seenCondition !== normalize(expectedCondition)) failures.push('condition')

  const expectedCategory = form.acceptedCategory || facebookCategoryLeaf(draft.category)
  const seenCategory = fieldValue(form.category || snapshot.category, ['category', 'หมวดหมู่'])
  if (seenCategory.toLowerCase() !== normalize(expectedCategory).toLowerCase()) {
    failures.push('category')
  }

  const photoCount = Number(form.photoCount ?? snapshot.photoCount ?? 0)
  if (!Number.isFinite(photoCount) || photoCount < 1) failures.push('photos')

  if (form.loginWall || snapshot.loginWall) failures.push('login-wall')
  if (form.hideFromFriends !== true && snapshot.hideFromFriends !== true) failures.push('hide-from-friends')
  if (!/กรุงเทพ|bangkok/i.test(normalize(form.location || snapshot.location))) failures.push('location')

  const tagValidation = validateProductTags(draft.tags)
  if (!tagValidation.isValid) failures.push('tags')
  const sourceChips = Array.isArray(form.tagChips) && form.tagChips.length > 0
    ? form.tagChips
    : snapshot.tagChips
  const chips = (sourceChips || []).map((tag) => normalize(tag).toLowerCase())
  const acceptedChips = [...new Set(chips.filter(Boolean))]
  if (acceptedChips.length < 1 || acceptedChips.length > 20) failures.push('tags')
  const allowMissingTagChips = process.env.MARKETPLACE_ALLOW_MISSING_TAG_CHIPS === '1'
  if (!allowMissingTagChips && acceptedChips.length === 0) {
    failures.push('tag-chips')
  }

  return { ok: failures.length === 0, failures }
}
