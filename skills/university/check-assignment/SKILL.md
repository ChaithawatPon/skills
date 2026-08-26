---
name: check-assignment
description: Scan visible course sources for assignments, lecture files, and announcements, then organize verified files locally. Use for assignment checks, course updates, and lecture collection.
---

# Check Assignment

Collect instructor files from the student's visible course sources. This public package has no school-specific routes. Put LMS URLs, Drive folders, and optional notify destinations in a private local config.

## Workflow

1. Read the private config for enrolled courses and destination folders.
2. Open each visible current course in the student's existing signed-in browser session.
3. Record posts, files, assignments, and due dates that are actually on screen.
4. Download new instructor files without renaming the original filename.
5. Save them into a stable course folder (syllabus, lectures, activities, briefs).
6. Hash each file. Skip duplicates already stored.
7. Report new items, blockers, and missing sources. Do not invent a due date.

## Gates

- Browser-only. No LMS API keys.
- Stop on login, CAPTCHA, or permission walls.
- Never submit work or change calendar events.
- Live notification is off unless the student enables it in private config after a dry run.
- Unclear items become a `clarify` record, not a guessed assignment.
