#!/usr/bin/env node
/**
 * Build a Thai price/info overlay PNG from one product photo.
 *
 * Usage:
 *   node scripts/overlay_card.mjs <image-or-folder> --price 14500 --condition Good [--size 36] [--brand DJI] [--out card.png]
 *   node scripts/overlay_card.mjs --self-test
 */

import { existsSync, mkdirSync, statSync } from 'node:fs'
import { basename, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { pickBestPhoto, renderOverlayCard, validateOverlayInput } from '../lib/overlay_card.mjs'
import { OUTPUT_DIR, timestampSlug } from '../lib/runtime_paths.mjs'

const args = process.argv.slice(2)
const SELF_TEST = args.includes('--self-test')

function flag(name, fallback = '') {
  const idx = args.indexOf(`--${name}`)
  if (idx === -1 || !args[idx + 1]) return fallback
  return args[idx + 1]
}

async function selfTest() {
  const { mkdtempSync, rmSync, writeFileSync } = await import('node:fs')
  const { tmpdir } = await import('node:os')
  const { execFileSync } = await import('node:child_process')
  const dir = mkdtempSync(join(tmpdir(), 'overlay-cli-'))
  try {
    const src = join(dir, 'src.jpg')
    execFileSync('python3', ['-c', `from PIL import Image; Image.new('RGB',(800,600),(40,40,40)).save('${src}')`])
    const out = join(dir, 'card.png')
    const result = renderOverlayCard({
      imagePath: src,
      outPath: out,
      priceThb: 14500,
      condition: 'Good',
      brand: 'DJI',
    })
    if (!result.ok || !existsSync(out)) throw new Error(result.error || 'no output')
    console.log('✓ overlay_card.mjs self-test passed')
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}

function main() {
  if (SELF_TEST) {
    return selfTest()
  }

  const target = args.find((a) => !a.startsWith('--') && args[args.indexOf(a) - 1] !== '--price' && args[args.indexOf(a) - 1] !== '--condition' && args[args.indexOf(a) - 1] !== '--size' && args[args.indexOf(a) - 1] !== '--brand' && args[args.indexOf(a) - 1] !== '--out')
  if (!target) {
    console.error('Usage: node scripts/overlay_card.mjs <image-or-folder> --price 14500 --condition Good [--size 36] [--brand DJI] [--out card.png]')
    process.exit(1)
  }

  const absolute = resolve(target)
  if (!existsSync(absolute)) {
    console.error(`Error: not found: ${absolute}`)
    process.exit(1)
  }

  const imagePath = statSync(absolute).isDirectory() ? pickBestPhoto(absolute) : absolute
  const priceThb = Number(flag('price'))
  const condition = flag('condition', 'Good')
  const size = flag('size')
  const brand = flag('brand')
  const check = validateOverlayInput({ imagePath, priceThb, condition })
  if (!check.ok) {
    console.error(`Error: ${check.error}`)
    process.exit(1)
  }

  mkdirSync(OUTPUT_DIR, { recursive: true })
  const outPath = resolve(flag('out') || join(OUTPUT_DIR, `overlay-${timestampSlug()}-${basename(imagePath, '.HEIC')}.png`))
  const result = renderOverlayCard({ imagePath, outPath, priceThb, condition, size, brand })
  if (!result.ok) {
    console.error(`Error: ${result.error}`)
    process.exit(1)
  }
  console.log(`overlay: ${result.outPath}`)
  console.log(`${result.priceLine} | ${result.metaLine}`)
}

const isMain = resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))
if (isMain) {
  Promise.resolve(main()).catch((err) => {
    console.error(err.message || err)
    process.exit(1)
  })
}
