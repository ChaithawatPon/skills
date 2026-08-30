import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import test from 'node:test'
import { applySortPlan } from '../lib/image_sort.mjs'

function fixture() {
  const root = mkdtempSync('/private/tmp/marketplace-sort-safety-')
  const source = join(root, 'source')
  const output = join(root, 'output')
  mkdirSync(source)
  const plan = join(root, 'plan.json')
  writeFileSync(join(source, 'item.heic'), 'source-photo')
  writeFileSync(plan, JSON.stringify({
    source_dir: source,
    groups: [{ folder_name: 'recyclable-cup', files: ['item.heic'] }],
  }))
  return { root, source, output, plan }
}

test('sort apply is idempotent when destination content is identical', () => {
  const f = fixture()
  try {
    assert.equal(applySortPlan(f.plan, f.output).filesProcessed, 1)
    const second = applySortPlan(f.plan, f.output)
    assert.equal(second.filesProcessed, 0)
    assert.equal(second.identicalFiles, 1)
    assert.equal(readFileSync(join(f.output, 'recyclable-cup', 'item.heic'), 'utf8'), 'source-photo')
  } finally {
    rmSync(f.root, { recursive: true, force: true })
  }
})

test('sort apply fails closed on a different destination file', () => {
  const f = fixture()
  try {
    mkdirSync(join(f.output, 'recyclable-cup'), { recursive: true })
    writeFileSync(join(f.output, 'recyclable-cup', 'item.heic'), 'different-photo')
    assert.throws(() => applySortPlan(f.plan, f.output), /Destination collision with different content/)
  } finally {
    rmSync(f.root, { recursive: true, force: true })
  }
})
