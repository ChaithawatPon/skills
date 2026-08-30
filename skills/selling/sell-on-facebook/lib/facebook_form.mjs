/**
 * Facebook Marketplace create-item UI map. Click exact labels. Never typeahead.
 */
import { existsSync, readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { validateProductTags } from './product_tags.mjs'

const FACEBOOK_SPY_SESSION = join(homedir(), '.agent-browser/sessions/facebook-spy-facebook-spy.json')

export const FACEBOOK_CONDITION = {
  'Like New': 'Used - Like New',
  'Excellent': 'Used - Like New',
  'Good': 'Used - Good',
  'Fair': 'Used - Fair',
}

export const FACEBOOK_CATEGORY_LEAF = {
  'Household Items': 'Household',
}

export const FACEBOOK_AVAILABILITY = 'List as Single Item'

export function facebookConditionLabel(condition) {
  return FACEBOOK_CONDITION[condition] || condition
}

export function facebookCategoryLeaf(category) {
  const raw = String(category || '').split('>').pop().trim()
  return FACEBOOK_CATEGORY_LEAF[raw] || raw
}

export function facebookCategoryPath(category) {
  const parts = String(category || '').split('>').map((part) => part.trim()).filter(Boolean)
  const leaf = facebookCategoryLeaf(category)
  if (parts[0] === 'Electronics' && leaf === 'Cameras') {
    return ['Electronics & computers']
  }
  return leaf ? [leaf] : []
}

export function nextCategoryAttempt({
  preferredLeaf = 'Household',
  fallbackLeaf = 'Tools',
  nextEnabled = false,
  attempted = [],
} = {}) {
  if (!attempted.includes(preferredLeaf)) {
    return { action: 'click', leaf: preferredLeaf }
  }
  if (nextEnabled) {
    return { action: 'advance', leaf: attempted[attempted.length - 1] || preferredLeaf }
  }
  if (fallbackLeaf && !attempted.includes(fallbackLeaf)) {
    return { action: 'click', leaf: fallbackLeaf }
  }
  return { action: 'form-block', leaf: attempted[attempted.length - 1] || preferredLeaf }
}

export async function dismissFacebookNotices(page) {
  const notice = page.getByRole('button', { name: /mark as read|noticed a new login|not you/i })
  if (await notice.count()) {
    await notice.first().click({ timeout: 3000 }).catch(() => {})
    await page.keyboard.press('Escape').catch(() => {})
  }
  const login = page.getByRole('dialog').filter({ hasText: /log in|see more on facebook/i })
  if (await login.count()) {
    throw new Error('Facebook login wall. Restore facebook-spy cookies, then run publish once. Do not relaunch Chrome in a loop.')
  }
}

export async function clickExactOption(page, label) {
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const option = page.getByRole('option', { name: new RegExp(`^${label}$`, 'i') })
    if (await option.count() && await option.first().isVisible().catch(() => false)) {
      await option.first().click()
      return
    }
    const text = page.getByText(label, { exact: true })
    if (await text.count() && await text.first().isVisible().catch(() => false)) {
      await text.first().click()
      return
    }
    const flyout = page.locator('[role="listbox"], [role="menu"]').last()
    if (await flyout.count()) {
      const moved = await flyout.evaluate((element) => {
        const before = element.scrollTop
        element.scrollBy({ top: Math.max(240, element.clientHeight * 0.8), behavior: 'instant' })
        return element.scrollTop !== before
      }).catch(() => false)
      if (!moved) await page.keyboard.press('PageDown').catch(() => {})
    } else {
      await page.keyboard.press('PageDown').catch(() => {})
    }
    await page.waitForTimeout(150)
  }
  throw new Error(`Facebook option not found: ${label}. Do not typeahead.`)
}

export async function readRequiredFields(page) {
  const textOf = async (role, name) => {
    const loc = page.getByRole(role, { name })
    if (!(await loc.count())) return ''
    if (role === 'textbox') return loc.first().inputValue().catch(() => '')
    return loc.first().innerText().catch(() => '')
  }
  return {
    title: await textOf('textbox', /^(title|ชื่อรายการ|ชื่อสินค้า|หัวข้อ)$/i),
    price: await textOf('textbox', /^(price|ราคา)$/i),
    category: await textOf('combobox', /^(category|หมวดหมู่)$/i),
    condition: await textOf('combobox', /^(condition|สภาพ)$/i),
    description: await textOf('textbox', /^(description|รายละเอียด|คำอธิบาย)$/i),
    nextEnabled: await page.getByRole('button', { name: /^(next|ถัดไป)$/i }).first()
      .evaluate((el) => !el.hasAttribute('disabled') && el.getAttribute('aria-disabled') !== 'true')
      .catch(() => false),
  }
}

export function loadFacebookSpyCookies(sessionPath = FACEBOOK_SPY_SESSION) {
  if (!existsSync(sessionPath)) return []
  const raw = JSON.parse(readFileSync(sessionPath, 'utf8'))
  return (raw.cookies || [])
    .filter((cookie) => String(cookie.domain || '').includes('facebook.com'))
    .map((cookie) => ({
      name: cookie.name,
      value: cookie.value,
      domain: cookie.domain,
      path: cookie.path || '/',
      httpOnly: Boolean(cookie.httpOnly),
      secure: Boolean(cookie.secure),
      sameSite: ['Strict', 'Lax', 'None'].includes(cookie.sameSite) ? cookie.sameSite : 'Lax',
      expires: cookie.session || !cookie.expires ? -1 : Math.floor(cookie.expires),
    }))
}

export async function restoreFacebookSpySession(context, page) {
  const cookies = loadFacebookSpyCookies()
  if (!cookies.length) return 0
  await context.addCookies(cookies)
  await page.goto('https://www.facebook.com/marketplace/create/item', { waitUntil: 'domcontentloaded', timeout: 90000 })
  return cookies.length
}

export async function fillListingDescription(page, description) {
  const text = String(description || '')
  const moreDetails = page.getByRole('button', { name: /more details|รายละเอียดเพิ่มเติม/i }).first()
  if (await moreDetails.count()) {
    const expanded = await moreDetails.getAttribute('aria-expanded').catch(() => '')
    if (expanded !== 'true') await moreDetails.click()
  }
  const box = page.getByLabel(/^(description|รายละเอียด|คำอธิบาย)$/i)
    .or(page.getByRole('textbox', { name: /^(description|รายละเอียด|คำอธิบาย)$/i }))
    .last()
  await box.waitFor({ state: 'visible', timeout: 15000 })
  await box.click()
  await box.fill(text)
  let value = await box.inputValue().catch(async () => box.innerText().catch(() => ''))
  if (!String(value).includes(text.slice(0, 8))) {
    await box.click()
    await page.keyboard.insertText(text)
    value = await box.inputValue().catch(async () => box.innerText().catch(() => ''))
  }
  return String(value || '').trim()
}

export async function fillProductTags(page, tags) {
  const validation = validateProductTags(tags)
  if (!validation.isValid) throw new Error(validation.errors.join('; '))
  const limited = validation.tags
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const visible = await page.locator('label, span, div')
      .filter({ hasText: /^Product tags\b|^แท็กสินค้า\b|^แท็ก\b/i })
      .first()
      .isVisible({ timeout: 500 })
      .catch(() => false)
    if (visible) break
    await page.mouse.wheel(0, 700).catch(() => {})
    await page.waitForTimeout(250)
  }
  let box = page.locator('label')
    .filter({ hasText: /^Product tags\b|^แท็กสินค้า\b|^แท็ก\b/i })
    .locator('textarea, input, [contenteditable="true"]')
    .last()
  const boxVisible = await box.evaluate((element) => {
    const rect = element.getBoundingClientRect()
    return rect.width > 0 && rect.height > 0
  }).catch(() => false)
  if (!(await box.count()) || !boxVisible) {
    const textareas = page.locator('textarea')
    for (let index = await textareas.count() - 1; index >= 0; index -= 1) {
      const candidate = textareas.nth(index)
      const visible = await candidate.evaluate((element) => {
        const rect = element.getBoundingClientRect()
        return rect.width > 0 && rect.height > 0
      }).catch(() => false)
      if (visible) {
        box = candidate
        break
      }
    }
  }
  if (!(await box.count())) return []
  await box.evaluate((element) => element.scrollIntoView({ block: 'center', inline: 'nearest' })).catch(() => {})
  await page.waitForTimeout(250)
  for (const tag of limited) {
    const boxRect = await box.evaluate((element) => {
      const rect = element.getBoundingClientRect()
      return { x: rect.x, y: rect.y, width: rect.width, height: rect.height }
    }).catch(() => null)
    if (!boxRect || boxRect.width <= 0 || boxRect.height <= 0) return []
    await page.mouse.click(boxRect.x + Math.min(24, boxRect.width / 2), boxRect.y + Math.min(24, boxRect.height / 2))
    await page.keyboard.press(process.platform === 'darwin' ? 'Meta+A' : 'Control+A').catch(() => {})
    await page.keyboard.type(tag, { delay: 5 })
    await page.keyboard.press('Enter')
    await page.waitForTimeout(300)
    const chips = await readProductTagChips(page)
    if (chips.some((chip) => normalizeLabel(chip).toLowerCase() === tag.toLowerCase())) continue
    await page.keyboard.press('Enter').catch(() => {})
    await page.waitForTimeout(250)
  }
  return readProductTagChips(page)
}

export async function readProductTagChips(page) {
  const fromDom = await page.evaluate(() => {
    const normalize = (value) => String(value || '').replace(/\s+/g, ' ').trim()
    const labelRe = /^(Product tags|แท็กสินค้า|แท็ก)\b/i
    const visible = (node) => {
      const rect = node.getBoundingClientRect()
      return rect.width > 0 && rect.height > 0
    }
    const roots = [...document.querySelectorAll('label, div, span')]
      .filter((node) => visible(node) && labelRe.test(normalize(node.textContent)))
    const root = roots.find((node) => node.querySelector('textarea, input, [contenteditable="true"]')) || roots[0]
    if (!root) return []
    const candidates = [...root.querySelectorAll('[role="button"], [aria-label], span, div')]
      .filter(visible)
      .map((node) => normalize(node.getAttribute('aria-label') || node.textContent))
      .filter(Boolean)
    return candidates
  }).catch(() => [])
  const chips = fromDom
    .map((name) => normalizeLabel(name).replace(/^(remove|ลบ)\s+/i, '').replace(/\s+(remove|ลบ)$/i, '').trim())
    .filter((tag) => tag && !/^photo\b|photo from listing/i.test(tag))
    .filter((tag) => !/^(product tags|optional|limit:? ?20|\+|add)$/i.test(tag))
    .filter((tag) => !/(product tags|optional|limit:? ?20|add descriptive tags|เพิ่มแท็ก)/i.test(tag))
  return [...new Set(chips)]
}

export const NEXT_ENABLE_WAIT_MS = 180000

export function listingPhotoWaitTarget(expected) {
  const want = Math.max(1, Number(expected) || 1)
  return Math.min(want, 10)
}

function isImageFileInput(item) {
  const accept = String(item?.accept || '')
  return !accept || /image|photo|\*/i.test(accept)
}

/** Prefer a multi image input. `input[type=file].first()` is often the single-file phone-upload control. */
export function pickListingFileInputIndex(inputs) {
  const list = Array.isArray(inputs) ? inputs : []
  if (!list.length) return -1
  const multiImage = list.findIndex((item) => item.multiple && isImageFileInput(item))
  if (multiImage >= 0) return multiImage
  const image = list.findIndex((item) => isImageFileInput(item))
  if (image >= 0) return image
  return list.length - 1
}

function composerThumbCountFromDom() {
  return [...document.querySelectorAll('img')].filter((img) => {
    const src = String(img.currentSrc || img.src || '')
    if (!src || /emoji|rsrc\.php|static\.xx\.fbcdn\.net\/rsrc/.test(src)) return false
    const rect = img.getBoundingClientRect()
    return rect.width >= 48 && rect.width <= 180 && rect.height >= 48 && rect.height <= 180
  }).length
}

export async function readPhotoCount(page) {
  return page.evaluate(composerThumbCountFromDom).catch(() => 0)
}

export async function attachListingPhotos(page, imagePaths) {
  const paths = (Array.isArray(imagePaths) ? imagePaths : []).filter(Boolean)
  if (!paths.length) throw new Error('No listing photos to attach')

  const locator = page.locator('input[type="file"]')
  if (!(await locator.count())) {
    const addPhotos = page.getByRole('button', { name: /add photos|add photo|เพิ่มรูป/i }).first()
    const chooserPromise = page.waitForEvent('filechooser', { timeout: 8000 }).catch(() => null)
    await addPhotos.click({ timeout: 5000 }).catch(() => {})
    const chooser = await chooserPromise
    if (chooser) {
      await chooser.setFiles(paths)
      return
    }
  }

  await locator.first().waitFor({ state: 'attached', timeout: 15000 })
  const metas = await locator.evaluateAll((nodes) => nodes.map((node) => ({
    multiple: Boolean(node.multiple),
    accept: String(node.accept || ''),
  })))
  const index = pickListingFileInputIndex(metas)
  if (index < 0) throw new Error('No file input for listing photos')
  const input = locator.nth(index)
  await input.evaluate((el) => {
    el.multiple = true
    el.setAttribute('multiple', '')
  })
  await input.setInputFiles(paths)
}

export async function waitForListingPhotos(page, expected = 1) {
  const want = listingPhotoWaitTarget(expected)
  await page.waitForFunction((minCount) => {
    const thumbs = [...document.querySelectorAll('img')].filter((img) => {
      const src = String(img.currentSrc || img.src || '')
      if (!src || /emoji|rsrc\.php|static\.xx\.fbcdn\.net\/rsrc/.test(src)) return false
      const rect = img.getBoundingClientRect()
      return rect.width >= 48 && rect.width <= 180 && rect.height >= 48 && rect.height <= 180
    })
    return thumbs.length >= minCount
  }, want, { timeout: NEXT_ENABLE_WAIT_MS })
}

export async function setLabeledToggle(page, nameRe, wantOn) {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const control = page.getByRole('switch', { name: nameRe })
      .or(page.getByRole('checkbox', { name: nameRe }))
      .first()
    if (await control.count().catch(() => 0)) {
      await control.scrollIntoViewIfNeeded().catch(() => {})
      const on = await control.isChecked().catch(() => false)
      if (Boolean(on) !== Boolean(wantOn)) await control.click()
      return control.isChecked().catch(() => false)
    }
    const switches = page.getByRole('switch').or(page.getByRole('checkbox'))
    const switchCount = await switches.count().catch(() => 0)
    for (let i = 0; i < switchCount; i += 1) {
      const sw = switches.nth(i)
      const containerText = await sw.evaluate((el) => {
        let parent = el
        for (let d = 0; parent && d < 4; d += 1) {
          parent = parent.parentElement
        }
        return parent ? parent.textContent || '' : ''
      }).catch(() => '')
      if (nameRe.test(containerText)) {
        await sw.scrollIntoViewIfNeeded().catch(() => {})
        const on = await sw.isChecked().catch(() => false)
        if (Boolean(on) !== Boolean(wantOn)) await sw.click()
        return sw.isChecked().catch(() => false)
      }
    }
    await page.mouse.wheel(0, 650).catch(() => {})
    await page.waitForTimeout(250)
  }
  return false
}

export async function waitForNextEnabled(page, timeoutMs = NEXT_ENABLE_WAIT_MS) {
  try {
    await page.waitForFunction(() => {
      const busy = [...document.querySelectorAll('[role="progressbar"], [aria-busy="true"]')].some((el) => {
        const rect = el.getBoundingClientRect()
        return rect.width > 20 && rect.height > 0
      })
      if (busy) return false
      const buttons = [...document.querySelectorAll('[role="button"], button')]
      const next = buttons.find((el) => /^(next|ถัดไป)$/i.test((el.getAttribute('aria-label') || el.textContent || '').trim()))
      if (!next) return false
      return next.getAttribute('aria-disabled') !== 'true' && !next.hasAttribute('disabled')
    }, null, { timeout: timeoutMs })
    return true
  } catch {
    return false
  }
}

export async function dismissOpenFlyout(page) {
  const flyout = page.locator('[role="listbox"], [role="menu"]').last()
  if (await flyout.count() && await flyout.isVisible().catch(() => false)) {
    await page.keyboard.press('Escape').catch(() => {})
  }
  const title = page.getByRole('textbox', { name: /^(title|ชื่อรายการ|ชื่อสินค้า|หัวข้อ)$/i }).first()
  if (await title.count() && await title.isVisible().catch(() => false)) {
    await title.click({ timeout: 1000 }).catch(() => {})
  }
}

export async function selectCategoryWithRetry(page, { preferredLeaf = 'Household', fallbackLeaf = 'Tools' } = {}) {
  const attempted = []
  const categoryControl = page.getByRole('combobox', { name: /^(category|หมวดหมู่)$/i }).first()
  for (let step = 0; step < 2; step += 1) {
    const fields = await readRequiredFields(page)
    const decision = nextCategoryAttempt({
      preferredLeaf,
      fallbackLeaf,
      nextEnabled: fields.nextEnabled && attempted.length > 0,
      attempted,
    })
    if (decision.action === 'advance') return { leaf: decision.leaf, fields, blocked: false }
    if (decision.action === 'form-block') return { leaf: decision.leaf, fields, blocked: true }
    await categoryControl.click()
    await clickExactOption(page, decision.leaf)
    await page.keyboard.press('Escape')
    attempted.push(decision.leaf)
  }
  const fields = await readRequiredFields(page)
  const decision = nextCategoryAttempt({
    preferredLeaf,
    fallbackLeaf,
    nextEnabled: fields.nextEnabled,
    attempted,
  })
  return { leaf: decision.leaf, fields, blocked: decision.action === 'form-block' }
}

function normalizeLabel(value) {
  return String(value || '').replace(/\s+/g, ' ').trim()
}

export function describeFormBlock(fields) {
  const missing = []
  if (!String(fields.title || '').trim()) missing.push('title')
  if (!String(fields.price || '').replace(/[^\d]/g, '')) missing.push('price')
  if (/^(category|หมวดหมู่)\s*$/i.test(fields.category || '') || !String(fields.category || '').trim()) missing.push('category')
  if (/^(condition|สภาพ)\s*$/i.test(fields.condition || '') || !String(fields.condition || '').trim()) missing.push('condition')
  if (!String(fields.description || '').trim()) missing.push('description')
  if (!fields.nextEnabled) missing.push('next')
  return missing
}
