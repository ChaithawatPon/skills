# Imported sources

Catalog reorganized 2026-08-26 into `skills/<category>/<name>/`.

Existing packages were moved from the previous flat `skills/<name>/` layout.
Their files still match the rewritten public standalone `main` trees:

| Package | Previous standalone repo | Imported `main` | Release |
|---|---|---|---|
| edit-video | https://github.com/ChaithawatPon/edit-video.git | `77218de` | v1.0.2 |
| sell-on-facebook | https://github.com/ChaithawatPon/sell-to-facebook-marketplace.git | `b317582` | v1.1.2 |
| social-update | https://github.com/ChaithawatPon/social-update.git | `19686b2` | v1.0.1 |
| today-obsidian | https://github.com/ChaithawatPon/today-obsidian.git | `c45b07d` | v1.0.1 |

`check-assignment`, `get-file-from-assignment`, `do-assignment`, `eli5-assignment`,
`clean-mac-storage`, `mac-health`, `clean-digital-footprint`, `find-room`,
`find-item`, `find-sell-spont`, `find-place-to-eat`, `transaction`,
`sell-on-shopee`, `sell-on-thaimart`, and `sell-on-tiktok-shop` are
public-safe rewrites. They do not copy private installed skill trees.

`android-harness` remains a standalone public package at
https://github.com/ChaithawatPon/android-harness. The catalog links to that
canonical source instead of copying its tree, preventing divergent releases.

After this catalog is on `main` and CI is green, the standalone public skill
repositories are scheduled for deletion. `arm-robot-simulation` and the
profile README repo stay.
