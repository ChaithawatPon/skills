#!/usr/bin/env node
/**
 * Phase 2: fill create-item once, mint a publish token only when machine sure-checks
 * pass on Facebook's own preview, then click Publish. No env/config/state token.
 * Unsure → dump output/sure-block.json and stop. After a live URL: optional
 * yes-delete of one title+price duplicate, then approval-gated group posts.
 *
 * Usage:
 *   node scripts/facebook_marketplace_publish.mjs
 *   node scripts/facebook_marketplace_publish.mjs --self-test
 */

import { fileURLToPath } from 'url'
import { readFileSync, readdirSync, existsSync, writeFileSync } from 'fs'
import { join, resolve } from 'path'
import { createInterface } from 'readline/promises'
import { createHash, randomUUID } from 'crypto'
import { formatListingForDisplay, validateListing } from '../lib/marketplace_draft.mjs'
import { BROWSER_STATE_DIR, OUTPUT_DIR, ROOT } from '../lib/runtime_paths.mjs'
import {
  clickExactOption,
  describeFormBlock,
  dismissFacebookNotices,
  FACEBOOK_AVAILABILITY,
  facebookCategoryPath,
  facebookCategoryLeaf,
  facebookConditionLabel,
  dismissOpenFlyout,
  fillListingDescription,
  fillProductTags,
  readPhotoCount,
  readProductTagChips,
  readRequiredFields,
  restoreFacebookSpySession,
  setLabeledToggle,
  attachListingPhotos,
  waitForListingPhotos,
  waitForNextEnabled,
} from '../lib/facebook_form.mjs'
import { evaluatePublishSureChecks } from '../lib/publish_sure.mjs'
import { findDuplicateAction } from '../lib/duplicate_listings.mjs'
import {
  buildGroupPostCaption,
  classifyGroupComposerState,
  expectedGroupApproval,
  pickGroupImages,
  validateGroupApproval,
  validateGroupPostPacket,
} from '../lib/group_cross_post.mjs'
import { listingFactsPath, parseListingFactsMarkdown, writeListingFacts } from '../lib/listing_facts.mjs'
import { canonicalizeMarketplaceListingUrl, collectSellingCards } from './facebook_marketplace_inventory.mjs'
const validAuthorizations = new WeakSet()

function normalize(value) {
  return String(value || '')
    .normalize('NFC')
    .replace(/\u0e4d\u0e32/g, '\u0e33')
    .replace(/\s+/g, ' ')
    .trim()
}

async function readControlText(control) {
  if (!(await control.count())) return ''
  return normalize(
    await control.first().inputValue().catch(async () => (
      await control.first().innerText().catch(async () => (
        await control.first().getAttribute('aria-label').catch(() => '')
      ))
    ))
  )
}

async function selectBangkokLocation(page) {
  const locationControl = page.getByRole('combobox', { name: /^(location|ที่ตั้ง|ตำแหน่ง|สถานที่)$/i }).first()
  if (!(await locationControl.count())) {
    throw new Error('Location field is missing. Refusing to continue to preview.')
  }

  await locationControl.click()
  await locationControl.fill('').catch(() => {})
  await page.keyboard.type('กรุงเทพมหานคร', { delay: 40 })
  await page.waitForTimeout(800)

  const bangkokOption = page.getByRole('option').filter({ hasText: /กรุงเทพ|bangkok/i }).first()
  if (await bangkokOption.count() && await bangkokOption.isVisible().catch(() => false)) {
    await bangkokOption.click()
  } else {
    await page.keyboard.press('Enter')
  }
  await page.waitForTimeout(900)

  const selected = await readControlText(locationControl)
  if (!/กรุงเทพ|bangkok/i.test(selected)) {
    throw new Error(`Location was not set to Bangkok. Captured location: "${selected || '(blank)'}"`)
  }
  return selected
}

function loadLatestDraft(explicitPath) {
  if (explicitPath && existsSync(explicitPath)) {
    const listing = JSON.parse(readFileSync(resolve(explicitPath), 'utf-8'))
    const validation = validateListing(listing)
    if (!validation.isValid) {
      throw new Error(`Draft ${explicitPath} failed validation:\n${validation.errors.join('\n')}`)
    }
    return { listing, path: resolve(explicitPath) }
  }
  if (!existsSync(OUTPUT_DIR)) {
    throw new Error(`No drafts found -- run scripts/facebook_marketplace_draft.mjs first (missing ${OUTPUT_DIR})`)
  }
  const drafts = readdirSync(OUTPUT_DIR)
    .filter((f) => f.endsWith('-listing-draft.json'))
    .sort()
  if (drafts.length === 0) {
    throw new Error('No drafts found -- run scripts/facebook_marketplace_draft.mjs first')
  }
  const latest = drafts[drafts.length - 1]
  const listing = JSON.parse(readFileSync(join(OUTPUT_DIR, latest), 'utf-8'))
  const validation = validateListing(listing)
  if (!validation.isValid) {
    throw new Error(`Draft ${latest} failed validation:\n${validation.errors.join('\n')}`)
  }
  return { listing, path: join(OUTPUT_DIR, latest) }
}

function validatePreviewSnapshot(previewSnapshot) {
  if (!previewSnapshot || typeof previewSnapshot !== 'object') {
    throw new Error('preview snapshot is required before publish approval')
  }

  const snapshot = {
    stage: normalize(previewSnapshot.stage),
    pageUrl: normalize(previewSnapshot.pageUrl),
    publishButtonName: normalize(previewSnapshot.publishButtonName),
    bodyExcerpt: normalize(previewSnapshot.bodyExcerpt).slice(0, 1200),
    listingType: normalize(previewSnapshot.listingType).toLowerCase(),
    title: normalize(previewSnapshot.title),
    priceText: normalize(previewSnapshot.priceText),
    condition: normalize(previewSnapshot.condition),
    category: normalize(previewSnapshot.category),
    photoCount: Number(previewSnapshot.photoCount || 0),
    tagChips: Array.isArray(previewSnapshot.tagChips) ? previewSnapshot.tagChips.map(normalize) : [],
    hideFromFriends: previewSnapshot.hideFromFriends === true,
    loginWall: Boolean(previewSnapshot.loginWall),
  }

  if (snapshot.stage !== 'facebook-preview') {
    throw new Error('publish approval may only be requested from the Facebook preview step')
  }
  if (!snapshot.pageUrl) {
    throw new Error('preview snapshot is missing page URL')
  }
  if (!snapshot.publishButtonName) {
    throw new Error('preview snapshot is missing the final Publish button label')
  }
  return snapshot
}

function buildPreviewFingerprint(previewSnapshot) {
  const snapshot = validatePreviewSnapshot(previewSnapshot)
  return createHash('sha256').update(JSON.stringify(snapshot), 'utf8').digest('hex')
}

function formatPreviewSnapshot(previewSnapshot) {
  const snapshot = validatePreviewSnapshot(previewSnapshot)
  return [
    '='.repeat(60),
    'FACEBOOK PREVIEW SNAPSHOT',
    '='.repeat(60),
    `Preview URL:  ${snapshot.pageUrl}`,
    `Listing type: ${snapshot.listingType}`,
    `Title:        ${snapshot.title || '(not captured)'}`,
    `Price text:   ${snapshot.priceText || '(not captured)'}`,
    `Final button: ${snapshot.publishButtonName}`,
    '',
    'Visible preview excerpt:',
    snapshot.bodyExcerpt || '(no preview excerpt captured)',
    '='.repeat(60),
  ].join('\n')
}

/**
 * The ONLY function that can mint a value publishToFacebook() will accept.
 * Token comes from machine sure-checks on this run's preview snapshot.
 * No env/config/state, and no typed "yes". Fail any check → null for operator review.
 */
function requestPublishAuthorization(previewSnapshot, { draft, form, displayText = '' } = {}) {
  const snapshot = validatePreviewSnapshot(previewSnapshot)
  if (displayText) console.log(displayText)
  console.log(`\n${formatPreviewSnapshot(snapshot)}`)
  const check = evaluatePublishSureChecks({ snapshot, draft, form })
  if (!check.ok) {
    return { authorization: null, check, snapshot }
  }
  const authorization = {
    nonce: randomUUID(),
    previewFingerprint: buildPreviewFingerprint(snapshot),
    mintedAt: Date.now(),
  }
  validAuthorizations.add(authorization)
  return { authorization, check, snapshot }
}

async function requestDeleteAuthorization(row, { input = process.stdin, output = process.stdout } = {}) {
  const rl = createInterface({ input, output })
  let answer
  try {
    answer = await rl.question(
      `\nOld listing "${row.title}" ฿${row.priceThb ?? row.price} ${row.listingUrl || row.listingId} looks like a duplicate. Type "yes" to delete it, anything else to skip: `
    )
  } finally {
    rl.close()
  }
  return String(answer).trim().toLowerCase() === 'yes'
}

function assertPublishAuthorization(authorization, previewSnapshot) {
  if (!authorization || !validAuthorizations.has(authorization)) {
    throw new Error('publishToFacebook called without a valid per-run authorization -- refusing to publish')
  }
  const previewFingerprint = buildPreviewFingerprint(previewSnapshot)
  if (authorization.previewFingerprint !== previewFingerprint) {
    throw new Error('publish authorization does not match the current Facebook preview step')
  }
}

async function openDraftInBrowser(listing) {
  if (listing.listingType !== 'item') {
    throw new Error(`Unsupported listingType "${listing.listingType}". This public package currently supports only the Item for sale flow.`)
  }

  const { chromium } = await import('playwright')
  const { launchPersistentContext } = await import('../lib/browser_launch.mjs')
  const context = await launchPersistentContext(
    chromium,
    BROWSER_STATE_DIR,
    { headless: false, channel: 'chrome' },
    { label: 'marketplace-publish' }
  )
  const page = context.pages()[0] || (await context.newPage())
  await page.goto('https://www.facebook.com/marketplace/create/item', { waitUntil: 'domcontentloaded', timeout: 90000 })
  const loginWall = page.getByRole('dialog').filter({ hasText: /log in|see more on facebook/i })
  if (await loginWall.count()) {
    await restoreFacebookSpySession(context, page)
  }
  await dismissFacebookNotices(page)
  return { context, page }
}

async function fillItemListingForm(page, listing) {
  await dismissFacebookNotices(page)
  try {
    await attachListingPhotos(page, listing.imagePaths)
    await waitForListingPhotos(page, listing.imagePaths.length)
  } catch (error) {
    await dumpFormBlock(page, listing, {
      ...(await readRequiredFields(page)),
      photoCount: await readPhotoCount(page),
    })
    throw error
  }

  await page.getByRole('textbox', { name: /^(title|ชื่อรายการ|ชื่อสินค้า|หัวข้อ)$/i }).fill(listing.title)
  await page.getByRole('textbox', { name: /^(price|ราคา)$/i }).fill(String(listing.price))

  const descriptionValue = await fillListingDescription(page, listing.description)
  let enteredTags = []

  const categoryPath = facebookCategoryPath(listing.category)
  const preferredLeaf = facebookCategoryLeaf(listing.category)
  const fallbackLeaf = preferredLeaf === 'Household' ? 'Tools' : ''
  const categoryControl = page.getByRole('combobox', { name: /^(category|หมวดหมู่)$/i }).first()
  await categoryControl.click()
  for (const categoryLabel of categoryPath) {
    await clickExactOption(page, categoryLabel)
    await page.waitForTimeout(300)
  }
  await dismissOpenFlyout(page)
  let acceptedCategory = categoryPath.at(-1) || preferredLeaf

  const facebookCondition = facebookConditionLabel(listing.condition)
  const conditionControl = page.getByRole('combobox', { name: /^(condition|สภาพ)$/i }).first()
  await conditionControl.click()
  await clickExactOption(page, facebookCondition)
  await dismissOpenFlyout(page)

  const availabilityControl = page.getByRole('combobox', { name: /^(availability|ความพร้อมใช้งาน|ความพร้อม)$/i }).first()
  if (await availabilityControl.count()) {
    await availabilityControl.click()
    await clickExactOption(page, FACEBOOK_AVAILABILITY)
    await dismissOpenFlyout(page)
  }

  enteredTags = await fillProductTags(page, listing.tags)

  await setLabeledToggle(page, /public meetup|นัดพบสาธารณะ|พบกันในที่สาธารณะ/i, true)
  const hideFromFriends = await setLabeledToggle(page, /hide from friends|ซ่อนจากเพื่อน/i, true)
  if (!hideFromFriends) {
    throw new Error('Hide from friends is missing or off. Refusing to continue to preview.')
  }
  await setLabeledToggle(page, /boost listing|boost|โปรโมท|บูสต์/i, false)
  await setLabeledToggle(page, /door pickup|รับที่หน้าประตู/i, false)
  await setLabeledToggle(page, /door dropoff|door drop-off|ส่งที่หน้าประตู/i, false)

  const location = await selectBangkokLocation(page)

  await dismissOpenFlyout(page)
  let fields = await readRequiredFields(page)
  if (!String(fields.description || descriptionValue || '').trim()) {
    fields = { ...fields, description: descriptionValue }
  }
  if (!fields.nextEnabled) {
    await waitForNextEnabled(page)
    fields = await readRequiredFields(page)
  }
  if (!fields.nextEnabled && fallbackLeaf) {
    await categoryControl.click()
    await clickExactOption(page, fallbackLeaf)
    await dismissOpenFlyout(page)
    acceptedCategory = fallbackLeaf
    await conditionControl.click()
    await clickExactOption(page, facebookCondition)
    await dismissOpenFlyout(page)
    fields = await readRequiredFields(page)
  }
  if (!fields.nextEnabled) {
    await waitForNextEnabled(page)
    fields = await readRequiredFields(page)
  }
  if (!fields.nextEnabled) {
    await dumpFormBlock(page, listing, {
      ...fields,
      photoCount: await readPhotoCount(page),
    })
    throw new Error(`Next stayed disabled after ${acceptedCategory}. See ${join(OUTPUT_DIR, 'form-block.json')}. Do not relaunch Chrome.`)
  }

  const loginWall = Boolean(await page.getByRole('dialog').filter({ hasText: /log in|see more on facebook/i }).count())
  const capturedTags = (await readProductTagChips(page)).filter((tag) => !/^photo\b|photo from listing/i.test(tag))
  return {
    acceptedCategory,
    form: {
      title: fields.title,
      price: fields.price,
      condition: fields.condition,
      category: fields.category,
      acceptedCategory,
      location,
      tagChips: capturedTags,
      hideFromFriends,
      photoCount: await readPhotoCount(page) || listing.imagePaths.length,
      loginWall,
    },
  }
}

async function dumpFormBlock(page, listing, fields) {
  const missing = describeFormBlock(fields || {})
  const blockPath = join(OUTPUT_DIR, 'form-block.json')
  writeFileSync(blockPath, JSON.stringify({ missing, fields, title: listing.title }, null, 2))
  await page.screenshot({ path: join(OUTPUT_DIR, 'form-block.png') }).catch(() => {})
}

async function capturePreviewSnapshot(page, listing, form = {}) {
  const publishButton = page.getByRole('button', { name: /^(publish|เผยแพร่)$/i })
  await publishButton.waitFor({ state: 'visible', timeout: 15000 })
  const bodyExcerpt = await page.locator('body').innerText().then((text) => normalize(text).slice(0, 1200))
  const previewTagChips = await page.evaluate((tags) => {
    const normalizeText = (value) => String(value || '').normalize('NFC').replace(/\s+/g, ' ').trim()
    const expected = new Set((tags || []).map((tag) => normalizeText(tag)))
    return [...document.querySelectorAll('[role="button"], span, div')]
      .filter((node) => {
        const rect = node.getBoundingClientRect()
        return rect.width > 0 && rect.height > 0
      })
      .map((node) => normalizeText(node.textContent))
      .filter((text) => expected.has(text))
  }, listing.tags || []).catch(() => [])
  const tagChips = Array.isArray(form.tagChips) && form.tagChips.length > 0
    ? form.tagChips
    : [...new Set(previewTagChips)]

  return {
    stage: 'facebook-preview',
    pageUrl: page.url(),
    publishButtonName: await publishButton.innerText().then((t) => t.trim() || 'Publish'),
    bodyExcerpt,
    listingType: listing.listingType,
    title: form.title || listing.title,
    priceText: form.price || `฿${listing.price.toFixed(2)}`,
    condition: form.condition || facebookConditionLabel(listing.condition),
    category: form.category || form.acceptedCategory || facebookCategoryLeaf(listing.category),
    location: form.location || '',
    photoCount: form.photoCount || listing.imagePaths.length,
    tagChips,
    hideFromFriends: form.hideFromFriends === true,
    loginWall: Boolean(form.loginWall),
  }
}

async function advanceToFacebookPreview(page, listing, form = {}) {
  const nextButton = page.getByRole('button', { name: /^(next|ถัดไป)$/i })
  await nextButton.waitFor({ state: 'visible', timeout: 15000 })
  try {
    await page.waitForFunction(() => {
      const buttons = [...document.querySelectorAll('[role="button"]')]
      const next = buttons.find((el) => /^(next|ถัดไป)$/i.test((el.getAttribute('aria-label') || el.textContent || '').trim()))
      return next && next.getAttribute('aria-disabled') !== 'true'
    }, null, { timeout: 180000 })
  } catch {
    const fields = await readRequiredFields(page)
    await dumpFormBlock(page, listing, fields)
    throw new Error(`Next stayed disabled. Missing: ${describeFormBlock(fields).join(', ') || 'unknown'}. See ${join(OUTPUT_DIR, 'form-block.json')}. Do not relaunch Chrome.`)
  }
  await nextButton.click()
  return capturePreviewSnapshot(page, listing, form)
}

function rewriteFactsLive(listing, { url, id, category }) {
  const existingPath = listingFactsPath(listing.folder || listing.title)
  const existing = existsSync(existingPath)
    ? parseListingFactsMarkdown(readFileSync(existingPath, 'utf8'), existingPath)
    : {}
  return writeListingFacts({
    ...existing,
    folder: listing.folder || existing.folder,
    title: listing.title,
    status: 'live',
    price_thb: String(Math.round(listing.price)),
    condition: listing.condition,
    facebook_condition: facebookConditionLabel(listing.condition),
    category: category || listing.category,
    marketplace_url: url,
    listing_id: id,
    description: listing.description || existing.description,
  })
}

async function readLiveListingUrl(page) {
  await page.waitForTimeout(2000)
  const href = await page.locator('a[href*="/marketplace/item/"]').first().getAttribute('href').catch(() => '')
  const candidates = [canonicalizeMarketplaceListingUrl(href), canonicalizeMarketplaceListingUrl(page.url())].filter(Boolean)
  const match = String(candidates[0] || '').match(/\/marketplace\/item\/(\d+)/)
  if (!match) return { url: '', id: '' }
  return { url: `https://www.facebook.com/marketplace/item/${match[1]}/`, id: match[1] }
}

async function handleDuplicateDelete(page, listing, liveId) {
  await page.goto('https://www.facebook.com/marketplace/you/selling/', { waitUntil: 'domcontentloaded', timeout: 90000 })
  await page.waitForTimeout(1500)
  const rows = (await collectSellingCards(page)).map((card) => ({
    listingId: card.listingId,
    listingUrl: card.listingUrl,
    title: card.title,
    priceThb: card.price,
  }))
  const decision = findDuplicateAction(rows, {
    title: listing.title,
    priceThb: listing.price,
    excludeId: liveId,
  })
  if (decision.action === 'skip') {
    console.log('No old title+price duplicate.')
    return decision
  }
  if (decision.action === 'stop') {
    console.log(`Stop delete: ${decision.matches.length} old title+price matches.`)
    writeFileSync(join(OUTPUT_DIR, 'duplicate-stop.json'), JSON.stringify(decision, null, 2))
    return decision
  }
  const approved = await requestDeleteAuthorization(decision.match)
  if (!approved) {
    console.log('Duplicate delete skipped (no yes).')
    return { ...decision, deleted: false }
  }
  if (decision.match.listingUrl) await page.goto(decision.match.listingUrl, { waitUntil: 'domcontentloaded', timeout: 90000 })
  const del = page.getByRole('button', { name: /^(delete listing|delete|ลบรายการ|ลบ)$/i }).first()
  await del.click({ timeout: 8000 })
  const confirm = page.getByRole('button', { name: /^(delete|ลบ)$/i }).last()
  if (await confirm.count()) await confirm.click({ timeout: 5000 }).catch(() => {})
  return { ...decision, deleted: true }
}

async function requestGroupAuthorization(packet, { input = process.stdin, output = process.stdout } = {}) {
  const expected = expectedGroupApproval(packet)
  const rl = createInterface({ input, output })
  const answer = await rl.question(`\nType exactly "${expected}" to post these groups; anything else skips: `)
  rl.close()
  return validateGroupApproval(packet, answer).ok
}

async function postGroups(page, listing, marketplaceItemUrl) {
  const catalog = JSON.parse(readFileSync(join(ROOT, 'references/bangkok_selling_groups.example.json'), 'utf8'))
  const groups = catalog.groups || []
  const imagePaths = pickGroupImages(listing.imagePaths)
  const caption = buildGroupPostCaption({
    titleTh: listing.title,
    priceThb: listing.price,
    conditionTh: 'มือสอง สภาพดี',
    marketplaceItemUrl,
  })
  const packet = validateGroupPostPacket({
    marketplaceItemUrl,
    imagePaths,
    groupIds: groups.map((group) => group.id),
    caption,
  })
  if (!packet.ok) {
    writeFileSync(join(OUTPUT_DIR, 'group-post-skip.json'), JSON.stringify(packet, null, 2))
    return [{ status: 'skip-packet', error: packet.error }]
  }
  writeFileSync(join(OUTPUT_DIR, 'group-post-plan.json'), `${JSON.stringify({ ...packet, marketplaceItemUrl, imagePaths, groupIds: groups.map((group) => group.id), caption }, null, 2)}\n`)
  if (!await requestGroupAuthorization({ marketplaceItemUrl, imagePaths, groupIds: groups.map((group) => group.id), caption })) {
    return [{ status: 'skip-no-approval' }]
  }
  const results = []
  for (const group of groups) {
    try {
      await page.goto(group.url, { waitUntil: 'domcontentloaded', timeout: 90000 })
      await page.waitForTimeout(1200)
      const text = await page.locator('body').innerText()
      const composerState = classifyGroupComposerState(text)
      if (composerState !== 'ok-normal-composer') {
        results.push({ groupId: group.id, status: composerState })
        continue
      }
      const fileInput = page.locator('input[type="file"]').first()
      if (await fileInput.count()) await fileInput.setInputFiles(imagePaths)
      const box = page.getByRole('textbox', { name: /write something|what.?s on your mind|สร้างโพสต์|เขียน/i })
        .or(page.locator('[contenteditable="true"]'))
        .first()
      await box.click({ timeout: 8000 })
      await page.keyboard.insertText(caption)
      await page.getByRole('button', { name: /^(post|โพสต์)$/i }).first().click({ timeout: 8000 })
      results.push({ groupId: group.id, status: 'posted' })
    } catch (error) {
      writeFileSync(join(OUTPUT_DIR, `group-${group.id}-fail.json`), `${JSON.stringify({ group, error: error.message }, null, 2)}\n`)
      await page.screenshot({ path: join(OUTPUT_DIR, `group-${group.id}-fail.png`) }).catch(() => {})
      results.push({ groupId: group.id, status: 'fail-continue', error: error.message })
    }
  }
  writeFileSync(join(OUTPUT_DIR, 'group-post-results.json'), `${JSON.stringify(results, null, 2)}\n`)
  return results
}

/**
 * Structurally cannot run without a valid authorization object from
 * requestPublishAuthorization() in this same process. A missing/malformed
 * authorization throws before any browser interaction happens.
 */
async function publishToFacebook(authorization, previewSnapshot, page) {
  assertPublishAuthorization(authorization, previewSnapshot)

  const publishButton = page.getByRole('button', { name: /^(publish|เผยแพร่)$/i })
  await publishButton.waitFor({ state: 'visible', timeout: 15000 })
  await publishButton.click()
  await page.waitForTimeout(1500)

  return { status: 'published', authorizedAt: authorization.mintedAt }
}

async function main() {
  const draftArg = process.argv.slice(2).find((arg) => !arg.startsWith('--'))
  const { listing } = loadLatestDraft(draftArg)
  const { context, page } = await openDraftInBrowser(listing)
  try {
    const filled = await fillItemListingForm(page, listing)
    listing.category = filled.acceptedCategory
    const previewSnapshot = await advanceToFacebookPreview(page, listing, filled.form)
    const { authorization, check } = requestPublishAuthorization(previewSnapshot, {
      draft: listing,
      form: filled.form,
      displayText: formatListingForDisplay(listing),
    })

    if (!authorization) {
      writeFileSync(join(OUTPUT_DIR, 'sure-block.json'), `${JSON.stringify({ check, previewSnapshot, title: listing.title }, null, 2)}\n`)
      await page.screenshot({ path: join(OUTPUT_DIR, 'sure-block.png') }).catch(() => {})
      console.log(`\nNot sure (${(check?.failures || []).join(', ') || 'unknown'}). Nothing published. See output/sure-block.json`)
      return
    }

    const result = await publishToFacebook(authorization, previewSnapshot, page)
    const live = await readLiveListingUrl(page)
    if (live.url) rewriteFactsLive(listing, { url: live.url, id: live.id, category: filled.acceptedCategory })
    console.log(`\nDone: ${result.status}${live.url ? ` ${live.url}` : ''}`)
    console.log('Downstream duplicate delete and group repost skipped. Run those only after a verified live URL and fresh approval.')
  } finally {
    await context.close()
  }
}

async function assertRejects(fn) {
  try {
    await fn()
  } catch {
    return true
  }
  return false
}

async function runSelfTest() {
  // No stdin/browser: prove the structural gate rejects any authorization
  // that wasn't minted by requestPublishAuthorization(). Awaited directly --
  // this must not depend on microtask/macrotask ordering, since it's the one
  // test whose whole job is proving the gate can't be bypassed.
  const previewSnapshot = {
    stage: 'facebook-preview',
    pageUrl: 'https://www.facebook.com/marketplace/create/item/preview',
    publishButtonName: 'Publish',
    bodyExcerpt: 'Preview excerpt',
    listingType: 'item',
    title: 'Canon EOS body',
    priceText: '฿5000.00',
  }
  const authorization = {
    nonce: randomUUID(),
    previewFingerprint: buildPreviewFingerprint(previewSnapshot),
    mintedAt: Date.now(),
  }
  validAuthorizations.add(authorization)

  const threwOnMissing = await assertRejects(() => publishToFacebook(null, previewSnapshot, {}))
  const threwOnForged = await assertRejects(() => publishToFacebook({ nonce: randomUUID(), mintedAt: Date.now() }, previewSnapshot, {}))
  const threwOnMismatchedPreview = await assertRejects(() => publishToFacebook(
    authorization,
    { ...previewSnapshot, priceText: '฿5100.00' },
    {}
  ))

  if (!threwOnMissing || !threwOnForged || !threwOnMismatchedPreview) {
    console.error('✗ FAIL: publishToFacebook did not reject missing/forged/mismatched preview authorization')
    process.exit(1)
  }
  console.log('✓ facebook_marketplace_publish.mjs self-test passed (gate rejects missing, forged, and mismatched preview authorization)')
  process.exit(0)
}

const isMain = resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))
if (isMain) {
  if (process.argv.includes('--self-test')) {
    runSelfTest()
  } else {
    main().catch((err) => {
      console.error('Fatal publish error:', err)
      process.exit(1)
    })
  }
}

export {
  advanceToFacebookPreview,
  assertPublishAuthorization,
  buildPreviewFingerprint,
  capturePreviewSnapshot,
  fillItemListingForm,
  formatPreviewSnapshot,
  loadLatestDraft,
  openDraftInBrowser,
  publishToFacebook,
  requestDeleteAuthorization,
  requestGroupAuthorization,
  requestPublishAuthorization,
  rewriteFactsLive,
  validatePreviewSnapshot,
}
