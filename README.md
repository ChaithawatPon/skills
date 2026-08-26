# ChaithawatPon skills

Public agent skills for practical work. One repository. Each skill is a
complete installable package under `skills/<category>/<name>/`.

This is the only public skill catalog. Install from here.

## Install

```bash
npx skills add ChaithawatPon/skills
```

Or copy one package:

```bash
git clone https://github.com/ChaithawatPon/skills.git
cp -R skills/<category>/<name> ~/.claude/skills/<name>
```

## Selling

| Skill | Outcome |
|---|---|
| [sell-to-facebook-marketplace](skills/selling/sell-to-facebook-marketplace/SKILL.md) | Marketplace listings and seller workflows with explicit approval before public actions. |
| [sell-to-shopee](skills/selling/sell-to-shopee/SKILL.md) | Second-hand Shopee drafts and seller-centre work. Publish needs a fresh yes. |
| [sell-to-thaimart](skills/selling/sell-to-thaimart/SKILL.md) | Second-hand ThaiMart drafts and seller-centre work. Publish needs a fresh yes. |
| [sell-to-tiktok-shop](skills/selling/sell-to-tiktok-shop/SKILL.md) | TikTok Shop drafts, orders, and shoppable basket content. |

## University

| Skill | Outcome |
|---|---|
| [n2n-assignment](skills/university/n2n-assignment/SKILL.md) | Routes scan, explain, or create. Front door for assignment work. |
| [check-assignment](skills/university/check-assignment/SKILL.md) | Collects verified lecture files and assignment briefs from visible course sources. |
| [do-assignment](skills/university/do-assignment/SKILL.md) | Builds a review-ready deliverable after an ideas interview and outline approval. |
| [eli5-assignment](skills/university/eli5-assignment/SKILL.md) | Explains one verified brief as a simple visual HTML page. |
| [doer-assignment](skills/university/doer-assignment/SKILL.md) | Compatibility alias for `n2n-assignment`. |

## Daily

| Skill | Outcome |
|---|---|
| [today-obsidian](skills/daily/today-obsidian/SKILL.md) | Builds an idempotent daily cockpit from unfinished tasks and verified work evidence. |
| [sumup](skills/daily/sumup/SKILL.md) | Converts a completed session into a durable summary and continuation handoff. |

## Career

| Skill | Outcome |
|---|---|
| [social-update](skills/career/social-update/SKILL.md) | Professional profiles, portfolio content, job research, and approval-gated outreach. |

## Media

| Skill | Outcome |
|---|---|
| [edit-video](skills/media/edit-video/SKILL.md) | Turns user-provided clips into a reviewed cut plan, preview, captions, and final render. |

## Contract

Every skill must provide:

- a valid `SKILL.md`
- complete usage and approval gates
- synthetic examples only; no personal or customer data
- validation, plus runtime tests where the skill has runtime behavior

## CI

GitHub Actions runs `Validate skills` from `.github/workflows/validate.yml`.

## Privacy

Public-safe skill source only. No browser state, credentials, local home paths,
private messages, inventory, or runtime output.

Private school and shop setup stays in gitignored local config on the student's
or seller's machine.
