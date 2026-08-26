import unittest
from pathlib import Path

UNIVERSITY = Path(__file__).resolve().parents[1].parent


class SkillContractsTest(unittest.TestCase):
    def test_router_targets_exist(self):
        router = (UNIVERSITY / "n2n-assignment" / "SKILL.md").read_text()
        for name in ("check-assignment", "eli5-assignment", "do-assignment"):
            self.assertTrue((UNIVERSITY / name / "SKILL.md").is_file())
            self.assertIn(f"../{name}/SKILL.md", router)

    def test_compatibility_alias_routes_to_n2n(self):
        alias = (UNIVERSITY / "doer-assignment" / "SKILL.md").read_text()
        self.assertIn("../n2n-assignment/SKILL.md", alias)
        self.assertIn("Temporary compatibility alias", alias)

    def test_ideas_interview_and_visual_prototype_are_gated(self):
        instructions = (UNIVERSITY / "do-assignment" / "SKILL.md").read_text()
        self.assertIn("one question at a time", instructions)
        self.assertIn("maximum five", instructions)
        self.assertIn("after outline approval", instructions)
        self.assertIn("2–3", instructions)
        self.assertIn("Stop for review", instructions)

    def test_eli5_requires_verified_source_and_missing_information(self):
        instructions = (UNIVERSITY / "eli5-assignment" / "SKILL.md").read_text()
        self.assertIn("verified assignment brief", instructions)
        self.assertIn("Missing information", instructions)
        self.assertIn("Never create answers", instructions)


if __name__ == "__main__":
    unittest.main()
