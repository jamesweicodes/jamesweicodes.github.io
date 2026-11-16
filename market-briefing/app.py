"""Local server for the daily market briefing.

Run from this directory:

    python3 app.py

Then open http://127.0.0.1:8080
"""

from __future__ import annotations

import argparse
import json
import logging
import os
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, urlparse

from briefing import BriefingError, get_briefing
from render import render_page

log = logging.getLogger("market_briefing")


class BriefingHandler(BaseHTTPRequestHandler):
    def do_GET(self) -> None:
        parsed = urlparse(self.path)
        path = parsed.path
        query = parse_qs(parsed.query)
        try:
            if path in ("/", "/index.html"):
                force = query.get("refresh", ["0"])[0] in ("1", "true", "yes")
                sample_only = query.get("source", [""])[0] == "sample"
                page = render_page(get_briefing(force=force, sample_only=sample_only))
                self._send(200, "text/html; charset=utf-8", page.encode("utf-8"))
            elif path == "/api/briefing":
                force = query.get("refresh", ["0"])[0] in ("1", "true", "yes")
                sample_only = query.get("source", [""])[0] == "sample"
                body = json.dumps(get_briefing(force=force, sample_only=sample_only), indent=2).encode("utf-8")
                self._send(200, "application/json; charset=utf-8", body)
            elif path == "/health":
                self._send(200, "application/json; charset=utf-8", b'{"ok": true}')
            elif path == "/favicon.ico":
                self._send(204, "image/x-icon", b"")
            else:
                self._send(404, "text/plain; charset=utf-8", b"Not found\n")
        except BriefingError as exc:
            log.error("briefing unavailable: %s", exc)
            message = "The briefing is unavailable, including the saved sample.\n"
            self._send(503, "text/plain; charset=utf-8", message.encode("utf-8"))

    def do_HEAD(self) -> None:
        self.do_GET()

    def _send(self, status: int, content_type: str, body: bytes) -> None:
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-cache")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.end_headers()
        if self.command != "HEAD":
            self.wfile.write(body)

    def log_message(self, fmt: str, *args) -> None:
        log.info("%s - " + fmt, self.address_string(), *args)


def main() -> None:
    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
    parser = argparse.ArgumentParser(description="Serve the daily market briefing.")
    parser.add_argument("--host", default=os.environ.get("HOST", "127.0.0.1"))
    parser.add_argument("--port", type=int, default=int(os.environ.get("PORT", "8080")))
    args = parser.parse_args()
    server = ThreadingHTTPServer((args.host, args.port), BriefingHandler)
    log.info("Daily market briefing at http://%s:%s", args.host, args.port)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        log.info("stopping")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
