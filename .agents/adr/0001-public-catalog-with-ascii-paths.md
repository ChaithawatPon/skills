# ADR 0001: Public Catalog With ASCII Paths

## Decision

Keep installable packages under `skills/<category>/<name>/` with ASCII category
slugs. Use playful Thai category display names in README and docs.

## Reason

ASCII paths are safer for shell commands, CI, npm scripts, and copy/install
flows. Thai display names make the catalog easier for Pon to scan without
making automation fragile.
