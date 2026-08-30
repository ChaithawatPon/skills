import test from 'node:test'
import assert from 'node:assert/strict'
import {
  DEFAULT_CDP_URL,
  connectSharedChrome,
  marketplaceCdpUrl,
  unrefCdpSocket,
} from '../lib/browser_launch.mjs'

test('CDP is the default browser identity', () => {
  assert.equal(marketplaceCdpUrl({}), DEFAULT_CDP_URL)
  assert.equal(marketplaceCdpUrl({ MARKETPLACE_CDP_URL: 'http://127.0.0.1:9333' }), 'http://127.0.0.1:9333')
  assert.equal(marketplaceCdpUrl({ MARKETPLACE_DISABLE_CDP: 'true' }), '')
})

test('CDP socket detaches without sending Browser.close', () => {
  let unrefCount = 0
  const socket = {
    constructor: { name: 'Socket' },
    remotePort: 9222,
    unref: () => { unrefCount += 1 },
  }
  unrefCdpSocket(DEFAULT_CDP_URL, [socket])
  assert.equal(unrefCount, 1)
})

test('shared context preserves normal context methods', async () => {
  const context = { pages: () => ['page'] }
  const browser = {
    contexts: () => [context],
  }
  const chromium = { connectOverCDP: async () => browser }
  const shared = await connectSharedChrome(chromium, DEFAULT_CDP_URL)
  assert.deepEqual(shared.pages(), ['page'])
})
