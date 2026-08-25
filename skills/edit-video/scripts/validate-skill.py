#!/usr/bin/env python3
"""Validate one portable public agent-skill repository."""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path


FRONTMATTER = re.compile(r"\A---\n(.*?)\n---\n", re.DOTALL)
TOP_LEVEL_YAML = re.compile(r"^([A-Za-z][A-Za-z0-9_-]*):", re.MULTILINE)
NAME = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
HOME_PATH = re.compile(r"/(?:Users|home)/(?!<(?:user|username)>/)[A-Za-z0-9._-]+/")
TOKEN = re.compile(r"\b(?:ghp|github_pat|sk_(?:live|prod))_[A-Za-z0-9_-]{12,}\b", re.IGNORECASE)
PRIVATE = re.compile(r"(?:claude-skills-private|confidential customer|internal-only)", re.IGNORECASE)
TEXT_SUFFIXES = {
    ".md", ".py", ".yaml", ".yml", ".sh", ".txt", ".js", ".ts",
    ".json", ".cjs", ".mjs", ".example", ".gitkeep",
}
BINARY_SUFFIXES = {".png", ".ttf"}


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("root", nargs="?", type=Path, default=Path.cwd())
    args = parser.parse_args()
    root = args.root.resolve()
    errors: list[str] = []
    skill = root / "SKILL.md"

    if not skill.is_file():
        errors.append("missing root SKILL.md")
    else:
        text = skill.read_text(encoding="utf-8")
        match = FRONTMATTER.match(text)
        if not match:
            errors.append("SKILL.md is missing YAML frontmatter")
        else:
            keys = TOP_LEVEL_YAML.findall(match.group(1))
            name_match = re.search(r"^name:\s*([^\s#]+)\s*$", match.group(1), re.MULTILINE)
            if set(keys) != {"name", "description"} or len(keys) != 2:
                errors.append("frontmatter must contain only name and description")
            elif not name_match or not NAME.fullmatch(name_match.group(1)):
                errors.append("frontmatter name must be kebab-case")
            elif name_match.group(1) != root.name:
                errors.append(f"frontmatter name {name_match.group(1)!r} does not match repository {root.name!r}")

    nested_skills = [path for path in root.rglob("SKILL.md") if path != skill and ".git" not in path.parts]
    if nested_skills:
        errors.append("repository must contain exactly one SKILL.md")

    for path in root.rglob("*"):
        if ".git" in path.parts or "node_modules" in path.parts or "__pycache__" in path.parts:
            continue
        relative = path.relative_to(root)
        if path.is_symlink():
            errors.append(f"symlink is forbidden: {relative}")
            continue
        if not path.is_file() or path.suffix.lower() in BINARY_SUFFIXES:
            continue
        if path.name not in {"LICENSE", "FixBill", ".gitignore", ".gitkeep"} and path.suffix.lower() not in TEXT_SUFFIXES:
            errors.append(f"unsupported file type: {relative}")
            continue
        try:
            content = path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            errors.append(f"non-UTF-8 file: {relative}")
            continue
        if path.resolve() == Path(__file__).resolve():
            continue
        if HOME_PATH.search(content) or PRIVATE.search(content):
            errors.append(f"private path/reference: {relative}")
        if TOKEN.search(content):
            errors.append(f"possible token: {relative}")

    if errors:
        print("validation failed:", file=sys.stderr)
        print(*[f"- {error}" for error in errors], sep="\n", file=sys.stderr)
        return 1
    print(f"validated public skill: {root.name}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
