import assert from 'node:assert/strict'
import test from 'node:test'
import { queryTerms, scoreGroup } from '../scripts/facebook_group_discovery.mjs'
import { validateOperatorProfile } from '../lib/operator_profile.mjs'

test('operator profile requires location and fulfillment settings', () => {
  assert.equal(validateOperatorProfile({ country: 'Thailand', city: 'Bangkok', language: 'th', radius_km: 15, fulfillment: ['pickup'] }).ok, true)
  assert.equal(validateOperatorProfile({ country: '', city: 'Bangkok', language: 'th', radius_km: 15, fulfillment: ['pickup'] }).ok, false)
})

test('group discovery builds location-aware search terms and scores fit', () => {
  const profile = { country: 'Thailand', city: 'Bangkok', area: 'Huai Khwang' }
  assert.ok(queryTerms({ category: 'camera', brand: 'Leica', profile }).some((term) => term.includes('Bangkok')))
  assert.ok(scoreGroup({ name: 'Bangkok Camera Group', activityText: 'active members', normalComposer: true, sellComposerOnly: false }, profile, 'camera') > 50)
  assert.ok(scoreGroup({ name: 'Marketplace only', activityText: 'Sell Something', normalComposer: false, sellComposerOnly: true }, profile, 'camera') < 0)
})
