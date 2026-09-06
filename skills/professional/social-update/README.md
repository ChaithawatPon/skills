# social-update

Evidence-backed workflow for professional profiles, public portfolio content,
job search, applications, recruiter outreach, and opportunity follow-up.

It consolidates the former `professional-presence`, `career-pilot`, and
`job-hunter` names into one skill. The package keeps personal candidate data
and application history outside the repository.

## Install

```bash
git clone https://github.com/ChaithawatPon/social-update.git \
  "$HOME/.claude/skills/social-update"
```

## Requirements

- Python 3.9+
- A browser or platform workflow supplied by the host agent when live profile,
  job, or social actions are requested
- Private profile and ledger paths for job-application features

## Modes

- Profile/portfolio audit: read public state and propose exact field changes.
- Public content: draft and privacy-review a complete platform packet across 10 platforms (Facebook, TikTok, X, LinkedIn, Lemon8, Instagram, YouTube, Threads, RedNote, Reddit).
- Job research: discover, deduplicate, score, and report.
- Application review: tailor from verified evidence and pause before submit.

## Driver Selection & Anti-Detection

- **Mobile social priority (`/android-harness`)**: Prioritizes `/android-harness` when an Android device is attached via USB for mobile social apps (Facebook, Instagram, Threads, TikTok, Lemon8, RedNote, X, LinkedIn, Reddit, YouTube) to avoid bot detection and minimize token consumption.
- **Desktop web fallback (`agent-browser` / Playwright)**: Uses `agent-browser` or Playwright for desktop web workflows when no mobile device is connected.
- **Strict review-mode approval**: Live publishing or external mutation strictly requires explicit interactive user approval.


## Private job data

Set paths to user-owned files outside this repository:

```bash
export JOB_HUNTER_PROFILE="$HOME/.private/social-update/profile.json"
export JOB_HUNTER_LEDGER="$HOME/.private/social-update/ledger.json"
```

Validate and initialize them with the bundled scripts:

```bash
python3 scripts/validate_profile.py "$JOB_HUNTER_PROFILE"
python3 scripts/job_ledger.py init "$JOB_HUNTER_LEDGER"
python3 scripts/test_job_hunter.py
```

Every public edit, post, message, application, follow, or deletion keeps its own
approval and direct verification boundary.

Never commit populated profiles, resumes with contact details, browser state,
application ledgers, private messages, screenshots with personal data, or
credentials. Examples in this repository are synthetic placeholders.

## Validate

From the repository root:

```bash
python3 scripts/validate-skill.py
python3 scripts/test_job_hunter.py
```

## Troubleshooting

- Missing profile or ledger: set `JOB_HUNTER_PROFILE` and
  `JOB_HUNTER_LEDGER` to private files outside the repository.
- Profile validation fails: compare the private file with
  `references/candidate-profile.md`; do not copy the populated file here.
- A platform is logged out or changed: stop before any write, restore the
  session manually, and re-check the final preview and approval gate.

## License

[MIT](LICENSE). User resumes, portfolio media, messages, and platform content
retain their original ownership and are not included in this license.
