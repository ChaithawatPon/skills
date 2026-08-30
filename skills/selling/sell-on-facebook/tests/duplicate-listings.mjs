import assert from 'node:assert/strict'
import test from 'node:test'
import { findDuplicateAction } from '../lib/duplicate_listings.mjs'

const rows = [
  { listingId: '111', title: 'แท่นตัดกระดาษ A4', priceThb: 220 },
  { listingId: '222', title: 'แท่นตัดกระดาษ A4', priceThb: 220 },
  { listingId: '333', title: 'แท่นตัดกระดาษ A4', priceThb: 250 },
]

test('zero old title+price matches skips delete', () => {
  const result = findDuplicateAction(rows, { title: 'Other', priceThb: 220, excludeId: '999' })
  assert.equal(result.action, 'skip')
})

test('exactly one old title+price match asks for yes-delete', () => {
  const result = findDuplicateAction(rows, { title: 'แท่นตัดกระดาษ A4', priceThb: 220, excludeId: '111' })
  assert.equal(result.action, 'confirm-delete')
  assert.equal(result.match.listingId, '222')
})

test('two old title+price matches stop with no delete', () => {
  const result = findDuplicateAction(rows, { title: 'แท่นตัดกระดาษ A4', priceThb: 220, excludeId: '999' })
  assert.equal(result.action, 'stop')
  assert.equal(result.matches.length, 2)
})
