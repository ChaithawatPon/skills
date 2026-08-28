---
name: clean-digital-footprint
description: Audit and clean a user's social-network activity history, comments, reactions, and profile traces. Use for a review-first privacy sweep; deletion always requires explicit approval.
---

# Clean Digital Footprint

Use the platform's visible activity-log and privacy controls in the user's existing signed-in browser session.

## Workflow

1. Confirm the platform, account, date range, and activity types in scope.
2. Capture a read-only inventory with date, type, visible text, stable URL, audience when shown, and available action.
3. Group findings into `remove`, `keep`, `review`, and `unavailable`. Save a local report before proposing changes.
4. Show the exact candidate items and proposed action. Wait for fresh approval naming the target group or individual items.
5. Change only approved items, then reload the activity log and verify each result.

## Boundaries

- Never use broad selection, delete-all controls, or account-setting changes without explicit scope.
- Use visible content and stable links; do not identify an item from hidden DOM content or an ambiguous screenshot.
- Stop on login, CAPTCHA, MFA, checkpoint, suspicious-account warning, or changed target.
- Keep raw screenshots and personal activity records local. Redact personal information before sharing any report.
- Approval for one activity type, date range, or platform does not authorize another.
