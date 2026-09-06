# Lemon8 Content and Creator Workflow

Use this module for Lemon8 posts, carousel staging, cover hooks, and tag optimization.

Lemon8 is a visual-first community platform for lifestyle, tech tips, study guides, tool setups, and creator workflows.

## Canonical Targets

- Mobile app: Package `com.ss.android.lemon8` (preferred driver via `/android-harness`)
- Web creator portal: `https://www.lemon8-app.com` (desktop fallback via `agent-browser`)

Confirm visible signed-in identity before filling a composer or uploading assets. Treat switched or unverified accounts as unsafe.

## Format Specifications

- **Aspect Ratio**: 3:4 vertical images (optimal resolution: `1080x1440` px).
- **Slide Count**: 2 to 10 image slides per carousel.
- **Slide 1 (Cover Hook)**:
  - Strong, high-contrast visual title sticker or text hook on the image.
  - Clear headline answering "what will the reader gain?" (e.g. "Curated...", "Top tips...", "Step-by-step...").
- **Slides 2–N (Content Body)**:
  - Step-by-step screenshots or structured graphic cards.
  - High-readability callout boxes, annotations, or numbered steps.
- **Caption Structure**:
  - Catchy title line (under 50 characters).
  - Body: Scannable bullet points, emoji anchors, clean line breaks.
  - Call to action (CTA): Save for later, follow, or ask an open question.
  - Tag formatting: 5–10 relevant niche hashtags (`#...`), e.g. `#Productivity #TechTips #Workflow #Coding #Career`.

## Driver Selection & Execution Policy

1. **Primary Driver**: `/android-harness` using the Lemon8 Android app (`com.ss.android.lemon8`) when an Android device is attached via USB.
   - Prevents web-based bot detection, CAPTCHA challenges, and IP/session flags.
   - Uses native Android gallery/photo picker for seamless multi-image carousel selection.
   - Fast UI hierarchy inspection (`ui_nodes()`) drastically reduces LLM token consumption compared to web DOM snapshots.
2. **Desktop Fallback**: `agent-browser` on the Lemon8 web creator portal (`lemon8-app.com`) when no Android device is connected.

## Lemon8 Packet Contract (`LMN-<YYYYMMDD>-<sequence>`)

Show:
- Canonical target account/handle and verified signed-in state.
- Driver selected (`/android-harness` or `agent-browser`).
- Carousel images: local paths, verified 3:4 aspect ratio, slide ordering (Slide 1 cover hook through Slide N).
- Complete post title and caption text with bullet points and CTA.
- 5–10 verified niche hashtags.
- Preflight validator result.
- Same-day expiry.

Approval syntax:
```text
Approve Lemon8 packet LMN-<YYYYMMDD>-<sequence>
```

Interactive review mode is strictly required. Never publish, schedule, or submit Lemon8 content without explicit interactive user approval.

## Post-Publish Verification

1. Reload the direct creator profile or post permalink.
2. Verify all carousel slides render in the approved sequence.
3. Match title, caption text, hashtags, and account identity against the approved packet.
4. Record `succeeded`, `failed`, or `pending`.
