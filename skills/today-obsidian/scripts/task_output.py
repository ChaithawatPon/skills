#!/usr/bin/env python3
"""Render generated daily-note items with an explicit task/topic contract."""

from __future__ import annotations

from collections.abc import Iterable, Mapping
import re
from typing import Any


STATUS_MARKERS = {
    "open": " ",
    "in-progress": "/",
    "done": "x",
}

UNCHECKED_TASK = re.compile(r"^\s*- \[ \]\s+(.+?)\s*$", re.MULTILINE)
ROLLED_TASK = re.compile(
    r"^\s*- \[>\]\s+rolled\s+→\s+\[\[\d{2}-\d{2}-\d{4}\]\]\s*$",
    re.MULTILINE,
)
TASK_PREFIX = re.compile(
    r"^(?:⚠️stale\s+)?P[1-3]\s+·\s+(?:required|optional)\s+·\s+"
    r"(?:You|Agent|Team)\s+—\s+"
)
SINCE_SUFFIX = re.compile(r"\s+\(since \d{2}-\d{2}-\d{4}\)\s*$")


def core_task_title(text: str) -> str:
    """Return the stable title used to match a carried task across daily notes."""

    title = TASK_PREFIX.sub("", text.strip())
    return SINCE_SUFFIX.sub("", title).strip()


def unchecked_task_titles(note: str) -> list[str]:
    """Return unchecked task titles in source order, without schema metadata."""

    return [core_task_title(text) for text in UNCHECKED_TASK.findall(note)]


def verify_carry_forward(
    source_before: str,
    source_after: str,
    carried_tasks_body: str,
) -> None:
    """Fail unless each unique prior task was rolled and carried exactly once."""

    source_titles = unchecked_task_titles(source_before)
    expected = list(dict.fromkeys(source_titles))
    if unchecked_task_titles(source_after):
        raise ValueError("source still contains unchecked tasks after roll-forward")
    if len(ROLLED_TASK.findall(source_after)) < len(source_titles):
        raise ValueError("source is missing one or more rolled markers")

    today_titles = unchecked_task_titles(carried_tasks_body)
    missing = [title for title in expected if today_titles.count(title) != 1]
    if missing:
        raise ValueError(
            "carried tasks must appear exactly once in today's Carried Tasks: "
            + "; ".join(missing)
        )


def render_items(items: Iterable[Mapping[str, Any]]) -> str:
    """Render actionable tasks as checkboxes and context as plain bullets."""

    lines: list[str] = []
    for item in items:
        kind = str(item.get("kind", "")).strip()
        text = str(item.get("text", "")).strip()
        if not text:
            raise ValueError("item text must not be empty")

        if kind == "topic":
            lines.append(f"- {text}")
            continue

        if kind != "task":
            raise ValueError(f"unsupported item kind: {kind or '<empty>'}")

        status = str(item.get("status", "open")).strip()
        try:
            marker = STATUS_MARKERS[status]
        except KeyError as exc:
            raise ValueError(f"unsupported task status: {status}") from exc
        lines.append(f"- [{marker}] {text}")

    return "\n".join(lines) + ("\n" if lines else "")


def upsert_section(note: str, heading: str, body: str) -> str:
    """Replace one generated Markdown section without touching surrounding text."""

    match = re.fullmatch(r"(#{1,6})\s+\S.*", heading)
    if not match:
        raise ValueError("heading must be a Markdown ATX heading")

    level = len(match.group(1))
    lines = note.splitlines(keepends=True)
    start = next(
        (
            index
            for index, line in enumerate(lines)
            if line.rstrip("\r\n") == heading
        ),
        None,
    )
    replacement = f"{heading}\n\n{body.rstrip()}\n"

    if start is None:
        separator = "" if not note or note.endswith("\n\n") else "\n"
        return f"{note}{separator}{replacement}"

    boundary = re.compile(rf"^#{{1,{level}}}\s+")
    end = next(
        (
            index
            for index in range(start + 1, len(lines))
            if boundary.match(lines[index])
        ),
        len(lines),
    )
    return "".join(lines[:start]) + replacement + "\n" + "".join(lines[end:])
