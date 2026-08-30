import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync } from 'node:fs'
import { basename, dirname, extname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const STILL_EXTS = new Set(['.heic', '.jpg', '.jpeg', '.png', '.webp'])
const CONDITION_TH = {
  new: 'ของใหม่',
  'like new': 'เหมือนใหม่',
  good: 'สภาพดี',
  fair: 'สภาพพอใช้',
  poor: 'มีรอยใช้งาน',
}

export function formatThb(priceThb) {
  const n = Number(priceThb)
  if (!Number.isFinite(n) || n <= 0) return null
  return `฿${Math.round(n).toLocaleString('en-US')}`
}

export function conditionToThai(condition) {
  const key = String(condition || '').trim().toLowerCase()
  return CONDITION_TH[key] || 'สภาพดี'
}

export function buildBannerCopy({ priceThb, condition, size, brand }) {
  const priceLine = formatThb(priceThb)
  if (!priceLine) {
    throw new Error('priceThb is required')
  }
  const parts = [conditionToThai(condition)]
  const sizeText = String(size || '').trim()
  if (sizeText && sizeText !== '—') parts.push(`ไซซ์ ${sizeText}`)
  const brandText = String(brand || '').trim()
  if (brandText) parts.push(brandText)
  return { priceLine, metaLine: parts.join(' · ') }
}

export function validateOverlayInput({ imagePath, priceThb, condition }) {
  if (!imagePath) return { ok: false, error: 'imagePath is required' }
  if (!Number.isFinite(Number(priceThb)) || Number(priceThb) <= 0) {
    return { ok: false, error: 'priceThb must be a positive number' }
  }
  if (!condition) return { ok: false, error: 'condition is required' }
  return { ok: true }
}

export function pickBestPhoto(folder) {
  if (!existsSync(folder)) {
    throw new Error(`folder not found: ${folder}`)
  }
  const stills = readdirSync(folder)
    .filter((name) => !name.startsWith('.'))
    .filter((name) => STILL_EXTS.has(extname(name).toLowerCase()))
    .sort((a, b) => a.localeCompare(b, 'en', { numeric: true }))
  if (stills.length === 0) {
    throw new Error(`no still photos in ${folder}`)
  }
  return join(folder, stills[0])
}

function ensureJpeg(imagePath, workDir) {
  const ext = extname(imagePath).toLowerCase()
  if (ext === '.jpg' || ext === '.jpeg') return imagePath
  mkdirSync(workDir, { recursive: true })
  const jpegPath = join(workDir, `${basename(imagePath, ext)}.jpg`)
  execFileSync('sips', ['-s', 'format', 'jpeg', '-Z', '1600', imagePath, '--out', jpegPath], {
    stdio: 'ignore',
  })
  return jpegPath
}

export function resolvePythonWithPil() {
  const candidates = [
    process.env.MARKETPLACE_PYTHON_BIN,
    '/opt/homebrew/opt/python@3.14/bin/python3.14',
    '/opt/anaconda3/bin/python',
    'python3',
  ].filter(Boolean)

  for (const candidate of candidates) {
    try {
      execFileSync(candidate, ['-c', 'import PIL'], { stdio: 'ignore' })
      return candidate
    } catch {
      // Try the next local Python. Overlay rendering requires Pillow.
    }
  }

  throw new Error('no Python with Pillow found; set MARKETPLACE_PYTHON_BIN')
}

export function renderOverlayCard({ imagePath, outPath, priceThb, condition, size, brand }) {
  const check = validateOverlayInput({ imagePath, priceThb, condition })
  if (!check.ok) return check
  if (!existsSync(imagePath)) return { ok: false, error: `image not found: ${imagePath}` }

  const copy = buildBannerCopy({ priceThb, condition, size, brand })
  const workDir = join(dirname(outPath), '.overlay-work')
  mkdirSync(dirname(outPath), { recursive: true })
  const jpegPath = ensureJpeg(imagePath, workDir)
  const renderer = resolve(fileURLToPath(new URL('../scripts/render_overlay.py', import.meta.url)))
  const python = resolvePythonWithPil()
  execFileSync(
    python,
    [renderer, jpegPath, outPath, copy.priceLine, copy.metaLine],
    { stdio: ['ignore', 'pipe', 'pipe'] },
  )
  if (!existsSync(outPath)) return { ok: false, error: 'renderer did not write output' }
  return { ok: true, outPath, ...copy }
}
