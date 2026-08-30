#!/usr/bin/env node
/**
 * Google Lens Product & Price Lookup
 * Uploads an item image to Google Lens to discover product name, market prices, and shopping comparisons.
 * Usage: node scripts/google_lens_price.mjs <path-to-image>
 */

import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright';

const imagePath = process.argv[2];

if (!imagePath) {
  console.error('Usage: node scripts/google_lens_price.mjs <path-to-image>');
  process.exit(1);
}

const resolvedPath = path.resolve(imagePath);
if (!fs.existsSync(resolvedPath)) {
  console.error(`Error: Image file not found at ${resolvedPath}`);
  process.exit(1);
}

async function lookupPrice() {
  console.log(`[google-lens] Inspecting item image: ${resolvedPath}...`);

  const chromeExec = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  const launchOptions = {
    headless: true,
    args: ['--disable-blink-features=AutomationControlled']
  };
  if (fs.existsSync(chromeExec)) {
    launchOptions.executablePath = chromeExec;
  }

  const browser = await chromium.launch(launchOptions);
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
  });

  const page = await context.newPage();

  try {
    console.log('[google-lens] Navigating to Google Search & Lens...');
    await page.goto('https://www.google.com', { waitUntil: 'domcontentloaded', timeout: 30000 });

    // Look for Google Lens upload button
    const lensButton = page.locator('div[aria-label="Search by image"], div[role="button"][aria-label*="image"], div.nDcEnd, [data-base-lens-url]');
    
    if (await lensButton.count() > 0) {
      await lensButton.first().click();
      await page.waitForTimeout(1000);
      
      const fileInput = page.locator('input[type="file"], input[type="file"][name="encoded_image"]');
      if (await fileInput.count() > 0) {
        await fileInput.first().setInputFiles(resolvedPath);
        console.log('[google-lens] Uploaded image to Lens, awaiting visual matches...');
        await page.waitForTimeout(5000);
      }
    } else {
      // Fallback direct lens upload
      await page.goto('https://lens.google.com', { waitUntil: 'domcontentloaded', timeout: 30000 });
      const fileInput = page.locator('input[type="file"]');
      if (await fileInput.count() > 0) {
        await fileInput.first().setInputFiles(resolvedPath);
        await page.waitForTimeout(5000);
      }
    }

    // Extract match data
    const pageTitle = await page.title();
    const bodyText = await page.innerText('body');

    // Extract price patterns e.g. ฿1,200, 1,200 บาท, THB 1200
    const priceMatches = bodyText.match(/(?:฿|THB|บาท)\s*([0-9,]+(?:\.[0-9]{2})?)|([0-9,]+(?:\.[0-9]{2})?)\s*(?:บาท|THB|฿)/gi) || [];
    const prices = [];

    for (const m of priceMatches) {
      const num = parseFloat(m.replace(/[^0-9.]/g, ''));
      if (!isNaN(num) && num > 50 && num < 500000) {
        prices.push(num);
      }
    }

    // Deduplicate & sort prices
    const uniquePrices = Array.from(new Set(prices)).sort((a, b) => a - b);
    
    let minPrice = uniquePrices[0] || null;
    let maxPrice = uniquePrices[uniquePrices.length - 1] || null;
    let avgPrice = uniquePrices.length > 0 ? Math.round(uniquePrices.reduce((a, b) => a + b, 0) / uniquePrices.length) : null;

    const result = {
      image: resolvedPath,
      detected_prices_count: uniquePrices.length,
      price_range_thb: {
        min: minPrice,
        avg: avgPrice,
        max: maxPrice
      },
      sampled_prices: uniquePrices.slice(0, 5),
      page_title: pageTitle
    };

    console.log('\n==================================================');
    console.log('🔍 Google Lens Product & Price Analysis Result');
    console.log('==================================================');
    if (avgPrice) {
      console.log(`• Estimated Market Range : ฿${minPrice?.toLocaleString()} – ฿${maxPrice?.toLocaleString()} THB`);
      console.log(`• Suggested Average Price : ฿${avgPrice?.toLocaleString()} THB`);
    } else {
      console.log('• No direct price tag identified on visual matches.');
      console.log('• Recommendation: Input price based on item condition.');
    }
    console.log('==================================================\n');

    // Output JSON for scripts / automation
    const outDir = path.join(path.dirname(resolvedPath), 'output');
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    const outPath = path.join(outDir, 'lens_price_lookup.json');
    fs.writeFileSync(outPath, JSON.stringify(result, null, 2));

    await browser.close();
    return result;

  } catch (err) {
    console.error('[google-lens] Lookup error:', err.message);
    await browser.close();
    process.exit(1);
  }
}

lookupPrice();
