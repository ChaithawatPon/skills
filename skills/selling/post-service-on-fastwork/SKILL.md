---
name: post-service-on-fastwork
description: Draft and publish Thai service listings on Fastwork's logged-in seller website. Use when turning a confirmed capability into a service page with clear scope, price, delivery time, revisions, and a final approval gate.
---

# Post Service on Fastwork

Turn one confirmed service offer into one truthful Fastwork listing. Treat the
user's confirmed facts as the source of truth. Prepare the listing first, then
use the visible seller website for the final form and publication.

## Starting offer

When the user has not supplied a different offer, use this as a draft starting
point and confirm it before posting:

- Service: review and optimize AI skills or instructions.
- Included intake: one issue-focused meeting lasting up to one hour.
- Deliverable: a revised skill or instruction set, a change summary, and a
  small usage example when useful.
- Feedback: up to three revision rounds for feedback within the agreed scope.
- Customer supplies: the current instructions or files, the problem to solve,
  the desired result, and any constraints.

The starting offer is not proof of experience, a portfolio, a certification,
or a guaranteed result. Confirm the actual price, delivery time, customer type,
language, file format, and exclusions before using it.

## Workflow

1. **Sharpen the offer.** If the offer is incomplete or the user asks to
   pressure-test it, invoke `$mattpocock-skills:grill-me` (or the `grilling`
   skill tool where that environment supports it). Ask one question at a time
   if the skill is unavailable. Resolve the target customer, problem, outcome,
   deliverables, turnaround, price, revision boundary, customer inputs, and
   exclusions. Keep confirmed facts separate from assumptions.
2. **Write the listing.** Draft customer-facing Thai copy for the title,
   short summary, description, package or pricing fields, delivery time,
   revision count, requirements, FAQ, and any portfolio note the live form
   supports. Make the one-hour meeting and three revision rounds explicit only
   when confirmed. State what is outside scope; never promise unlimited edits,
   guaranteed business results, or capabilities the user has not confirmed.
3. **Prepare the seller page.** Open
   `https://seller.fastwork.co/my-services` in the existing visible browser
   session. Use the live Fastwork form as the source of truth for required
   fields and allowed values. Check the service list for a matching draft or
   published listing before creating another one. If login, OTP, CAPTCHA,
   identity verification, payment, or a policy warning appears, stop and show
   the exact screen that needs the user's action.
4. **Fill and review.** Enter only the approved facts. Use an image or
   portfolio asset only when the user owns or has permission to use it; inspect
   it for private data. Re-read every customer-visible field in Fastwork's
   preview and list unresolved warnings or missing fields.
5. **Get final approval.** Show a compact preview containing the title,
   category, package or price, turnaround, revision limit, customer-visible
   description, assets, and unresolved warnings. Ask for approval immediately
   before Fastwork saves a draft or publishes the listing. Approval applies to
   the current preview only.
6. **Verify the result.** After an approved save or publish, return to My
   Services and confirm the matching title, listing ID or URL, and visible
   status. If the result is uncertain, record `submitted-unverified`, stop,
   and inspect before retrying so a duplicate is not created.

## Boundaries

- Fastwork-only by default. Cross-posting to another marketplace needs a new
  request.
- Use the public browser UI only. Never use private endpoints, bypass login
  protections, or store credentials, OTPs, customer files, or browser state in
  the skill package.
- Treat saving a draft and publishing as external mutations. Each needs a
  current approval immediately before the action.
- Do not invent testimonials, case studies, qualifications, prices, delivery
  promises, platform features, or service outcomes.
- Keep customer-facing copy concise, specific, and in Thai unless the user
  requests another language.

## Completion report

Report the verified Fastwork status, title, listing URL or ID, price,
turnaround, revision limit, and what remains for the user. If nothing was
saved or published, label the result `draft-prepared` and include the next
manual action.
