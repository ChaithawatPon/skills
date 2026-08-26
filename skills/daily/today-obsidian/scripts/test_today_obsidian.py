#!/usr/bin/env python3
"""Behavior tests for today-obsidian output helpers."""

from __future__ import annotations

import json
import unittest
from pathlib import Path

from task_output import (
    core_task_title,
    render_items,
    unchecked_task_titles,
    upsert_section,
    verify_carry_forward,
)


ROOT = Path(__file__).resolve().parents[1]
FIXTURES = ROOT / "fixtures"


class TodayObsidianOutputTests(unittest.TestCase):
    def test_tasks_use_checkboxes_and_topics_use_plain_bullets(self) -> None:
        items = json.loads(
            (FIXTURES / "output-contract.json").read_text(encoding="utf-8")
        )
        expected = (FIXTURES / "output-contract.md").read_text(encoding="utf-8")
        self.assertEqual(render_items(items), expected)

    def test_generated_section_rerun_is_idempotent(self) -> None:
        before = (FIXTURES / "idempotent-note-before.md").read_text(encoding="utf-8")
        expected = (FIXTURES / "idempotent-note-after.md").read_text(encoding="utf-8")
        generated = "- Topic: profile\n- [ ] Review the animation\n"
        first = upsert_section(before, "## Project Priorities", generated)
        second = upsert_section(first, "## Project Priorities", generated)
        self.assertEqual(first, expected)
        self.assertEqual(second, first)

    def test_carry_forward_verifies_every_prior_task_once(self) -> None:
        source_before = "- [ ] Send report (since 24-08-2026)\n- [ ] Check form\n"
        source_after = "- [>] rolled → [[25-08-2026]]\n- [>] rolled → [[25-08-2026]]\n"
        today = (
            "- [ ] P1 · required · You — Send report (since 24-08-2026)\n"
            "- [ ] P2 · required · Agent — Check form (since 24-08-2026)\n"
        )
        self.assertEqual(
            core_task_title("P1 · required · You — Send report (since 24-08-2026)"),
            "Send report",
        )
        self.assertEqual(unchecked_task_titles(source_before), ["Send report", "Check form"])
        verify_carry_forward(source_before, source_after, today)

    def test_carry_forward_rejects_a_missing_task(self) -> None:
        source_before = "- [ ] Send report\n- [ ] Check form\n"
        source_after = "- [>] rolled → [[25-08-2026]]\n- [>] rolled → [[25-08-2026]]\n"
        today = "- [ ] P1 · required · You — Send report (since 24-08-2026)\n"
        with self.assertRaisesRegex(ValueError, "Check form"):
            verify_carry_forward(source_before, source_after, today)

    def test_duplicate_source_titles_roll_each_line_but_carry_once(self) -> None:
        source_before = "- [ ] Send report\n- [ ] Send report\n"
        source_after = "- [>] rolled → [[25-08-2026]]\n- [>] rolled → [[25-08-2026]]\n"
        today = "- [ ] P1 · required · You — Send report (since 24-08-2026)\n"
        verify_carry_forward(source_before, source_after, today)


if __name__ == "__main__":
    unittest.main()
