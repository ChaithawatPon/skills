#!/usr/bin/env python3
"""List installable packages in the public catalog."""

from __future__ import annotations

from pathlib import Path


DISPLAY_NAMES = {
    "selling": "ของต้องขาย",
    "university": "งานส่งอาจารย์",
    "daily": "สมองสำรอง",
    "professional": "มืออาชีพ",
    "media": "ตัดให้จบ",
}


def main() -> int:
    root = Path(__file__).resolve().parents[1]
    skills_root = root / "skills"
    for category_dir in sorted(path for path in skills_root.iterdir() if path.is_dir()):
        packages = sorted(
            path.name
            for path in category_dir.iterdir()
            if path.is_dir() and (path / "SKILL.md").is_file()
        )
        if not packages:
            continue
        label = DISPLAY_NAMES.get(category_dir.name, category_dir.name)
        print(f"{category_dir.name} - {label}")
        for package in packages:
            print(f"  - {package}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
