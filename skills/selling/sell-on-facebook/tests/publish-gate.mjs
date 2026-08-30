import assert from 'node:assert/strict'
import test from 'node:test'
import {
  assertPublishAuthorization,
  buildPreviewFingerprint,
  requestPublishAuthorization,
} from '../scripts/facebook_marketplace_publish.mjs'

function createPreviewSnapshot(overrides = {}) {
  return {
    stage: 'facebook-preview',
    pageUrl: 'https://www.facebook.com/marketplace/create/item/preview',
    publishButtonName: 'Publish',
    bodyExcerpt: 'Facebook preview text',
    listingType: 'item',
    title: 'Canvas tote bag',
    priceText: '฿850.00',
    condition: 'Used - Good',
    category: 'Handbags',
    photoCount: 1,
    tagChips: ['canvas tote'],
    location: 'Bangkok',
    hideFromFriends: true,
    loginWall: false,
    ...overrides,
  }
}

function toteDraft(overrides = {}) {
  return {
    listingType: 'item',
    title: 'Canvas tote bag',
    price: 850,
    condition: 'Good',
    category: 'Fashion > Handbags',
    tags: ['canvas tote'],
    ...overrides,
  }
}

function toteForm(overrides = {}) {
  return {
    title: 'Canvas tote bag',
    price: '850',
    condition: 'Used - Good',
    category: 'Handbags',
    acceptedCategory: 'Handbags',
    photoCount: 1,
    tagChips: ['canvas tote'],
    location: 'Bangkok',
    hideFromFriends: true,
    loginWall: false,
    ...overrides,
  }
}

test('publish approval is minted from sure-checks bound to the Facebook preview snapshot', () => {
  const previewSnapshot = createPreviewSnapshot()
  const { authorization, check } = requestPublishAuthorization(previewSnapshot, {
    draft: toteDraft(),
    form: toteForm(),
    displayText: 'DRAFT',
  })

  assert.equal(check.ok, true)
  assert.ok(authorization)
  assert.equal(authorization.previewFingerprint, buildPreviewFingerprint(previewSnapshot))
  assert.doesNotThrow(() => assertPublishAuthorization(authorization, previewSnapshot))
  assert.throws(
    () => assertPublishAuthorization(authorization, createPreviewSnapshot({ priceText: '฿900.00' })),
    /does not match the current Facebook preview step/
  )
})

test('sure-check miss does not mint a publish token', () => {
  const { authorization, check } = requestPublishAuthorization(createPreviewSnapshot(), {
    draft: toteDraft({ title: 'Different title' }),
    form: toteForm(),
  })
  assert.equal(authorization, null)
  assert.equal(check.ok, false)
  assert.ok(check.failures.includes('title'))
})

test('publish approval cannot be requested before a Facebook preview snapshot exists', () => {
  assert.throws(
    () => requestPublishAuthorization({ stage: 'draft-only', pageUrl: '', publishButtonName: '' }, {
      draft: toteDraft(),
      form: toteForm(),
    }),
    /may only be requested from the Facebook preview step/
  )
})
