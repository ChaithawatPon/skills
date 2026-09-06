# Threads Content and Workflow

Use this module for Meta Threads posts, reply threads, and casual conversational builder updates.

## Canonical Targets

- Mobile app: Package `com.instagram.barcelona` (preferred driver via `/android-harness`)
- Web portal: `https://www.threads.net` (desktop fallback via `agent-browser`)

Confirm visible signed-in identity before filling a composer. Treat switched accounts as unverified.

## Format Specifications

- **Character Limit**: Up to 500 characters per post.
- **Media**: Single image, carousel (up to 10 images), or video clips up to 5 minutes.
- **Post Types**:
  - Single thought bite / tech observation.
  - Connected thread (chain of replies under own initial post).
  - Open question / poll prompt for community debate.
- **Voice and Tone**:
  - Conversational, witty, authentic, relatable.
  - See [platform-tones.md](platform-tones.md) for detailed tone guidelines.
  - Avoid stiff marketing announcements; write as a builder sharing real-time insights or curiosity.

## Driver Selection & Anti-Detection Policy

1. **Primary Driver**: `/android-harness` (`com.instagram.barcelona`) when an Android phone is connected via USB.
   - Bypasses Meta web bot detection, CAPTCHAs, and session challenges.
   - Native UI hierarchy inspection (`ui_nodes()`) drastically reduces token usage.
2. **Desktop Fallback**: `agent-browser` on `https://www.threads.net` when no mobile device is attached.

## Threads Review Packet Contract (`THP-<YYYYMMDD>-<sequence>`)

Show:
- Canonical target account/handle and verified signed-in state.
- Driver selected (`/android-harness` or `agent-browser`).
- Complete text for primary post and any connected reply posts.
- Attached media paths (if any) and aspect ratio.
- Preflight validator result.
- Same-day expiry.

Approval syntax:
```text
Approve Threads packet THP-<YYYYMMDD>-<sequence>
```

Interactive review mode is strictly mandatory. Never publish or schedule Threads content autonomously.

## Post-Publish Verification

1. Reload direct Threads post permalink.
2. Verify primary text and thread chain order.
3. Confirm attached media rendering and public account identity.
4. Record `succeeded`, `failed`, or `pending`.
