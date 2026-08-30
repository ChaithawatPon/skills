import assert from 'node:assert/strict'
import test from 'node:test'
import {
  describeFormBlock,
  FACEBOOK_AVAILABILITY,
  facebookCategoryLeaf,
  facebookCategoryPath,
  facebookConditionLabel,
  listingPhotoWaitTarget,
  NEXT_ENABLE_WAIT_MS,
  nextCategoryAttempt,
  pickListingFileInputIndex,
} from '../lib/facebook_form.mjs'

test('maps skill labels to Facebook create-item labels', () => {
  assert.equal(facebookConditionLabel('Good'), 'Used - Good')
  assert.equal(facebookConditionLabel('Like New'), 'Used - Like New')
  assert.equal(facebookCategoryLeaf('Home > Household Items'), 'Household')
  assert.equal(facebookCategoryLeaf('Electronics > Cameras'), 'Cameras')
  assert.deepEqual(facebookCategoryPath('Electronics > Cameras'), ['Electronics & computers'])
  assert.deepEqual(facebookCategoryPath('Home > Household Items'), ['Household'])
  assert.equal(FACEBOOK_AVAILABILITY, 'List as Single Item')
})

test('form-block dump names empty required fields', () => {
  assert.deepEqual(
    describeFormBlock({ title: '', price: '', category: 'Category', condition: 'Condition', description: '', nextEnabled: false }),
    ['title', 'price', 'category', 'condition', 'description', 'next']
  )
  assert.deepEqual(
    describeFormBlock({ title: 'แท่นตัดกระดาษ A4', price: '220', category: 'Household', condition: 'Used - Good', description: 'ขาย', nextEnabled: true }),
    []
  )
})

test('photo wait targets all uploaded thumbs, not a 3-thumb cap', () => {
  assert.equal(listingPhotoWaitTarget(10), 10)
  assert.equal(listingPhotoWaitTarget(1), 1)
  assert.equal(listingPhotoWaitTarget(0), 1)
  assert.equal(NEXT_ENABLE_WAIT_MS, 180000)
})

test('picks the multi image input, not the phone-upload first() control', () => {
  assert.equal(
    pickListingFileInputIndex([
      { multiple: false, accept: 'image/*' },
      { multiple: true, accept: 'image/*,image/heic,video/*' },
    ]),
    1
  )
  assert.equal(pickListingFileInputIndex([{ multiple: false, accept: 'image/*' }]), 0)
  assert.equal(pickListingFileInputIndex([]), -1)
})

test('category retry clicks Household then Tools then stops', () => {
  assert.deepEqual(
    nextCategoryAttempt({ attempted: [], nextEnabled: false }),
    { action: 'click', leaf: 'Household' }
  )
  assert.deepEqual(
    nextCategoryAttempt({ attempted: ['Household'], nextEnabled: true }),
    { action: 'advance', leaf: 'Household' }
  )
  assert.deepEqual(
    nextCategoryAttempt({ attempted: ['Household'], nextEnabled: false }),
    { action: 'click', leaf: 'Tools' }
  )
  assert.deepEqual(
    nextCategoryAttempt({ attempted: ['Household', 'Tools'], nextEnabled: true }),
    { action: 'advance', leaf: 'Tools' }
  )
  assert.deepEqual(
    nextCategoryAttempt({ attempted: ['Household', 'Tools'], nextEnabled: false }),
    { action: 'form-block', leaf: 'Tools' }
  )
})
