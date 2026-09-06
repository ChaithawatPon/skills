# Reddit Content and Community Workflow

Use this module for Reddit posts, technical project showcases, open-source releases, and architectural discussions.

## Canonical Targets

- Web portal: `https://www.reddit.com` (desktop driver via `agent-browser`)
- Mobile app: Package `com.reddit.frontpage` (preferred mobile driver via `/android-harness`)

Confirm visible signed-in identity and account username before drafting or submitting.

## Subreddit Qualification & Rule Verification

Reddit communities enforce strict anti-spam and content guidelines. Before preparing any post:

1. **Rule Preflight**: Fetch and inspect `https://www.reddit.com/r/<subreddit>/about/rules`.
2. **Flair Check**: Identify mandatory flair tags (e.g., `Showcase`, `Discussion`, `Side Project`, `Tools`).
3. **Self-Promotion Ratio**: Respect community self-promotion limits (standard 9:1 community-contribution ratio). Never post direct sales pitches or generic promotional links.
4. **Karma / Account Age Requirements**: Verify the account meets minimum post thresholds.

## Format Specifications

- **Title**: Descriptive, factual, non-clickbait. Include stack or key metric if relevant (e.g. "[Showcase] Built a local-first PDF cleaner in Python — lessons from handling edge cases").
- **Body**: Clean GitHub-flavored Markdown:
  - **The Context / Problem**: What real pain point does this address?
  - **Technical Stack & Architecture**: Core libraries, algorithms, trade-offs.
  - **What Failed / Edge Cases**: Transparent accounting of bugs, performance bottlenecks, or failed experiments.
  - **Call to Discussion**: Open-ended question asking for technical feedback or code review.
- **Voice and Tone**:
  - Authentic, humble, transparent, deeply technical.
  - **Zero corporate marketing speak, zero hype adjectives**.
  - See [platform-tones.md](platform-tones.md) for detailed tone guidelines.

## Driver Selection & Anti-Detection Policy

1. **Desktop Web (`agent-browser`)**: Reddit markdown composer and flair selection are most reliably verified via `agent-browser` on desktop web.
2. **Mobile App (`/android-harness`)**: Use `com.reddit.frontpage` via `/android-harness` when USB Android phone is connected and mobile posting is requested.

## Reddit Review Packet Contract (`RDP-<YYYYMMDD>-<sequence>`)

Show:
- Target subreddit (`r/<name>`) and verified account identity.
- Verified rule compliance notes and selected flair.
- Descriptive title and complete Markdown post body.
- Attached media/links (if permitted by subreddit).
- Preflight validator result.
- Same-day expiry.

Approval syntax:
```text
Approve Reddit packet RDP-<YYYYMMDD>-<sequence>
```

Interactive review mode is strictly mandatory. Never submit Reddit posts autonomously.

## Post-Publish Verification

1. Reload direct post URL (`https://www.reddit.com/r/<subreddit>/comments/<id>/...`).
2. Verify post is not removed by AutoModerator (status: visible, not `[removed]`).
3. Confirm flair, formatting, and link rendering.
4. Record `succeeded`, `failed`, or `pending`.
