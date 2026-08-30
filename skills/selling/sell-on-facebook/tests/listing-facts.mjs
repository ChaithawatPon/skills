import assert from 'node:assert/strict'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import {
  answerFromListingFact,
  formatListingFactsMarkdown,
  loadListingFacts,
  matchListingFact,
  parseListingFactsMarkdown,
  writeListingFacts,
} from '../lib/listing_facts.mjs'

test('listing facts parse, match, and answer from markdown', () => {
  const dir = mkdtempSync(join(tmpdir(), 'listing-facts-'))
  try {
    const fact = {
      folder: 'a4-paper-cutter',
      title: 'แท่นตัดกระดาษ A4',
      status: 'draft',
      price_thb: '220',
      condition: 'Good',
      facebook_condition: 'Used - Good',
      includes: 'แท่นตัด + กล่องตามรูป',
      meetup: 'กรุงเทพ (รายละเอียดนัดตอนทัก)',
      shipping: 'ไม่รวมส่ง เว้นแต่ตกลงกัน',
      size: 'A4',
      description: 'ขาย แท่นตัดกระดาษ A4',
    }
    const path = writeListingFacts(fact, dir)
    const loaded = loadListingFacts(dir)
    assert.equal(loaded.length, 1)
    assert.equal(loaded[0].title, 'แท่นตัดกระดาษ A4')
    assert.equal(matchListingFact('แท่นตัดกระดาษ A4', loaded)?.folder, 'a4-paper-cutter')
    assert.equal(answerFromListingFact('ราคาเท่าไหร่', loaded[0], 'ครับ'), '220 บาทครับ')
    assert.equal(answerFromListingFact('ส่งไหม', loaded[0], 'ครับ'), 'ไม่รวมส่ง เว้นแต่ตกลงกันครับ')
    assert.equal(answerFromListingFact('ประกันกี่ปี', loaded[0], 'ครับ'), '')
    const roundTrip = parseListingFactsMarkdown(readFileSync(path, 'utf8'), path)
    assert.equal(roundTrip.price_thb, '220')
    assert.match(formatListingFactsMarkdown(fact), /price_thb: 220/)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})
