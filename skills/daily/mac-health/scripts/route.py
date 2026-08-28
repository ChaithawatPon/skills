#!/usr/bin/env python3
"""Resolve a public mac-health mode to ordered skill names."""

import json
import sys


ROUTES = {
    "storage": {"skills": ["clean-mac-storage"]},
    "privacy": {"skills": ["clean-digital-footprint"]},
    "full": {"skills": ["clean-digital-footprint", "clean-mac-storage"]},
}


def main() -> int:
    if len(sys.argv) != 2 or sys.argv[1].lower() not in ROUTES:
        print(json.dumps({"status": "error", "reason": "usage: route.py <storage|privacy|full>"}))
        return 2
    print(json.dumps(ROUTES[sys.argv[1].lower()]))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
