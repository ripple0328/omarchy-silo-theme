#!/usr/bin/env python3
"""Serve only the companion's public assets on loopback. No write endpoints."""
import argparse
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parent
ASSETS = {'/': ('index.html', 'text/html; charset=utf-8'), '/index.html': ('index.html', 'text/html; charset=utf-8'), '/style.css': ('style.css', 'text/css'), '/app.mjs': ('app.mjs', 'text/javascript'), '/core.mjs': ('core.mjs', 'text/javascript'), '/icon.svg': ('icon.svg', 'image/svg+xml')}
class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        port = self.server.server_port
        if self.headers.get('Host') not in (f'127.0.0.1:{port}', f'localhost:{port}'):
            self.send_error(403); return
        if self.path == '/health':
            payload, mime = b'silo-mechanical-v1', 'text/plain'
        elif self.path in ASSETS:
            name, mime = ASSETS[self.path]
            payload = (ROOT / name).read_bytes()
        else:
            self.send_error(404); return
        self.send_response(200)
        self.send_header('Content-Type', mime)
        self.send_header('Content-Length', str(len(payload)))
        self.send_header('Cache-Control', 'no-store')
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('Content-Security-Policy', "default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self'; connect-src 'none'; media-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'")
        self.end_headers(); self.wfile.write(payload)
    def log_message(self, *_):
        pass
if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--port', type=int, default=48118)
    args = parser.parse_args()
    ThreadingHTTPServer(('127.0.0.1', args.port), Handler).serve_forever()
