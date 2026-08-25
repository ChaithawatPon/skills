# ChaithawatPon skills

Public agent skills for practical work. One repository. Each skill stays a
complete installable package.

This is the career-facing catalog. Independent versioned repositories still
exist for each skill's release history.

## Install

```bash
npx skills add ChaithawatPon/skills
```

Or copy one package:

```bash
git clone https://github.com/ChaithawatPon/skills.git
cp -R skills/<name> ~/.claude/skills/<name>
```

## Skills

| Skill | Outcome |
|---|---|
| [edit-video](skills/edit-video/SKILL.md) | Turns user-provided clips into a reviewed cut plan, preview, captions, and final render. |
| [sell-to-facebook-marketplace](skills/sell-to-facebook-marketplace/SKILL.md) | Prepares Marketplace listings and seller workflows with explicit approval before public actions. |
| [social-update](skills/social-update/SKILL.md) | Supports professional profiles, portfolio content, job research, and approval-gated outreach. |
| [sumup](skills/sumup/SKILL.md) | Converts a completed work session into a durable summary and continuation handoff. |
| [today-obsidian](skills/today-obsidian/SKILL.md) | Builds an idempotent daily cockpit from unfinished tasks and verified work evidence. |

Each package has its own README for requirements, environment variables,
usage, approval gates, and troubleshooting.

## Contract

Every skill must provide:

- a valid `SKILL.md`
- complete installation and usage instructions
- synthetic examples only; no personal or customer data
- validation, plus runtime tests where the skill has runtime behavior
- explicit privacy and approval boundaries

## Privacy

This repository contains public-safe skill source only. It does not contain
browser state, credentials, local paths, private messages, inventory, or
runtime output.

## Versioned sources

Current package trees were imported from:

| Skill | Standalone repo | Imported `main` | Release |
|---|---|---|---|
| edit-video | [ChaithawatPon/edit-video](https://github.com/ChaithawatPon/edit-video) | `77218de` | v1.0.2 |
| sell-to-facebook-marketplace | [ChaithawatPon/sell-to-facebook-marketplace](https://github.com/ChaithawatPon/sell-to-facebook-marketplace) | `b317582` | v1.1.2 |
| social-update | [ChaithawatPon/social-update](https://github.com/ChaithawatPon/social-update) | `19686b2` | v1.0.1 |
| sumup | [ChaithawatPon/sumup](https://github.com/ChaithawatPon/sumup) | `cfbc422` | v1.0.1 |
| today-obsidian | [ChaithawatPon/today-obsidian](https://github.com/ChaithawatPon/today-obsidian) | `c45b07d` | v1.0.1 |

See [SOURCE.md](SOURCE.md).
