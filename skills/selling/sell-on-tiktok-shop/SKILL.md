---
name: sell-on-tiktok-shop
description: Manage TikTok Shop seller listings through the logged-in seller website. Use for product drafts, publishing, inventory and price updates, order monitoring, buyer-message drafts, and compliant basket-content preparation.
---
> Prefer **/sell-item** as the entry point. It asks which marketplace to use, then loads this skill. Invoke `/sell-on-tiktok-shop` directly only when the platform is already known.


# Sell to TikTok Shop

Use the visible TikTok Shop Seller Center in the seller's existing logged-in browser session.

## Operating boundary

- Read-only checks of products, orders, account status, violations, and messages may run without approval.
- Prepare listing forms, replies, and content drafts freely. Stop at the final review screen before any external action.
- Get exact in-session approval immediately before publishing or deleting a product, changing a live price or stock count, joining a promotion, sending a buyer message, accepting a return, cancelling an order, or marking an order shipped.
- Stop on login, CAPTCHA, MFA, recovery, account mismatch, or selector drift.

## Product workflow

1. Reconcile the exact item from the seller's photos and facts. Never infer a brand, model, quantity, condition, or included accessory from appearance alone.
2. Check category and restricted-product rules. For food, supplements, cosmetics, or regulated goods, require the exact package evidence and applicable registration number. Never submit a placeholder identifier.
3. Draft truthful customer-facing copy. Enter only verified price, stock, variation, weight, parcel dimensions, condition, and fulfillment facts.
4. Use only owned or licensed images and video. The first image must show the complete item.
5. Inspect the platform preview. Ask for publish approval only after that review passes.
6. After approved publication, verify the product list and record the canonical product ID or URL. Treat `under review` as submitted, not live.

## Orders and messages

- Distinguish buyer and seller roles. Never reply where the user is the buyer.
- Draft replies from listing and order facts only. Escalate negotiation, discounts, disputes, and missing facts.
- Do not expose phone numbers, identity documents, or home addresses.

## Basket content

Follow [`references/basket-content.md`](references/basket-content.md) when the task includes a shoppable video or product-basket post.
