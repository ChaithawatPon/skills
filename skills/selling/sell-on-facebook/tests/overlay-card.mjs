import assert from 'node:assert/strict'
import { mkdtempSync, writeFileSync, rmSync, mkdirSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { execFileSync } from 'node:child_process'
import test from 'node:test'
import {
  buildBannerCopy,
  pickBestPhoto,
  resolvePythonWithPil,
  validateOverlayInput,
} from '../lib/overlay_card.mjs'
import { renderOverlayCard } from '../lib/overlay_card.mjs'

test('banner copy is Thai and includes price, condition, size, brand', () => {
  const copy = buildBannerCopy({
    priceThb: 14500,
    condition: 'Good',
    size: '—',
    brand: 'DJI',
  })
  assert.match(copy.priceLine, /฿14,500/)
  assert.match(copy.metaLine, /สภาพดี/)
  assert.match(copy.metaLine, /DJI/)
  assert.doesNotMatch(copy.priceLine, /[A-Za-z]{4,}/)
})

test('validateOverlayInput rejects missing price', () => {
  const result = validateOverlayInput({
    imagePath: '/tmp/x.jpg',
    priceThb: null,
    condition: 'Good',
  })
  assert.equal(result.ok, false)
  assert.match(result.error, /price/i)
})

test('pickBestPhoto skips videos and prefers first still', () => {
  const dir = mkdtempSync(join(tmpdir(), 'overlay-pick-'))
  try {
    writeFileSync(join(dir, 'IMG_0002.MOV'), 'video')
    writeFileSync(join(dir, 'IMG_0001.HEIC'), 'still')
    writeFileSync(join(dir, 'IMG_0003.HEIC'), 'still2')
    const picked = pickBestPhoto(dir)
    assert.equal(picked.endsWith('IMG_0001.HEIC'), true)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

test('renderOverlayCard writes a PNG banner card from a JPEG', () => {
  const dir = mkdtempSync(join(tmpdir(), 'overlay-render-'))
  try {
    const src = join(dir, 'src.jpg')
    execFileSync(resolvePythonWithPil(), ['-c', `from PIL import Image; Image.new('RGB',(800,600),(30,30,30)).save('${src}')`])
    const out = join(dir, 'card.png')
    const result = renderOverlayCard({
      imagePath: src,
      outPath: out,
      priceThb: 14500,
      condition: 'Good',
      size: '',
      brand: 'DJI',
    })
    assert.equal(result.ok, true)
    assert.equal(existsSync(out), true)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})
