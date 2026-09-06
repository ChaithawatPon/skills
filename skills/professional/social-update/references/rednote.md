# RedNote (Xiaohongshu) Content and Workflow

Use this module for RedNote (Xiaohongshu / 小红书) visual notes, step-by-step tool setups, and curated guides.

## Canonical Targets

- Mobile app: Package `com.xingin.xhs` (preferred driver via `/android-harness`)
- Web creator portal: `https://creator.xiaohongshu.com` (desktop fallback via `agent-browser`)

Confirm visible signed-in identity before filling a composer. Treat switched accounts as unverified.

## Format Specifications

- **Aspect Ratio**: 3:4 vertical images (optimal resolution: `1080x1440` px).
- **Slide Count**: 2 to 9 image cards per note.
- **Slide 1 (Cover Hook)**:
  - Aesthetic, clean graphic with bold text banner or headline.
  - High utility promise (e.g. "5 AI Tools for Coders", "Ultimate Dev Setup").
- **Slides 2–N (Structured Cards)**:
  - Clean screenshots, annotated cards, or visual workflow steps.
  - Generous whitespace and clear visual hierarchy.
- **Note Text Structure**:
  - Title: Catchy, descriptive with emoji anchors (max 20 chars).
  - Body: Scannable sections with emoji bullet points (📌 Context / 🛠 Step / 💡 Pro-tip).
  - Hashtags: 5–10 high-traffic keyword tags (`#...`).
- **Voice and Tone**:
  - Helpful, generous, detail-oriented, highly curated.
  - See [platform-tones.md](platform-tones.md) for detailed tone guidelines.

## Driver Selection & Anti-Detection Policy

1. **Primary Driver**: `/android-harness` (`com.xingin.xhs`) when an Android device is attached via USB.
   - Bypasses strict web verification, SMS challenges, and CAPTCHA sliders.
   - Native gallery multi-select simplifies card ordering.
   - Fast UI hierarchy inspection (`ui_nodes()`) minimizes token overhead.
2. **Desktop Fallback**: `agent-browser` on the Xiaohongshu creator portal when no mobile device is attached.

## RedNote Review Packet Contract (`RNP-<YYYYMMDD>-<sequence>`)

Show:
- Canonical target account/handle and verified signed-in state.
- Driver selected (`/android-harness` or `agent-browser`).
- Carousel images: local paths, verified 3:4 aspect ratio, slide ordering.
- Title and structured body text with bullet emojis.
- 5–10 verified niche hashtags.
- Preflight validator result.
- Same-day expiry.

Approval syntax:
```text
Approve RedNote packet RNP-<YYYYMMDD>-<sequence>
```

Interactive review mode is strictly mandatory. Never publish or schedule RedNote content autonomously.

## Post-Publish Verification

1. Reload direct user profile or note permalink.
2. Verify card order and visual clarity.
3. Confirm title, text formatting, and hashtag discovery.
4. Record `succeeded`, `failed`, or `pending`.
