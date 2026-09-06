# Public content workflow

Use this module for professional posts, launch updates, portfolio stories,
threads, public replies, or optional visual/video assets across all supported platforms.
For platform-specific voice, tone, and formatting conventions, read [platform-tones.md](platform-tones.md).

## Supported platforms and formats

This module orchestrates public content across 10 canonical platforms with distinct tone profiles:

1. **Facebook**:
   - Surfaces: Page, Profile, and approved Groups.
   - Formats: Text-only narrative, single image, image album, or video.
   - Tone: Approachable educational storytelling; community-first peer sharing.
2. **TikTok**:
   - Surfaces: Mobile app and TikTok Studio.
   - Formats: Photo-post mode (swipeable photo cards with audio) and Video mode (9:16 vertical video).
   - Tone: Energetic, hook-first, fast-paced solution walkthrough. See [youtube-tiktok.md](youtube-tiktok.md).
3. **X**:
   - Surfaces: Single posts, numbered threads (1/N), and media attachments (up to 4 images or video).
   - Tone: Fast, punchy, bold thesis, insight-dense builder perspective.
4. **LinkedIn**:
   - Surfaces: Feed posts, long-form articles, and document slides (PDF carousel / slide deck presentations).
   - Tone: Professional thought leadership, architectural insights, high-substance takeaways.
5. **Lemon8**:
   - Surfaces: Mobile app and creator portal.
   - Formats: 3:4 vertical carousels, slide 1 cover hook with title sticker, structured tips, and 5–10 niche hashtags.
   - Tone: Warm, helpful, friendly curated guide. See [lemon8.md](lemon8.md).
6. **Instagram**:
   - Surfaces: Feed photos (1:1 or 4:5 vertical), Carousels (up to 10 slides), and Reels (9:16 vertical video).
   - Tone: Visual-first, aesthetic spacing, relatable companion narrative.
7. **YouTube**:
   - Surfaces: Community image posts (1:1 or 16:9) and video / Shorts announcements (9:16 vertical for Shorts).
   - Tone: Clear educational context, community polls, and discussion questions. See [youtube-tiktok.md](youtube-tiktok.md).
8. **Threads**:
   - Surfaces: Mobile app and Threads web.
   - Formats: Conversational text posts up to 500 characters, single or carousel images, connected reply threads.
   - Tone: Casual, witty, authentic, relatable thought bites. See [threads.md](threads.md).
9. **RedNote (Xiaohongshu)**:
   - Surfaces: Mobile app and creator portal.
   - Formats: 3:4 vertical aesthetic cards (1080x1440), cover hook banner, emoji bullet points, keyword tags.
   - Tone: Aesthetic, detail-oriented, generous practical curation. See [rednote.md](rednote.md).
10. **Reddit**:
    - Surfaces: Subreddit posts on desktop web or mobile app.
    - Formats: Markdown technical showcases, project breakdowns, architecture discussions.
    - Tone: Authentic, humble, highly technical, transparent, zero marketing hype. See [reddit.md](reddit.md).

## Driver selection & anti-detection policy

- **Mobile social priority (`/android-harness`)**: Whenever an Android phone is connected via USB, prioritize `/android-harness` as the primary driver for mobile social apps:
  - Facebook: `open_app("com.facebook.katana")`
  - Instagram: `open_app("com.instagram.android")`
  - Threads: `open_app("com.instagram.barcelona")`
  - TikTok: `open_app("com.zhiliaoapp.musically")`
  - Lemon8: `open_app("com.ss.android.lemon8")`
  - RedNote: `open_app("com.xingin.xhs")`
  - X: `open_app("com.twitter.android")`
  - LinkedIn: `open_app("com.linkedin.android")`
  - Reddit: `open_app("com.reddit.frontpage")`
  - YouTube: `open_app("com.google.android.youtube")`
  This prevents web-based bot detection, CAPTCHA challenges, and "unusual activity" account flags, while using native UI hierarchy (`ui_nodes()`) to minimize context token usage.
- **Desktop web fallback (`agent-browser` / Playwright)**: Use `agent-browser` or Playwright for desktop web portals (YouTube Studio, Reddit Markdown composer, TikTok Studio, web composers) when no mobile device is attached.
- **Interactive review-mode**: Live publishing or external posting strictly requires explicit interactive user approval of the complete packet. Never publish autonomously.

## Canonical packet prefixes

Every platform uses a designated same-day review packet ID prefix:

- **Facebook**: `FBP-<YYYYMMDD>-<sequence>` (Page/Profile) or `FBG-<YYYYMMDD>-<sequence>` (Groups)
- **TikTok**: `TKP-<YYYYMMDD>-<sequence>` (Photo or Video posts)
- **X**: `XCP-<YYYYMMDD>-<sequence>` (Posts, Threads, Media)
- **LinkedIn**: `LIP-<YYYYMMDD>-<sequence>` (Feed, Articles, Document slides)
- **Lemon8**: `LMN-<YYYYMMDD>-<sequence>` (3:4 Carousels, Cover hooks)
- **Instagram**: `IGP-<YYYYMMDD>-<sequence>` (Photos, Carousels, Reels)
- **YouTube**: `YTP-<YYYYMMDD>-<sequence>` (Community images, Video, Shorts)
- **Threads**: `THP-<YYYYMMDD>-<sequence>` (Conversational posts, reply threads)
- **RedNote**: `RNP-<YYYYMMDD>-<sequence>` (3:4 Aesthetic notes, tool guides)
- **Reddit**: `RDP-<YYYYMMDD>-<sequence>` (Technical showcases, community discussions)
- **Cross-Platform Campaign Batch**: `CMP-<YYYYMMDD>-<sequence>`

## Workflow sequence

1. Choose the target platforms, accounts, audience, and verified evidence set.
2. Select driver: prioritize `/android-harness` when mobile device is connected; fall back to `agent-browser` on desktop web.
3. Draft complete copy adapted to the platform's voice and tone (per [platform-tones.md](platform-tones.md)) from verified public facts.
4. Exclude source code, prompts, scripts, APIs/providers, selectors, architecture, private repositories, credentials, private analytics, customer/employer data, personal location, routines, schedules, and private deliberations unless the user explicitly approves a specific public fact.
5. Use only rights-controlled media. Privacy-review every frame, caption, audio sample, filename, metadata field, and link preview. Route actual video cutting/export to an installed `edit-video` skill; editing never grants publishing authority.
6. Show the full target, driver, text, assets, link, visibility, warnings, and post-publish verification plan in a review packet. Publishing or scheduling requires exact approval for that platform and materially unchanged post.
7. When the user requests a campaign schedule or multi-platform batch, present a unified preview packet (`CMP-<YYYYMMDD>-<sequence>`) covering all requested platforms.
8. When a requested platform cannot schedule the approved format, create a dated manual-post handoff task instead of changing the format or posting early.
9. Reload the direct public URL and compare content, assets, account, and visibility. A click or toast is not proof.

Never mine DMs, emails, or private conversations to imitate the user's voice. Use a neutral professional voice unless the user gives explicit public-safe style guidance for this artifact.
