# Repository rules

This public repository contains one portable agent skill.

- Keep exactly one root `SKILL.md`; its frontmatter `name` must match the
  repository name and contain only `name` and `description`.
- Keep personal data, customer material, credentials, browser state, private
  paths, raw captures, and machine-specific configuration out of Git.
- Do not add symlinks or vendored private assets.
- Treat public visibility as insufficient proof of redistribution rights.
- Run `python3 scripts/validate-skill.py .` before every commit and release.
- External posts, messages, applications, payments, profile edits, publishing,
  and deletions retain the exact approval rules in `SKILL.md`.
