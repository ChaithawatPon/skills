---
name: sell-item
description: >-
  Sell or list a personal item. Use when the user invokes /sell-item, wants to
  post something for sale, cross-list an item, or asks to sell on Facebook,
  Shopee, ThaiMart, TikTok Shop, Amazon, eBay, or another marketplace. Asks
  where to post, then routes into the matching platform skill.
---

# sell-item

One entry point for selling. Platform recipes stay in sibling skills; this skill
only picks destination(s) and hands off.

## Step 0 — Gather the item (if missing)

If the user has not already named the item, ask briefly for:

- what it is (source-backed title; never invent brand/model from photos alone)
- photos / folder path
- asking price and currency
- condition + what is included
- location / shipping preference if relevant

Do not publish anything in this step.

## Step 1 — Ask where to post

If the user already named one or more platforms in the same message, skip the
question and use those. Otherwise ask with a multi-select (widget when available):

**Where should we list this?**

| Option | Routes to |
| --- | --- |
| Facebook Marketplace | `../sell-on-facebook/SKILL.md` |
| Shopee | `../sell-on-shopee/SKILL.md` |
| ThaiMart | `../sell-on-thaimart/SKILL.md` |
| TikTok Shop | `../sell-on-tiktok-shop/SKILL.md` |
| Amazon | *not wired yet* — draft listing copy only; stop before any Amazon seller action |
| eBay | *not wired yet* — draft listing copy only; stop before any eBay seller action |
| Other (name it) | Draft only unless a matching skill exists |

Allow multi-select. Run chosen platforms **one after another** (same item facts),
not in parallel browser sessions that share one login profile.

Compatibility aliases that should load this skill instead of a lone platform:
`/sell-on-facebook`, `/sell-on-shopee`, `/sell-on-thaimart`,
`/sell-on-tiktok-shop`, `/sell-on-facebook-marketplace` — if invoked **without**
an explicit platform already chosen in-message, treat as `/sell-item` and ask.

## Step 2 — Hand off

For each selected **wired** platform:

1. Resolve this skill directory, then `Read` the sibling `SKILL.md` from the
   table above (on Pon-Mac use `ListMachines` + that machineId).
2. Follow that platform skill exactly, including its approval gates.
3. Pass through the same item facts (photos, price, condition, includes).
4. After each platform finishes (or stops for approval), report the result,
   then continue to the next selected platform.

For **Amazon / eBay / Other** until a dedicated skill exists:

- Draft title, description, category guess, and photo order from verified facts
- Do **not** open seller consoles or click Publish
- Offer to add a real platform skill later

## Safety (always)

- Never invent brand, model, quantity, or accessories from photos alone.
- Never publish, delete, change live price/stock, or message buyers without a
  **fresh exact approval** in the same run (platform skill rules win).
- Never save passwords, cookies, tokens, or raw customer PII into notes.
- Cross-posting is explicit only — only platforms the user selected this run.

## Grok Bot note

When running inside Grok Bot, this file may be a thin wrapper elsewhere. Always
prefer the Mac copy under
`~/work/active/skills/skills/selling/sell-item/SKILL.md` as source of truth.
