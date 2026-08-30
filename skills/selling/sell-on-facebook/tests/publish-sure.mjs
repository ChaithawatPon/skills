import assert from 'node:assert/strict'
import test from 'node:test'
import { evaluatePublishSureChecks, pricesMatch } from '../lib/publish_sure.mjs'

function draft(overrides = {}) {
  return {
    listingType: 'item',
    title: 'แท่นตัดกระดาษ A4',
    price: 220,
    condition: 'Good',
    category: 'Home > Household Items',
    tags: ['แท่นตัดกระดาษ', 'A4'],
    ...overrides,
  }
}

function snapshot(overrides = {}) {
  return {
    stage: 'facebook-preview',
    publishButtonName: 'Publish',
    listingType: 'item',
    title: 'แท่นตัดกระดาษ A4',
    priceText: '฿220.00',
    condition: 'Used - Good',
    category: 'Household',
    photoCount: 10,
    tagChips: ['แท่นตัดกระดาษ', 'A4'],
    hideFromFriends: true,
    location: 'Bangkok',
    loginWall: false,
    ...overrides,
  }
}

test('pricesMatch accepts baht text and whole numbers', () => {
  assert.equal(pricesMatch(220, '฿220.00'), true)
  assert.equal(pricesMatch(220, '220'), true)
  assert.equal(pricesMatch(220, '฿221'), false)
})

test('sure checks pass when preview, fields, photos, and tag chips match', () => {
  const result = evaluatePublishSureChecks({ snapshot: snapshot(), draft: draft() })
  assert.deepEqual(result, { ok: true, failures: [] })
})

test('sure checks accept one snapshot chip when form chip reader misses preview-visible tags', () => {
  const result = evaluatePublishSureChecks({
    snapshot: snapshot({ tagChips: ['Nike'] }),
    draft: draft({ tags: ['Nike', 'Jordan 1 Mid'] }),
    form: { tagChips: [] },
  })
  assert.deepEqual(result, { ok: true, failures: [] })
})

test('sure checks fail closed on zero tag chips, login wall, or zero photos', () => {
  assert.ok(evaluatePublishSureChecks({ snapshot: snapshot({ tagChips: [] }), draft: draft() }).failures.includes('tag-chips'))
  assert.ok(evaluatePublishSureChecks({ snapshot: snapshot({ loginWall: true }), draft: draft() }).failures.includes('login-wall'))
  assert.ok(evaluatePublishSureChecks({ snapshot: snapshot({ photoCount: 0 }), draft: draft() }).failures.includes('photos'))
})

test('sure checks fail closed when Hide from friends is not verified on', () => {
  const result = evaluatePublishSureChecks({
    snapshot: snapshot({ hideFromFriends: false }),
    draft: draft(),
  })
  assert.equal(result.ok, false)
  assert.ok(result.failures.includes('hide-from-friends'))
})

test('sure checks fail closed when product tags are empty or exceed 20', () => {
  const result = evaluatePublishSureChecks({
    snapshot: snapshot({ tagChips: [] }),
    draft: draft({ tags: [] }),
  })
  assert.equal(result.ok, false)
  assert.ok(result.failures.includes('tags'))

  const tooMany = Array.from({ length: 21 }, (_, index) => `tag-${index}`)
  const excessive = evaluatePublishSureChecks({
    snapshot: snapshot({ tagChips: tooMany }),
    draft: draft({ tags: tooMany }),
  })
  assert.equal(excessive.ok, false)
  assert.ok(excessive.failures.includes('tags'))
})

test('Tools retry is sure when acceptedCategory matches the form', () => {
  const result = evaluatePublishSureChecks({
    snapshot: snapshot({ category: 'Tools' }),
    draft: draft(),
    form: { acceptedCategory: 'Tools', category: 'Tools' },
  })
  assert.equal(result.ok, true)
})
