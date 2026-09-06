---
name: social-update
description: Manage an evidence-backed professional presence across LinkedIn, GitHub, X, Facebook, Instagram, YouTube, TikTok, Lemon8, Threads, RedNote, Reddit, freelance marketplaces, job search, recruiter email, public content, portfolio evidence, applications, and follow-ups. Use when the user invokes /social-update; requests a profile audit or edit, portfolio presentation, social post, carousel, job discovery or application, resume tailoring, recruiter outreach, opportunity reply, or private application ledger; or uses the former professional-presence, career-pilot, or job-hunter names.
---

# Social Update

Use one truthful workflow for careers, professional profiles, public portfolio
content, applications, and follow-up across 10 canonical platforms (Facebook, TikTok,
X, LinkedIn, Lemon8, Instagram, YouTube, Threads, RedNote, Reddit). The former names
`professional-presence`, `career-pilot`, and `job-hunter` are compatibility
wording only, not separate skills.

## Load only what the run needs

- Read [references/candidate-profile.md](references/candidate-profile.md) when
  locating or creating the user's private candidate profile.
- Read [references/approval-policy.md](references/approval-policy.md) before
  submitting an application, sending outreach, or replying to a recruiter.
- Read [references/platform-playbook.md](references/platform-playbook.md) before
  operating a job site, ATS, GitHub, or email surface.
- Read [references/platform-tones.md](references/platform-tones.md) for
  platform-specific voice, tone, and audience adaptations.
- Read [references/outreach.md](references/outreach.md) for cold email and
  follow-up work.
- Read [references/profile-presence.md](references/profile-presence.md) for a
  public profile, portfolio, or freelance listing.
- Read [references/social-content.md](references/social-content.md) for a post,
  launch update, or public media asset.
- Read [references/lemon8.md](references/lemon8.md) for Lemon8 3:4 carousels,
  cover hooks, and tags.
- Read [references/threads.md](references/threads.md) for Threads conversational
  posts and reply chains.
- Read [references/rednote.md](references/rednote.md) for RedNote (Xiaohongshu)
  3:4 visual notes and guides.
- Read [references/reddit.md](references/reddit.md) for Reddit technical
  showcases and subreddit-compliant discussions.
- Read [references/youtube-tiktok.md](references/youtube-tiktok.md) for YouTube
  Community/Shorts/video posts or TikTok photo/video posts.

## Route the request

- **Profiles and portfolio**: audit read-only, ground every claim in public or
  user-approved evidence, then show exact field replacements before an edit.
- **Public content**: draft and privacy-review the complete post and assets across
  all 10 platforms; publishing and native scheduling each remain separate platform
  approvals. Adapt writing voice per platform via [references/platform-tones.md](references/platform-tones.md).
  Interactive review-mode is strictly mandatory before any live publish.
- **Driver selection & anti-detection**: prioritize `/android-harness` when an
  Android phone is connected via USB for mobile social apps (Facebook, Instagram,
  Threads, TikTok, Lemon8, RedNote, X, LinkedIn, Reddit, YouTube) to avoid bot flags
  and save context tokens; fall back to `agent-browser` / Playwright for desktop web.
- **YouTube and TikTok**: keep each platform in a separate same-day packet;
  verify the signed-in account, final format, visibility, scheduled-content
  state when used, and direct public URL after publication.
- **Lemon8 & RedNote**: format 3:4 vertical carousels with slide 1 cover hooks, scannable tips,
  and niche hashtags; prioritize `/android-harness`.
- **Threads & Reddit**: craft conversational community-grounded or technically deep
  posts respecting community rules and authentic builder tone.
- **Jobs and opportunities**: follow the research, review, application, ledger,
  outreach, and verification workflow below.
- **Cross-platform audit**: separate findings and approval packets by platform;
  approval never transfers between accounts or action types.

## Non-negotiable boundaries

- Never invent experience, results, credentials, clients, project ownership,
  testimonials, eligibility, rates, or employment facts.
- Exclude credentials, home address, precise location, age, date of birth,
  family identities, routines, schedules, private conversations, private-repo
  details, employer/customer data, and unreleased work from public output.
- Gmail remains draft-only unless a separately installed email workflow states
  an even stricter rule. Never report a profile, post, message, application, or
  listing as live/sent until its direct status is verified after reload.

## 1. Establish the job/opportunity run contract

Locate the candidate profile from `JOB_HUNTER_PROFILE` or a user-provided path.
If neither exists, create a private profile from the template in
`references/candidate-profile.md`; never place it in this repository.
Resolve this skill's absolute directory as `SKILL_DIR` before running bundled
scripts when the host does not provide it.

Confirm or infer the requested operation:

- `research`: discover, deduplicate, score, and report.
- `review`: prepare or fill applications and messages, then pause at the
  approval boundary.

Review mode is mandatory for any external action. A prior approval
for one application is not standing approval for unrelated applications.

Validate the profile:

```bash
python3 "$SKILL_DIR/scripts/validate_profile.py" "$JOB_HUNTER_PROFILE"
```

## 2. Build the evidence set

Read the canonical resume, verified-experience bank, portfolio links, and GitHub
projects. Separate:

- verified facts that may be asserted;
- reasonable positioning or emphasis;
- missing evidence that must not be claimed.

Update the canonical resume only when the user asks or when verified newer
evidence is available. Preserve a source resume and create a new tailored
version rather than overwriting it. Record which resume was used for every
application.

## 3. Discover and qualify jobs

Search multiple sources instead of relying on one feed. Prefer original company
postings over aggregators. Capture the full description, source URL, company,
location, work arrangement, schedule, employment type, compensation, required
experience, work authorization, and application deadline.

Reject or flag hard blockers before tailoring:

- unavailable geography or work authorization;
- incompatible working hours or employment type;
- compensation below the stored floor;
- mandatory qualifications contradicted by verified facts;
- closed, suspicious, duplicated, or misleading listings.

Score remaining jobs from 0–100 using role fit, evidence strength, eligibility,
schedule, compensation, and application effort. Explain the score; do not hide
a stretch requirement inside one number.

Add discoveries to the private ledger:

```bash
python3 "$SKILL_DIR/scripts/job_ledger.py" add "$JOB_HUNTER_LEDGER" \
  --company "<company>" --role "<role>" --url "<url>" \
  --source "<source>" --score <0-100> --status shortlisted
```

## 4. Tailor the application

Select the strongest verified evidence for the job. Tailor the summary, bullet
ordering, skills, cover letter, and short answers without changing factual
meaning. Never invent years of experience, degrees, employers, production use,
salary history, work authorization, or demographic information.

Answer screening questions directly. Stop when the truthful answer may
disqualify the candidate instead of changing the answer.

## 5. Apply and verify

Use the platform playbook. Keep one browser driver in control at a time. Fill
and upload first, inspect the final review state, apply the approval policy,
then submit if authorized.

Treat a click as an attempt, not proof. Verify a confirmation message,
application-status change, confirmation email, or company-portal record.
Capture evidence without exposing private fields in shareable artifacts.

Update the ledger only after verified submission:

```bash
python3 "$SKILL_DIR/scripts/job_ledger.py" update "$JOB_HUNTER_LEDGER" <id> \
  --status applied --applied-at "<ISO-8601>" \
  --resume "<private resume path>" --follow-up-at "<YYYY-MM-DD>"
```

## 6. Outreach, follow-up, and replies

Use a connected email tool first and browser automation only as a fallback.
Research the recipient and personalize the message with one relevant reason.
Do not scrape or blast large contact lists.

Scheduled unattended runs may discover jobs, update the ledger, and prepare
drafts. Sending requires the stored approval mode. Re-check the thread before
sending a scheduled follow-up so a reply, rejection, or interview invitation
does not receive a stale message.

List due follow-ups:

```bash
python3 "$SKILL_DIR/scripts/job_ledger.py" due "$JOB_HUNTER_LEDGER"
```

Classify inbound replies as acknowledgement, question, screening, interview,
rejection, or offer. Draft a response grounded in the original application and
pause for decisions involving compensation, availability commitments, legal
terms, or acceptance.

## 7. Report the outcome

Return a compact run summary:

- jobs found, rejected, shortlisted, and applied;
- each submitted role, compensation, resume version, and confirmation evidence;
- drafts or follow-ups awaiting approval;
- blockers, stretch requirements, and next due action.

Never report an application or email as sent without verification.
