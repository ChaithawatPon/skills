# Marketplace Workflow

Read the branch matching the current input. A later branch cannot consume stale output from an earlier item.

## Folder input

### Inspect

- Identify exact source folder and count media.
- Read canonical listing JSON, price row, hook row, and live facts when present.
- Inspect the hook and only enough additional photos to verify the item and included parts.
- Classify every claim as confirmed, missing, or excluded. Ask the operator for missing facts.

Complete when item identity, included parts, condition, and excluded evidence are explicit.

### Research price

- Search the exact brand/model when known. Otherwise use visual identification only to generate candidates and ask the operator to confirm identity.
- Prefer current Thai listings and sold/used comparables of similar condition. Separate new retail price from used asking price.
- Record source URL, observed price, condition, included parts, and observation date.
- Remove obvious accessories, unrelated variants, installment prices, and implausible outliers.
- Report a market range and recommended asking price. The operator locks the listing price.

Complete when the price has evidence and the operator has selected the exact asking price.

### Preflight current selling list

- Scan `/marketplace/you/selling/` before opening create-item.
- Compare canonical listing IDs plus normalized title, known brand/model, price, and visible photos.
- Record possible same-item listings. Newest is usually nearer the top, but position is supporting evidence only.
- Keep every old listing live during replacement creation.

Complete when same-item candidates are recorded by canonical ID or the scan reports none.

### Draft and preview

- Generate the local draft from explicit metadata.
- Write draft listing facts for inbox use.
- Fill one Facebook Item form in one headed Chrome launch.
- Require title, price, condition, accepted category, item type, expected photo count, 1-20 unique relevant product-tag chips, Hide from friends ON, and final Publish button on preview. One accepted tag is enough when Facebook only keeps one.
- Block on login wall, mismatched preview, incomplete uploads, or uncertain identity.

Complete when the preview matches the current item and sure-checks mint the per-run publish token.

### Publish and verify

- Click Publish once with the preview-bound token.
- Capture one canonical `https://www.facebook.com/marketplace/item/<id>/` URL.
- Open it and verify title and price match the current draft.
- Reject missing, reused, redirected, or mismatched IDs.
- Write live listing facts only after verification.

Complete when the replacement listing has a verified canonical ID and live facts.

### Retire the old listing

- Re-scan candidates after the replacement is verified.
- Exclude the new ID.
- Match exact title and exact price for the automatic duplicate path.
- Zero matches: stop duplicate work.
- One match: show old title, price, ID, and URL; require typed `yes` in-process.
- Multiple matches: write a stop artifact for manual selection.

Complete when no duplicate exists, the operator declines, or one approved old listing is deleted and absence is verified.

### Repost groups

- Build a packet containing verified item ID/URL, caption, exact group IDs, and photo list.
- Require fresh approval for that packet.
- Check each target without joining. A public group is eligible when it exposes a normal `Write something…` post composer, even if `Join group` is also visible.
- Use only the normal post composer. Block `Sell Something` and Marketplace listing composers because they can create duplicate listings.
- Attach hook plus item stills, maximum 10. Continue after isolated group failures; never Join.
- Verify the caption URL still resolves to the same item.

Complete when every approved group is posted, skipped with reason, or failed with evidence.

## No-folder input

### Inbox

- Match seller-owned threads to live listing facts.
- Answer only with recorded or visible facts.
- Skip negotiation, reservation, status change, unsupported facts, and buyer-owned threads.
- Persist reply fingerprints. Allow one follow-up after 24 hours of buyer silence.

### Low-click inventory

- Scan active inventory read-only.
- Mark low-click candidates using configured click and age thresholds.
- Require a verified listing identity before proposing maintenance.
- Compare current content with canonical facts and current market-price evidence.
- Prepare exact proposed title, description, tags, hook/photo changes, price, and group repost packet.
- Never apply a public change from inventory/autopilot. Route one listing through maintenance approval.

## Invariants

- Start or reuse the shared Marketplace Chrome CDP session before Facebook work. Keep it open until all related steps finish so Facebook sees one browser identity; do not mix persistent Playwright launches and manual Chrome against the same profile.
- Canonical JSON and live listing facts outrank generated indexes and old dumps.
- One item owns one current workflow state.
- Source photos remain unchanged unless the operator explicitly approves move.
- Public writes use current visible Facebook evidence.
- A failed step stops downstream actions for that item.
