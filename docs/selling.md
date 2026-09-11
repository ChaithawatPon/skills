# ของต้องขาย

Seller workflows for preparing listings, checking marketplace state, and
keeping public actions behind explicit approval gates.

## Entry point

Use **`sell-item`** first. It asks which marketplace(s) to use, then routes into
the matching platform backend. Prefer `/sell-item` over calling a `sell-on-*`
skill directly unless the platform is already known.

| Skill | Role |
|---|---|
| `sell-item` | Router / entry point (Facebook, Shopee, ThaiMart, TikTok Shop, Amazon, eBay, Other) |
| `sell-on-facebook` | Backend — Facebook Marketplace |
| `sell-on-shopee` | Backend — Shopee |
| `sell-on-thaimart` | Backend — ThaiMart |
| `sell-on-tiktok-shop` | Backend — TikTok Shop |
| `post-service-on-fastwork` | Fastwork *services* (not personal item resale) |

Amazon and eBay are listed in `sell-item` as draft-only until dedicated backend
skills exist. Multi-platform runs go one marketplace at a time with the same
item facts; each public action still needs fresh approval.

Packages on disk:

- `skills/selling/sell-item`
- `skills/selling/sell-on-facebook`
- `skills/selling/sell-on-shopee`
- `skills/selling/sell-on-thaimart`
- `skills/selling/sell-on-tiktok-shop`
- `skills/selling/post-service-on-fastwork`
