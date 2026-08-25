# Imported sources

Snapshot date: 2026-08-26.

Trees were copied from the rewritten public `main` branches. File history of
the standalone repositories is not replayed here.

| Package | Source | Commit | Tag |
|---|---|---|---|
| edit-video | https://github.com/ChaithawatPon/edit-video.git | 77218de319deaae9c402bee5f04882c31fe67a31 | v1.0.2 |
| sell-to-facebook-marketplace | https://github.com/ChaithawatPon/sell-to-facebook-marketplace.git | b317582296576ead482f8e7df173631b8d9f981b | v1.1.2 |
| social-update | https://github.com/ChaithawatPon/social-update.git | 19686b2e53cd792e53ad9922ee99a8d3cf39e394 | v1.0.1 |
| sumup | https://github.com/ChaithawatPon/sumup.git | cfbc42242c1df0167ac7a098329845b2edb2d0f4 | v1.0.1 |
| today-obsidian | https://github.com/ChaithawatPon/today-obsidian.git | c45b07dba81b6d095eb7bf58cb5668c724f48467 | v1.0.1 |

The Marketplace package uses the inner `sell-to-facebook-marketplace/` directory
from its standalone repository so this catalog keeps `SKILL.md` at
`skills/<name>/SKILL.md`.

`skills/scripts/install-skill.py` is the Marketplace package installer copied
from the standalone wrapper so `npm test` still finds it one directory above
the package.
