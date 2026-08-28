---
name: clean-mac-storage
description: Audit and safely reclaim macOS storage through review-first cache cleanup, application review, old-project handling, and home-folder organization. Use when a user asks why storage is full, what can be deleted, which apps are unused, or how to organize large files.
---

# Clean Mac Storage

Measure first, propose exact targets, wait for approval, and verify after every cleanup phase.

## Workflow

1. Record free space with `df -h /System/Volumes/Data`, then measure large folders under the user's home directory without changing them.
2. Separate disposable caches, installed apps, app/login state, active projects, recoverable old projects, and personal files that require classification.
3. Present one small approval packet containing exact paths, measured sizes, expected consequences, and data that will be preserved.
4. After explicit approval, close affected apps and remove or move only the named targets. Prefer recoverable moves over permanent deletion.
5. Re-measure free space and verify browser profiles, logins, active repositories, projects, and excluded folders remain present.

## Boundaries

- Audit is read-only. Deletion, uninstalling, emptying Trash, browser-profile removal, and file moves each require fresh approval of exact targets.
- Treat `~/Library`, agent configuration, cloud mounts, Git worktrees, browser profiles, and application support folders as stateful. Inspect named children; never bulk-delete them.
- A remote URL or old archive note is not recovery proof. Before removing a project, verify Git status, remote identity, backup state, and restore path.
- Preserve cookies, passwords, browser history, local storage, editor settings, personal documents, and project files unless the approval packet names them and states the consequence.
- Stop when meaningful space recovery requires deleting active state, unfinished work, personal files, or data without verified recovery.

Report free space before and after, measured space reclaimed, exact targets changed, and protected data verified present.
