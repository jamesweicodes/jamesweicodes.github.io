"""Tests that do not need the network."""

from __future__ import annotations

import json
import sys
import threading
import unittest
from datetime import datetime, timezone
from http.client import HTTPConnection
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from briefing import (
    INSTRUMENTS,
    BriefingError,
    Headline,
    Quote,
    clear_cache,
    compose,
    get_briefing,
    load_sample,
)
from render import render_page

ROOT = Path(__file__).resolve().parents[1]


def _quote(instrument_id: str, price: float, session_base: float, week_base: float, sessions: int = 5) -> Quote:
    instrument = next(item for item in INSTRUMENTS if item.id == instrument_id)
    return Quote(
        instrument=instrument,
        price=price,
        session_base=session_base,
        week_base=week_base,
        session_date="2026-11-13",
        sessions=sessions,
    )


def _headlines() -> list[Headline]:
    published = datetime(2026, 11, 16, 12, 0, tzinfo=timezone.utc)
    titles = [
        ("CNBC", "top", "Nvidia earnings and the Anthropic IPO dominate the week"),
        ("CNBC", "top", "Stock futures slip as traders wait on inflation data"),
        ("CNBC Economy", "economy", "Wholesale prices keep inflation in focus"),
        ("CNBC", "top", "China summit talks add a trade risk to the week"),
    ]
    return [
        Headline(title, f"https://example.com/{index}", source, published, "A short summary.", kind)
        for index, (source, kind, title) in enumerate(titles)
    ]


def _fixture_quotes() -> dict[str, Quote]:
    return {
        "spx": _quote("spx", 7561.67, 7592.40, 7376.86),
        "dji": _quote("dji", 52347.55, 52500.0, 51000.0),
        "ixic": _quote("ixic", 25136.27, 25300.0, 24000.0),
        "rut": _quote("rut", 2790.49, 2810.0, 2700.0),
        "tnx": _quote("tnx", 5.154, 5.09, 4.864),
        "fvx": _quote("fvx", 4.981, 4.95, 4.659),
        "tyx": _quote("tyx", 5.481, 5.42, 5.256),
        "irx": _quote("irx", 4.122, 4.10, 4.035),
        "vix": _quote("vix", 19.3, 19.92, 18.5),
        "oil": _quote("oil", 88.49, 87.2, 86.0),
        "gold": _quote("gold", 3866.7, 3900.0, 4000.0),
        "dxy": _quote("dxy", 103.37, 103.1, 102.5),
    }


class ComposeTests(unittest.TestCase):
    def setUp(self) -> None:
        self.briefing = compose(
            _fixture_quotes(),
            _headlines(),
            generated_at=datetime(2026, 11, 16, 10, 48, tzinfo=timezone.utc),
        )

    def test_three_sections_have_content(self) -> None:
        self.assertGreaterEqual(len(self.briefing["headlines"]), 3)
        impact = self.briefing["impact"]
        self.assertIn("S&P 500", impact["stocks"])
        self.assertIn("The Dow", impact["stocks"])
        self.assertNotIn("The dow", impact["stocks"])
        self.assertIn("10-year", impact["rates"])
        self.assertIn("basis points", impact["rates"])
        self.assertIn("VIX", impact["risk"])
        self.assertIn("WTI crude", impact["risk"])
        self.assertNotIn("Wti", impact["risk"])
        self.assertGreaterEqual(len(self.briefing["watch"]), 4)
        for item in self.briefing["watch"]:
            self.assertTrue(item["name"])
            self.assertTrue(item["reason"])
            lowered = item["reason"].lower()
            self.assertNotIn("you should", lowered)
            self.assertNotIn("buy", lowered)
            self.assertNotIn("sell", lowered)

    def test_yield_move_is_in_basis_points(self) -> None:
        ten = next(item for item in self.briefing["moves"] if item["id"] == "tnx")
        self.assertEqual(ten["direction"], "up")
        self.assertIn("bp", ten["session_label"])
        self.assertIn("hurdle", self.briefing["impact"]["rates"].lower())

    def test_page_renders_sections_and_escapes(self) -> None:
        poisoned = json.loads(json.dumps(self.briefing))
        poisoned["headlines"][0]["title"] = '<script>alert("x")</script>'
        poisoned["headlines"][0]["link"] = "javascript:alert(1)"
        html = render_page(poisoned)
        self.assertIn("What happened", html)
        self.assertIn("Why it matters", html)
        self.assertIn("What to watch", html)
        self.assertIn("Not financial advice", html)
        self.assertNotIn("<script>alert", html)
        self.assertNotIn("javascript:alert", html)
        self.assertIn("&lt;script&gt;", html)

    def test_missing_core_quote_raises(self) -> None:
        quotes = _fixture_quotes()
        del quotes["tnx"]
        with self.assertRaises(BriefingError):
            compose(quotes, _headlines())


class SampleAndServerTests(unittest.TestCase):
    def test_sample_file_is_a_complete_briefing(self) -> None:
        data = load_sample()
        html = render_page(data)
        self.assertEqual(data["origin"], "sample")
        self.assertIn("What happened", html)
        self.assertIn("Why it matters", html)
        self.assertIn("What to watch", html)
        self.assertGreaterEqual(len(data["headlines"]), 3)
        self.assertGreaterEqual(len(data["watch"]), 4)

    def test_fallback_when_live_fetch_fails(self) -> None:
        import briefing

        def explode(*_args, **_kwargs):
            raise BriefingError("offline")

        original_build = briefing.build_live
        briefing.build_live = explode
        try:
            clear_cache()
            data = get_briefing(force=True)
        finally:
            briefing.build_live = original_build
            clear_cache()
        self.assertEqual(data["origin"], "sample")
        self.assertIn("did not respond", data["notice"])

    def test_server_returns_sample_page(self) -> None:
        from app import BriefingHandler

        server = __import__("http.server", fromlist=["ThreadingHTTPServer"]).ThreadingHTTPServer(
            ("127.0.0.1", 0), BriefingHandler
        )
        thread = threading.Thread(target=server.serve_forever, daemon=True)
        thread.start()
        try:
            port = server.server_address[1]
            connection = HTTPConnection("127.0.0.1", port, timeout=10)
            connection.request("GET", "/?source=sample")
            response = connection.getresponse()
            body = response.read().decode("utf-8")
            self.assertEqual(response.status, 200)
            self.assertIn("What happened", body)
            self.assertIn("Why it matters", body)
            self.assertIn("What to watch", body)
            self.assertIn("Not financial advice", body)
            self.assertIn("Sample data", body)
            connection.request("GET", "/health")
            health = connection.getresponse()
            self.assertEqual(health.status, 200)
            health.read()
        finally:
            server.shutdown()
            server.server_close()


if __name__ == "__main__":
    unittest.main()
