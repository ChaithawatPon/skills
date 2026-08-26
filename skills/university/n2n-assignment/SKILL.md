---
name: n2n-assignment
description: Route a school assignment request to a source scan, a beginner explanation, or an approval-gated deliverable. Use for course updates, lecture files, assignment explanations, and assignment drafting.
---

# N2N Assignment

Front door for assignment work. Private school accounts, course IDs, and notification destinations stay in a local config outside this repository.

## Route

- Scan course sources or collect instructor files: read and follow [`../check-assignment/SKILL.md`](../check-assignment/SKILL.md).
- Explain one verified brief for a beginner: read and follow [`../eli5-assignment/SKILL.md`](../eli5-assignment/SKILL.md).
- Create a deliverable from a verified brief: read and follow [`../do-assignment/SKILL.md`](../do-assignment/SKILL.md).

If the request mixes scanning and creation, finish `$check-assignment` first. Then stop at the `$do-assignment` ideas interview. A discovered brief is never permission to write or submit the answer.

## Shared gates

- Prefer browser-only source access. Reuse a persistent signed-in session owned by the student.
- Fail closed on login, CAPTCHA, permissions, broken navigation, or an unclear source.
- Preserve source URLs, original files, and a content hash for dedupe.
- No upload, email, turn-in, quiz submit, calendar mutation, or live notify without the gate owned by the selected child skill.
