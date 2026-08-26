---
name: sell-to-shopee
description: Manage second-hand Shopee seller listings through the logged-in seller website. Use for monitoring products and orders, creating or editing listings, and profile maintenance.
---

# Sell To Shopee

Use one visible Chrome window against Shopee Seller Centre. Keep the persistent profile under this skill's gitignored `state/browser-profile`. Choose a local CDP port and reuse it.

## Workflow

1. Attach to the existing seller session. If login is required, leave that window open for the seller to finish. Stop on CAPTCHA, identity checks, payment, or policy warnings.
2. Inspect the current seller page and report what is visible before changing anything.
3. Enter only source-backed product facts: truthful title, photos, category, price, stock, shipping, and condition.
4. Save drafts freely. Ask for fresh approval immediately before publishing, changing account identity, changing prices in bulk, or cancelling/refunding orders.
5. After an approved change, verify the seller page shows the resulting status and report the listing or order reference.

## Boundaries

- Never guess brand, model, or included parts from photos alone.
- Never expose credentials or save raw customer data.
- Marketplace-only by default. Do not cross-post unless asked.
- Local notify after publish is optional and must not hard-code destination IDs in this package.
