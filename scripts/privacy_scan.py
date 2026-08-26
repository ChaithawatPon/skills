#!/usr/bin/env python3
"""Fail if the public catalog contains obvious private data."""

from __future__ import annotations

import re
import sys
from pathlib import Path

PATTERNS = {
    "email": re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}"),
    "absolute-home-path": re.compile(r"/Users/[^\s`'\"<>]+"),
    "discord-snowflake": re.compile(r"\b(?:15[0-9]{16,18}|12[0-9]{16,18})\b"),
    "phone-like": re.compile(r"\b0\d{8,9}\b"),
}

ALLOWLIST = {
    "student@example.com",
}

SKIP_DIRS = {".git", "node_modules", "__pycache__", ".github"}
SKIP_SUFFIX = {".pyc", ".png", ".jpg", ".jpeg", ".pdf", ".lock", ".wasm"}
SKIP_NAMES = {"package-lock.json", "LICENSE", "privacy_scan.py"}


def should_skip(path: Path) -> bool:
    if path.name in SKIP_NAMES or path.suffix in SKIP_SUFFIX:
        return True
    return bool(set(path.parts) & SKIP_DIRS)


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
                findings.append(f"{path.relative_to(root)}:{line_no}: {name} {value}")
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
