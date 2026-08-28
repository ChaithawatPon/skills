#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

fail() { echo "FAIL: $*" >&2; exit 1; }

count=0
echo "packages:"
while IFS= read -r skill_md; do
  dir="$(dirname "$skill_md")"
  rel="${dir#"$ROOT/"}"
  echo "  $rel"
  [ -f "$dir/SKILL.md" ] || fail "missing SKILL.md in $rel"
  count=$((count + 1))
done < <(find "$ROOT/skills" -mindepth 3 -maxdepth 3 -name SKILL.md -not -path '*/node_modules/*' | sort)
[ "$count" -gt 0 ] || fail "no SKILL.md packages found"

if git ls-files --error-unmatch '**/node_modules/**' >/dev/null 2>&1; then
  fail "node_modules is tracked"
fi
if git ls-files --error-unmatch '**/state/**' >/dev/null 2>&1; then
  fail "state/ is tracked"
fi

python3 "$ROOT/scripts/privacy_scan.py" "$ROOT"

python3 "$ROOT/skills/media/edit-video/scripts/validate-skill.py" "$ROOT/skills/media/edit-video"
python3 "$ROOT/skills/professional/social-update/scripts/validate-skill.py" "$ROOT/skills/professional/social-update"
python3 "$ROOT/skills/daily/today-obsidian/scripts/validate-skill.py" "$ROOT/skills/daily/today-obsidian"
(cd "$ROOT/skills/daily/today-obsidian/scripts" && python3 test_today_obsidian.py)
python3 "$ROOT/skills/professional/social-update/scripts/test_job_hunter.py"
python3 "$ROOT/skills/daily/mac-health/tests/test_route.py"
node --check < "$ROOT/skills/daily/transaction/assets/google-apps-script/Code.gs"

echo "validate.sh: structure, privacy, Python, and JavaScript checks passed"
echo "Marketplace npm tests run in CI"
