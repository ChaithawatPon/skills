---
name: sell-on-thaimart
description: Manage second-hand ThaiMart seller listings through the logged-in seller website. Use for monitoring products and orders, creating or editing drafts, and profile maintenance.
---
> Prefer **/sell-item** as the entry point. It asks which marketplace to use, then loads this skill. Invoke `/sell-on-thaimart` directly only when the platform is already known.


# Sell To ThaiMart

Use one visible Chrome window against ThaiMart Seller Centre. Keep the persistent profile under this skill's gitignored `state/browser-profile`. Choose a local CDP port and reuse it.

## Workflow

1. Attach to the existing seller session. If login is required, leave that window open for OTP. Stop on CAPTCHA, identity checks, payment, or policy warnings.
2. Select mode: monitor, create drafts, edit, order review, or profile update.
3. Enter only source-backed facts. Put the clearest full-item photo first.
4. Re-read the saved draft. Record its seller reference.
5. Ask for fresh approval immediately before publishing, changing account identity, changing prices in bulk, or cancelling/refunding orders.

## Boundaries

- Treat a draft save as an external mutation. Avoid duplicate drafts.
- The live form is the source of truth for required fields. A similarly named field on another marketplace is not evidence.
- ThaiMart-only by default. Cross-post only when asked.
- Keep credentials and raw customer data out of notes.
