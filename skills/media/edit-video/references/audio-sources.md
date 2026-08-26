# Approved-source registry — music and sound effects

Status: **public registry template; no standing source or file approval is
included.** Terms were checked against the linked primary license texts, but
must be re-checked before use.

Sources that may be proposed for user review:

- **Pixabay Audio** — candidate source for music.
- **Freesound filtered to `CC0` only.** `CC-BY` and `CC-BY-NC` require separate
  review; `CC-BY-NC` in particular cannot be used for anything
  promoting the storefront, an employer, or a paid service.
- **Incompetech** requires a separate approval because attribution is mandatory.
- Neither approved source needs on-screen attribution, so no credit line or
  end-slate is required for audio drawn from them.

Still gated, unchanged: approval of a *source* is not approval of a *file*.
Every download still needs its own provenance row below, and every Freesound
file needs its licence re-checked at download time. **Nothing has been
downloaded yet.**

`SKILL.md` gates this deliberately: *"Do not install tools, download media, or
use copyrighted music without the user's approval."* This file exists so that
approval is a one-line decision against known terms, instead of a research task
every time a reel needs a bed track.

**Workflow:** pick a source → get the user's approval for that source → download →
record the per-file provenance row (below) in the project's `cut-list.md`.
Approval of a *source* is not approval of a *file*; the per-file license on
Freesound and similar sites varies.

## Sources

### 1. Pixabay Audio — best default

- Terms: <https://pixabay.com/service/license-summary/>
- Attribution: **not required** (appreciated, not obligatory).
- Commercial use: allowed.
- Traps:
  - Cannot sell or distribute a track **standalone** — it must be part of a
    creative work. A reel qualifies; a "music pack" would not.
  - Cannot be used as part of a trademark, trade name, or service mark.
  - Content featuring recognisable people or trademarks carries extra rights
    that the licence does **not** clear.
- Why default: no attribution burden, so a reel needs no on-screen credit.

### 2. Freesound — best for one-off SFX

- Terms: <https://freesound.org/help/faq/>
- Attribution: **depends on the file.** Three licences are in play:
  - `CC0` — no attribution, commercial OK.
  - `CC-BY` — attribution required, commercial OK.
  - `CC-BY-NC` — **non-commercial only.** Unusable for anything promoting
    an employer, a storefront, or a paid service.
- Trap: the licence is **per sound**, never per site. Every single file must
  have its licence checked and recorded individually. Filter to `CC0` to make
  this a non-issue.
- Why use it: precise, real-world one-shot effects (sizzle, crowd, traffic)
  that music libraries do not carry.

### 3. Incompetech / Kevin MacLeod — when a scored feel is needed

- Terms: <https://incompetech.com/music/royalty-free/faq.html>
- Licence: Creative Commons Attribution 4.0.
- Commercial use: allowed, including monetised video.
- Attribution: **mandatory and exact.** The required form is:

  ```
  <Title> Kevin MacLeod (incompetech.com)
  Licensed under Creative Commons: By Attribution 4.0
  https://creativecommons.org/licenses/by/4.0/
  ```

  It must be placed where someone looking for the source can find it.
- A paid Standard Licence exists for cases where crediting is impossible
  (broadcast spots). Not needed for organic social.
- Trap: attribution text competes for space in a vertical reel. Prefer
  Pixabay unless a specific track is wanted.

## Default recommendation — not standing approval

Propose **Pixabay Audio for music** and **Freesound filtered to CC0 for SFX**.
They reduce attribution and non-commercial-license risk, but the user still
approves each source and each file after current terms are checked.

Incompetech (§3) stays documented but **unapproved**; using it would reintroduce
a mandatory on-screen credit. Ask before reaching for it.

## Per-file provenance row

Record this for every downloaded asset, in the project's `cut-list.md`:

| Field | Example |
| ----- | ------- |
| File | `assets/audio/bed-01.mp3` |
| Source + URL | Pixabay — `https://pixabay.com/music/...` |
| Licence | Pixabay Content License |
| Attribution required | no |
| Attribution text | — |
| Downloaded | `2026-08-12` |
| Approval evidence | `<reviewer or approval record>, <date>` |
| SHA-256 | `<hash>` |
| Used at | `00:04.20–00:11.00` |

## What this does not cover

Audio extracted from real footage is a **separate problem and is not cleared by
this registry.** Identifiable speech requires privacy and consent review in
addition to licensing. Keep it review-only until the user decides.

Licence terms were read from the primary sources above on 12-08-2026. Re-check
before relying on them — these sites have changed terms before.
