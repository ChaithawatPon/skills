#!/usr/bin/env python3
"""Fail if a public skill package contains obvious private data."""

from __future__ import annotations

import re
import sys
from pathlib import Path


PATTERNS = {
    "email": re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}"),
    "absolute-home-path": re.compile("/" + r"Users/[^\\s`'\"<>]+"),
    "discord-snowflake": re.compile(r"\b\d{17,20}\b"),
    "phone-like": re.compile(r"\b0\d{8,9}\b"),
    "student-id-like": re.compile(r"\b\d{10,13}\b"),
    "token-like": re.compile(r"(?i)\b(token|secret|password|webhook|cookie)\b\s*[:=]"),
}

ALLOWLIST = {
    "student@example.com",
}


def should_skip(path: Path) -> bool:
    parts = set(path.parts)
    if path.name == "privacy_scan.py":
        return False
    return bool(parts & {".git", "__pycache__"}) or path.suffix in {".pyc", ".png", ".jpg", ".jpeg", ".pdf"}


def scan(root: Path) -> int:
    findings: list[str] = []
    for path in sorted(root.rglob("*")):
        if not path.is_file() or should_skip(path):
            continue
        text = path.read_text(encoding="utf-8", errors="ignore")
        for name, pattern in PATTERNS.items():
            for match in pattern.finditer(text):
                value = match.group(0)
                if value in ALLOWLIST:
                    continue
                line_no = text.count("\n", 0, match.start()) + 1
                findings.append(f"{path.relative_to(root)}:{line_no}: {name}")
    if findings:
        print("Privacy scan failed:")
        for finding in findings:
            print(f"- {finding}")
        return 1
    print("Privacy scan passed.")
    return 0


def main() -> int:
    root = Path(sys.argv[1] if len(sys.argv) > 1 else ".").resolve()
    return scan(root)


if __name__ == "__main__":
    raise SystemExit(main())
