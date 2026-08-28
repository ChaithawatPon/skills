# YouTube and TikTok publishing

Use this module for YouTube Community posts and TikTok photo or video posts.

## Format choice

- Use a YouTube Community image post for a static campaign asset when the channel exposes Community posting. If it does not, report `pending`; a Short or standard video needs a new asset preview and approval.
- Use TikTok Studio photo-post mode for a static campaign image. Do not silently convert an image into a video.
- Keep platform-specific media rules in the campaign packet. A caption approved for one platform does not approve another platform or format.

## Publish workflow

1. Verify the visible signed-in channel or account and exact composer surface.
2. Prepare a same-day packet with the complete caption, asset, format, audience, warnings, expiry, and direct verification plan.
3. Publish only after exact platform-specific approval. Stop for login, MFA, CAPTCHA, account switching, music/licensing prompts, branded-content declarations, or a changed preview.
4. Reload the public channel or profile and open the direct post URL. Match the caption, media, account, and public visibility before reporting success.

## Campaign scheduling

- YouTube: schedule the approved Community image post when the composer exposes
  a native schedule control. Verify it under the channel's Scheduled tab.
- TikTok: schedule the approved photo post in TikTok Studio. Confirm the shown
  timezone, date, time, audience, caption, and image before submitting, then
  verify it in Studio's scheduled-content list.
- A scheduled item remains `scheduled`, not `published`, until its direct public
  URL is verified after the scheduled time.
- If the requested control or approved format is unavailable, create a dated
  manual-post handoff task; do not substitute a video or publish early.
