#!/usr/bin/env python3
"""Static file server + CORS-bypass proxy for the rule execute API."""

from __future__ import annotations

import argparse
import json
import mimetypes
import os
import ssl
import sys
import urllib.error
import urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parent
DEFAULT_UPSTREAM = (
    "http://43.198.204.42:9527/irule/openapi/rule/execute/system"
)
PROXY_PATH = "/api/rule/execute"


def is_allowed_upstream(url: str) -> bool:
    try:
        p = urlparse(url)
    except Exception:
        return False
    if p.scheme not in ("http", "https"):
        return False
    if not p.netloc:
        return False
    return True


class Handler(BaseHTTPRequestHandler):
    server_version = "CaseSingleTestProxy/1.0"
    upstream_default = DEFAULT_UPSTREAM

    def log_message(self, fmt: str, *args) -> None:
        sys.stderr.write("%s - %s\n" % (self.address_string(), fmt % args))

    def _send(self, code: int, body: bytes, content_type: str) -> None:
        self.send_response(code)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        # Same-origin page does not need CORS; keep open for tooling.
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header(
            "Access-Control-Allow-Headers",
            "Content-Type, X-Upstream-Url",
        )
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.end_headers()
        if self.command != "HEAD":
            self.wfile.write(body)

    def _json_error(self, code: int, message: str) -> None:
        payload = json.dumps(
            {"code": code, "message": message, "proxyError": True},
            ensure_ascii=False,
        ).encode("utf-8")
        self._send(code, payload, "application/json; charset=utf-8")

    def do_OPTIONS(self) -> None:
        self._send(204, b"", "text/plain")

    def do_GET(self) -> None:
        self._serve_static()

    def do_HEAD(self) -> None:
        self._serve_static()

    def do_POST(self) -> None:
        if urlparse(self.path).path.rstrip("/") == PROXY_PATH.rstrip("/"):
            self._proxy_execute()
            return
        self._json_error(404, "Not found")

    def _serve_static(self) -> None:
        path = urlparse(self.path).path
        if path in ("", "/"):
            rel = "index.html"
        else:
            rel = path.lstrip("/")
        # Prevent path traversal
        target = (ROOT / rel).resolve()
        if not str(target).startswith(str(ROOT) + os.sep) and target != ROOT:
            self._json_error(403, "Forbidden")
            return
        if not target.is_file():
            self._json_error(404, "File not found")
            return
        data = target.read_bytes()
        ctype, _ = mimetypes.guess_type(str(target))
        if ctype is None:
            ctype = "application/octet-stream"
        if ctype.startswith("text/") or ctype in (
            "application/javascript",
            "application/json",
        ):
            ctype = ctype + "; charset=utf-8"
        self._send(200, data, ctype)

    def _proxy_execute(self) -> None:
        length = int(self.headers.get("Content-Length") or "0")
        raw = self.rfile.read(length) if length > 0 else b"{}"

        upstream = (
            self.headers.get("X-Upstream-Url")
            or self.headers.get("x-upstream-url")
            or self.upstream_default
        ).strip()
        if not is_allowed_upstream(upstream):
            self._json_error(400, "Invalid X-Upstream-Url")
            return

        req = urllib.request.Request(
            upstream,
            data=raw,
            method="POST",
            headers={
                "Content-Type": self.headers.get(
                    "Content-Type", "application/json"
                ),
                "Accept": "application/json, text/plain, */*",
                "User-Agent": "CaseSingleTestProxy/1.0",
            },
        )
        ctx = ssl.create_default_context()
        try:
            with urllib.request.urlopen(req, timeout=120, context=ctx) as resp:
                body = resp.read()
                ctype = resp.headers.get(
                    "Content-Type", "application/json; charset=utf-8"
                )
                self._send(resp.getcode() or 200, body, ctype)
        except urllib.error.HTTPError as e:
            body = e.read() if e.fp else b""
            ctype = e.headers.get(
                "Content-Type", "application/json; charset=utf-8"
            ) if e.headers else "application/json; charset=utf-8"
            if not body:
                body = json.dumps(
                    {
                        "code": e.code,
                        "message": str(e.reason),
                        "proxyError": True,
                    },
                    ensure_ascii=False,
                ).encode("utf-8")
                ctype = "application/json; charset=utf-8"
            self._send(e.code, body, ctype)
        except Exception as e:
            self._json_error(502, "Upstream request failed: %s" % e)


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Serve case single-test page with API proxy (CORS bypass)"
    )
    parser.add_argument("--host", default="0.0.0.0")
    parser.add_argument("--port", type=int, default=8080)
    parser.add_argument(
        "--upstream",
        default=os.environ.get("UPSTREAM_API_URL", DEFAULT_UPSTREAM),
        help="Default upstream rule execute URL",
    )
    args = parser.parse_args()
    Handler.upstream_default = args.upstream

    httpd = ThreadingHTTPServer((args.host, args.port), Handler)
    print(
        "Serving %s on http://%s:%s/ (proxy %s -> %s)"
        % (ROOT, args.host, args.port, PROXY_PATH, args.upstream),
        flush=True,
    )
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nBye", flush=True)


if __name__ == "__main__":
    main()
