# Imported sources

Catalog reorganized 2026-08-26 into `skills/<category>/<name>/`.

Existing packages were moved from the previous flat `skills/<name>/` layout.
Their files still match the rewritten public standalone `main` trees:

| Package | Previous standalone repo | Imported `main` | Release |
|---|---|---|---|
| edit-video | https://github.com/ChaithawatPon/edit-video.git | `77218de` | v1.0.2 |
| sell-to-facebook-marketplace | https://github.com/ChaithawatPon/sell-to-facebook-marketplace.git | `b317582` | v1.1.2 |
| social-update | https://github.com/ChaithawatPon/social-update.git | `19686b2` | v1.0.1 |
| sumup | https://github.com/ChaithawatPon/sumup.git | `cfbc422` | v1.0.1 |
| today-obsidian | https://github.com/ChaithawatPon/today-obsidian.git | `c45b07d` | v1.0.1 |

`doer-assignment` config example and privacy scanner come from public
`ChaithawatPon/doer-assignment` (`v1.0.0`). The catalog `SKILL.md` is a
compatibility alias to `n2n-assignment`.

`n2n-assignment`, `check-assignment`, `do-assignment`, `eli5-assignment`,
`sell-to-shopee`, `sell-to-thaimart`, and `sell-to-tiktok-shop` are
public-safe rewrites. They do not copy private installed skill trees.

After this catalog is on `main` and CI is green, the standalone public skill
repositories are scheduled for deletion. `arm-robot-simulation` and the
profile README repo stay.
