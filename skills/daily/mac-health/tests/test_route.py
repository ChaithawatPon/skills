import json
import subprocess
import sys
import unittest
from pathlib import Path


ROUTE = Path(__file__).parents[1] / "scripts" / "route.py"


class RouteTests(unittest.TestCase):
    def route(self, mode: str):
        result = subprocess.run([sys.executable, ROUTE, mode], text=True, capture_output=True)
        return result, json.loads(result.stdout)

    def test_storage(self):
        result, payload = self.route("storage")
        self.assertEqual(result.returncode, 0)
        self.assertEqual(payload["skills"], ["clean-mac-storage"])

    def test_privacy(self):
        result, payload = self.route("privacy")
        self.assertEqual(result.returncode, 0)
        self.assertEqual(payload["skills"], ["clean-digital-footprint"])

    def test_full(self):
        result, payload = self.route("full")
        self.assertEqual(result.returncode, 0)
        self.assertEqual(payload["skills"], ["clean-digital-footprint", "clean-mac-storage"])


if __name__ == "__main__":
    unittest.main()
