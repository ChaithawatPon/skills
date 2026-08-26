# AGENTS.md

Public skill monorepo for `ChaithawatPon/skills`.

- Each installable skill lives under `skills/<category>/<name>/` with its own `SKILL.md`.
- Categories are `selling`, `university`, `daily`, `career`, and `media`.
- Do not copy private skills, browser state, inventory, credentials, Discord
  channel IDs, student identifiers, or local runtime output into this repository.
- This repository is the public installable catalog. Standalone skill
  repositories are retired after their trees live here and CI is green.
- Validate before release: `bash scripts/validate.sh`.
