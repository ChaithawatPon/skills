# ChaithawatPon Skills

Public agent skills for practical work. One catalog, grouped by workflow.
Each skill is a complete installable package under
`skills/<category>/<name>/`.

This is the public install source for Pon's reusable skills.

## Repo map

| Path | Purpose |
|---|---|
| `.agents/` | Agent-facing notes and repo decisions. |
| `.claude-plugin/` | Plugin metadata for catalog distribution. |
| `.github/workflows/` | CI validation for every package. |
| `.out-of-scope/` | Boundaries for what this public catalog will not ship. |
| `docs/` | Human-readable category pages. |
| `scripts/` | Local catalog tools. |
| `skills/` | Installable skill packages. |

## Install

```bash
npx skills add ChaithawatPon/skills
```

Or copy one package:

```bash
git clone https://github.com/ChaithawatPon/skills.git
cp -R skills/<category>/<name> ~/.claude/skills/<name>
```

List packages:

```bash
npm run list
```

Validate the catalog:

```bash
npm test
```

## Categories

Folder names stay plain ASCII so install tools and shells behave. The display
names can have more personality.

| Folder | Display name | What it means |
|---|---|---|
| `selling` | ของต้องขาย | Seller workflows for moving real items through real marketplaces. |
| `university` | งานส่งอาจารย์ | School workflows that start from verified assignment evidence. |
| `daily` | สมองสำรอง | Daily notes, summaries, and handoffs so work does not disappear. |
| `career` | หน้าโปรต้องรอด | Public profile, portfolio, and opportunity workflows with approval gates. |
| `media` | ตัดให้จบ | Video/media workflow support from rough input to reviewed output. |

## ของต้องขาย

| Skill | Outcome |
|---|---|
| [sell-to-facebook-marketplace](skills/selling/sell-to-facebook-marketplace/SKILL.md) | Marketplace listings and seller workflows with explicit approval before public actions. |
| [sell-to-shopee](skills/selling/sell-to-shopee/SKILL.md) | Second-hand Shopee drafts and seller-centre work. Publish needs a fresh yes. |
| [sell-to-thaimart](skills/selling/sell-to-thaimart/SKILL.md) | Second-hand ThaiMart drafts and seller-centre work. Publish needs a fresh yes. |
| [sell-to-tiktok-shop](skills/selling/sell-to-tiktok-shop/SKILL.md) | TikTok Shop drafts, orders, and shoppable basket content. |

See [docs/selling.md](docs/selling.md).

## งานส่งอาจารย์

| Skill | Outcome |
|---|---|
| [n2n-assignment](skills/university/n2n-assignment/SKILL.md) | Routes scan, explain, or create. Front door for assignment work. |
| [check-assignment](skills/university/check-assignment/SKILL.md) | Collects verified lecture files and assignment briefs from visible course sources. |
| [do-assignment](skills/university/do-assignment/SKILL.md) | Builds a review-ready deliverable after an ideas interview and outline approval. |
| [eli5-assignment](skills/university/eli5-assignment/SKILL.md) | Explains one verified brief as a simple visual HTML page. |
| [doer-assignment](skills/university/doer-assignment/SKILL.md) | Compatibility alias for `n2n-assignment`. |

See [docs/university.md](docs/university.md).

## สมองสำรอง

| Skill | Outcome |
|---|---|
| [today-obsidian](skills/daily/today-obsidian/SKILL.md) | Builds an idempotent daily cockpit from unfinished tasks and verified work evidence. |
| [sumup](skills/daily/sumup/SKILL.md) | Converts a completed session into a durable summary and continuation handoff. |

See [docs/daily.md](docs/daily.md).

## หน้าโปรต้องรอด

| Skill | Outcome |
|---|---|
| [social-update](skills/career/social-update/SKILL.md) | Professional profiles, portfolio content, job research, and approval-gated outreach. |

See [docs/career.md](docs/career.md).

## ตัดให้จบ

| Skill | Outcome |
|---|---|
| [edit-video](skills/media/edit-video/SKILL.md) | Turns user-provided clips into a reviewed cut plan, preview, captions, and final render. |

See [docs/media.md](docs/media.md).

## Contract

Every skill must provide:

- a valid `SKILL.md`;
- complete usage and approval gates;
- synthetic examples only; no personal or customer data;
- validation, plus runtime tests where the skill has runtime behavior.

## CI

GitHub Actions runs `Validate skills` from `.github/workflows/validate.yml`.

## Privacy

Public-safe skill source only. No browser state, credentials, local home paths,
private messages, inventory, or runtime output.

Private school and shop setup stays in gitignored local config on the student's
or seller's machine.
