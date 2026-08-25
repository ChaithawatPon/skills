#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

fail() { echo "FAIL: $*" >&2; exit 1; }

packages=(edit-video sell-to-facebook-marketplace social-update sumup today-obsidian)
for name in "${packages[@]}"; do
  dir="$ROOT/skills/$name"
  [ -f "$dir/SKILL.md" ] || fail "missing SKILL.md in $name"
done

python3 "$ROOT/skills/edit-video/scripts/validate-skill.py" "$ROOT/skills/edit-video"
python3 "$ROOT/skills/social-update/scripts/validate-skill.py" "$ROOT/skills/social-update"
python3 "$ROOT/skills/sumup/scripts/validate-skill.py" "$ROOT/skills/sumup"
python3 "$ROOT/skills/today-obsidian/scripts/validate-skill.py" "$ROOT/skills/today-obsidian"
(cd "$ROOT/skills/today-obsidian/scripts" && python3 test_today_obsidian.py)

if [ -f "$ROOT/skills/social-update/scripts/test_job_hunter.py" ]; then
  python3 "$ROOT/skills/social-update/scripts/test_job_hunter.py"
fi

if [ -f "$ROOT/skills/edit-video/scripts/test_fixture_smoke.py" ]; then
  python3 -m pip install -q -r "$ROOT/skills/edit-video/requirements.txt"
  python3 "$ROOT/skills/edit-video/scripts/test_fixture_smoke.py"
fi

echo "validate.sh: structure and python checks passed"
echo "Marketplace npm tests run in CI"
