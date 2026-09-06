# YouTube and TikTok publishing

Use this module for YouTube Community posts, video/Shorts announcements, and TikTok photo or video posts.

## Canonical targets

- YouTube channel: Channel home, YouTube Studio desktop, or mobile app (`com.google.android.youtube`).
- TikTok Studio: Creator center upload or mobile app (`com.zhiliaoapp.musically`).

Confirm visible signed-in identity before filling a composer. Treat switched or unverified accounts as unsafe.

## Driver selection & anti-detection

- **Mobile priority (`/android-harness`)**: Prioritize `/android-harness` using native apps (`com.zhiliaoapp.musically` and `com.google.android.youtube`) when an Android device is connected via USB. This bypasses web bot detection, upload blocks, and CAPTCHA sliders, while native UI hierarchy (`ui_nodes()`) minimizes token consumption.
- **Desktop web fallback (`agent-browser`)**: Fall back to TikTok Studio web and YouTube Studio via `agent-browser` / Playwright when no mobile device is attached.

## Format choice

- **YouTube**:
  - Community image posts: 1:1 or 16:9 static image when the channel exposes Community posting.
  - Video and Shorts announcements: 9:16 vertical video for Shorts (<60s) or 16:9 for long-form video.
  - A Short or standard video is a distinct asset from a Community post and requires separate preview and approval.
- **TikTok**:
  - Photo-post mode: Swipeable photo carousel with matching campaign audio/sound in TikTok Studio or mobile app.
  - Video mode: 9:16 vertical video.
  - Do not silently convert an image into a video.
- Keep platform-specific media rules in the campaign packet. A caption approved for one platform does not approve another platform or format.

## Publish workflow

1. Verify the visible signed-in channel or account and exact composer surface.
2. Prepare a same-day packet (`YTP-<YYYYMMDD>-<sequence>` for YouTube, `TKP-<YYYYMMDD>-<sequence>` for TikTok) with the complete caption, asset, format, driver, audience, warnings, expiry, and direct verification plan.
3. Interactive review mode is strictly mandatory; never publish autonomously.
4. Publish only after exact platform-specific approval. Stop for login, MFA, CAPTCHA, account switching, music/licensing prompts, branded-content declarations, or a changed preview.
5. Reload the public channel or profile and open the direct post URL. Match the caption, media, account, and public visibility before reporting success.

## Campaign scheduling

- A complete campaign may use one batch packet per platform when every post,
  asset, date, time, timezone, audience, and target account appears in the
  packet. Approval for the YouTube batch never covers TikTok, and vice versa.
- YouTube: schedule the approved Community image post or video when the composer exposes
  a native schedule control. Verify it under the channel's Scheduled tab.
- TikTok: schedule the approved photo post or video in TikTok Studio. Confirm the shown
  timezone, date, time, audience, caption, and image before submitting, then
  verify it in Studio's scheduled-content list.
- A scheduled item remains `scheduled`, not `published`, until its direct public
  URL is verified after the scheduled time.
- If the requested control or approved format is unavailable, create a dated
  manual-post handoff task; do not substitute a video or publish early.
