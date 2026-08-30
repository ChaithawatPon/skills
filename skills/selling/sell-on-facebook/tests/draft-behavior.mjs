import assert from 'node:assert/strict'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import test from 'node:test'
import { draftListing, loadMetadataFile, orderImagesWithHook, resolveHookFile, validateListing, validateMetadata } from '../lib/marketplace_draft.mjs'

function withTempDir(callback) {
  const dir = mkdtempSync('/private/tmp/marketplace-draft-test-')
  try {
    return callback(dir)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}

test('draftListing requires explicit metadata and does not infer claims from filenames', () => {
  withTempDir((dir) => {
    writeFileSync(join(dir, 'mint-phone-no-cracks.jpg'), 'not-an-image')
    assert.throws(() => draftListing(dir, 1500), /Metadata validation failed/)
  })
})
test('draftListing uses explicit metadata without filename inference', () => {
  withTempDir((dir) => {
    const imagePath = join(dir, 'leather-bag-working-perfectly.jpg')
    const metadataPath = join(dir, 'metadata.json')
    writeFileSync(imagePath, 'not-an-image')
    writeFileSync(metadataPath, JSON.stringify({
      listingType: 'item',
      title: 'Canvas tote bag',
      category: 'Fashion > Handbags',
      condition: 'Fair',
      description: 'Canvas tote bag only. Wear is visible in the photos.',
      tags: ['กระเป๋าผ้า', 'canvas tote'],
    }))

    const listing = draftListing(dir, 850, loadMetadataFile(metadataPath))
    assert.equal(listing.title, 'Canvas tote bag')
    assert.equal(listing.condition, 'Fair')
    assert.equal(listing.description, 'Canvas tote bag only. Wear is visible in the photos.')
    assert.deepEqual(listing.imageEvidence.imageFileNames, ['leather-bag-working-perfectly.jpg'])
    assert.equal(validateListing(listing).isValid, true)
  })
})

test('draftListing rejects unsupported listing types in metadata', () => {
  withTempDir((dir) => {
    const imagePath = join(dir, 'car.jpg')
    const metadataPath = join(dir, 'metadata.json')
    writeFileSync(imagePath, 'not-an-image')
    writeFileSync(metadataPath, JSON.stringify({
      listingType: 'vehicle',
      title: 'Sedan',
      category: 'Vehicles',
      condition: 'Good',
      description: 'Facts only.',
    }))

    assert.throws(() => loadMetadataFile(metadataPath), /listingType must be one of: item/)
  })
})

test('metadata requires 1 to 20 unique product tags', () => {
  const base = {
    listingType: 'item',
    title: 'Canvas tote bag',
    category: 'Fashion > Handbags',
    condition: 'Good',
    description: 'Canvas tote bag.',
  }
  assert.ok(validateMetadata({ ...base, tags: [] }).errors.includes('metadata.tags must contain at least one relevant product tag'))
  const tooMany = Array.from({ length: 21 }, (_, index) => `tag-${index}`)
  assert.ok(validateMetadata({ ...base, tags: tooMany }).errors.includes('metadata.tags must contain no more than 20 unique product tags'))
  assert.equal(validateMetadata({ ...base, tags: ['กระเป๋าผ้า', 'canvas tote'] }).isValid, true)
})

test('orderImagesWithHook puts the hook file first', () => {
  const ordered = orderImagesWithHook(['IMG_5881.HEIC', 'IMG_5880.HEIC', 'IMG_5882.HEIC'], 'IMG_5880.HEIC')
  assert.deepEqual(ordered.files[0], 'IMG_5880.HEIC')
  assert.equal(ordered.hookWarning, '')
})

test('orderImagesWithHook warns and keeps first still when hook is missing', () => {
  const ordered = orderImagesWithHook(['IMG_5881.HEIC', 'IMG_5882.HEIC'], 'IMG_5880.HEIC')
  assert.deepEqual(ordered.files[0], 'IMG_5881.HEIC')
  assert.match(ordered.hookWarning, /hook file not found/)
})

test('resolveHookFile prefers listing hook_file then hook table', () => {
  assert.equal(resolveHookFile({ hook_file: 'A.HEIC', folder: 'a4-paper-cutter' }, { hooks: [] }), 'A.HEIC')
  assert.equal(
    resolveHookFile({ folder: 'a4-paper-cutter' }, { hooks: [{ folder: 'a4-paper-cutter', file: 'IMG_5880.HEIC' }] }),
    'IMG_5880.HEIC'
  )
})

test('draftListing respects curated photos list from metadata', () => {
  withTempDir((dir) => {
    writeFileSync(join(dir, 'box1.jpg'), 'not-an-image')
    writeFileSync(join(dir, 'box2.jpg'), 'not-an-image')
    writeFileSync(join(dir, 'body1.jpg'), 'not-an-image')
    writeFileSync(join(dir, 'body2.jpg'), 'not-an-image')
    const metadataPath = join(dir, 'metadata.json')
    writeFileSync(metadataPath, JSON.stringify({
      listingType: 'item',
      title: 'Turntable',
      category: 'Electronics & computers',
      condition: 'Good',
      description: 'Turntable body.',
      tags: ['turntable'],
      hook_file: 'body1.jpg',
      photos: ['body1.jpg', 'body2.jpg', 'box1.jpg'],
    }))

    const listing = draftListing(dir, 5000, loadMetadataFile(metadataPath))
    assert.deepEqual(listing.imageEvidence.imageFileNames, ['body1.jpg', 'body2.jpg', 'box1.jpg'])
  })
})
