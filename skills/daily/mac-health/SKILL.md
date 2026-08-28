---
name: mac-health
description: Route personal maintenance to a macOS storage audit, a digital-footprint privacy review, or both. Use when a user asks for a Mac health check or wants help choosing between storage and privacy cleanup.
---

# Mac Health

Choose one mode, run `python3 scripts/route.py <storage|privacy|full>`, then load and follow each returned skill in order.

- `storage` routes to `clean-mac-storage`.
- `privacy` routes to `clean-digital-footprint`.
- `full` runs the privacy review before the storage audit.

Preserve every child skill's approval boundary. A full run authorizes audits only; it does not authorize deletion, uninstalling, account changes, or public communication. Report each child result separately and mark partial failures.
