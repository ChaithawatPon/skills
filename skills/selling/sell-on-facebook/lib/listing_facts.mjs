import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { LISTING_FACTS_DIR } from './runtime_paths.mjs'

const FIELD_RE = /^([a-z][a-z0-9_]*)\s*:\s*(.*)$/i

function normalize(value) {
  return String(value || '').replace(/\s+/g, ' ').trim()
}

export function parseListingFactsMarkdown(text, filePath = '') {
  const lines = String(text || '').split(/\r?\n/)
  const fields = {}
  let title = ''
  const body = []

  for (const line of lines) {
    const heading = line.match(/^#\s+(.+)$/)
    if (heading && !title) {
      title = normalize(heading[1])
      continue
    }
    const field = line.match(FIELD_RE)
    if (field && !line.startsWith('    ')) {
      fields[field[1].toLowerCase()] = normalize(field[2])
      continue
    }
    body.push(line)
  }

  return {
    filePath,
    folder: fields.folder || '',
    title: title || fields.title || '',
    status: fields.status || 'draft',
    price_thb: fields.price_thb || '',
    condition: fields.condition || '',
    facebook_condition: fields.facebook_condition || '',
    category: fields.category || '',
    size: fields.size || '',
    includes: fields.includes || '',
    meetup: fields.meetup || '',
    shipping: fields.shipping || '',
    marketplace_url: fields.marketplace_url || '',
    listing_id: fields.listing_id || '',
    description: normalize(body.join('\n')),
    fields,
  }
}

export function formatListingFactsMarkdown(fact) {
  const title = fact.title || 'Untitled listing'
  const lines = [
    `# ${title}`,
    '',
    `folder: ${fact.folder || ''}`,
    `status: ${fact.status || 'draft'}`,
    `price_thb: ${fact.price_thb || ''}`,
    `condition: ${fact.condition || ''}`,
    `facebook_condition: ${fact.facebook_condition || ''}`,
    `category: ${fact.category || ''}`,
    `size: ${fact.size || ''}`,
    `includes: ${fact.includes || ''}`,
    `meetup: ${fact.meetup || ''}`,
    `shipping: ${fact.shipping || ''}`,
    `marketplace_url: ${fact.marketplace_url || ''}`,
    `listing_id: ${fact.listing_id || ''}`,
    '',
    fact.description ? `${fact.description.trim()}\n` : '',
  ]
  return lines.join('\n')
}

export function listingFactsPath(folder, factsDir = LISTING_FACTS_DIR) {
  const slug = normalize(folder).replace(/[^a-z0-9._-]+/gi, '-').replace(/^-+|-+$/g, '') || 'listing'
  return join(factsDir, `${slug}.md`)
}

export function writeListingFacts(fact, factsDir = LISTING_FACTS_DIR) {
  mkdirSync(factsDir, { recursive: true })
  const target = listingFactsPath(fact.folder || fact.title, factsDir)
  writeFileSync(target, formatListingFactsMarkdown(fact))
  if (fact.photo_folder && existsSync(fact.photo_folder)) {
    writeFileSync(join(fact.photo_folder, 'LISTING.md'), formatListingFactsMarkdown(fact))
  }
  return target
}

export function loadListingFacts(factsDir = LISTING_FACTS_DIR) {
  if (!existsSync(factsDir)) return []
  return readdirSync(factsDir)
    .filter((name) => name.endsWith('.md'))
    .map((name) => {
      const filePath = join(factsDir, name)
      return parseListingFactsMarkdown(readFileSync(filePath, 'utf8'), filePath)
    })
    .filter((fact) => fact.title || fact.folder)
}

export function matchListingFact(listingTitle, facts = []) {
  const needle = normalize(listingTitle).toLowerCase()
  if (!needle) return null
  return facts.find((fact) => {
    const title = normalize(fact.title).toLowerCase()
    const folder = normalize(fact.folder).toLowerCase().replace(/-/g, ' ')
    return (title && (needle === title || needle.includes(title) || title.includes(needle))) ||
      (folder && needle.includes(folder))
  }) || null
}

export function answerFromListingFact(buyerText, fact, particle = 'ครับ') {
  const text = normalize(buyerText)
  if (!text || !fact) return ''

  if (/(ราคา|เท่าไหร่|เท่าไร|how much|price)/i.test(text) && fact.price_thb) {
    return `${fact.price_thb} บาท${particle}`
  }
  if (/(สภาพ|condition|มือสอง)/i.test(text) && (fact.condition || fact.facebook_condition)) {
    return `สภาพ${fact.facebook_condition || fact.condition} ตามรูป${particle}`
  }
  if (/(รวม|มีอะไรบ้าง|กล่อง|อุปกรณ์|includes|what.?s included)/i.test(text) && fact.includes) {
    return `รวม ${fact.includes}${particle}`
  }
  if (/(นัด|ที่ไหน|meetup|รับที่|location|กรุงเทพ)/i.test(text) && fact.meetup) {
    return `${fact.meetup}${particle}`
  }
  if (/(ส่ง|delivery|shipping|จัดส่ง)/i.test(text) && fact.shipping) {
    return `${fact.shipping}${particle}`
  }
  if (/(ไซซ์|ขนาด|size)/i.test(text) && fact.size) {
    return `ไซซ์ ${fact.size}${particle}`
  }
  return ''
}
