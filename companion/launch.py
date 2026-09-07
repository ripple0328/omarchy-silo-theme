#!/usr/bin/env python3
"""Build and open a self-contained, offline game. No server or service."""
import argparse
import base64
from pathlib import Path
import re
import shutil
import subprocess

ROOT = Path(__file__).resolve().parent

def bundle(source=ROOT):
    html = (source / 'index.html').read_text()
    css = (source / 'style.css').read_text()
    core = re.sub(r'^export ', '', (source / 'core.mjs').read_text(), flags=re.MULTILINE)
    app = re.sub(r'^import .*?;\n', '', (source / 'app.mjs').read_text(), count=1)
    icon = 'data:image/svg+xml;base64,' + base64.b64encode((source / 'icon.svg').read_bytes()).decode()
    landscape = 'data:image/jpeg;base64,' + base64.b64encode((source / 'outside.jpg').read_bytes()).decode()
    html = html.replace('src="outside.jpg"', f'src="{landscape}"')
    html = html.replace('href="icon.svg"', f'href="{icon}"').replace('src="icon.svg"', f'src="{icon}"')
    html = html.replace('<link rel="stylesheet" href="style.css">', '<style>' + css + '</style>')
    html = html.replace('<script type="module" src="app.mjs"></script>', '')
    # No remote resources, module imports, or server endpoints are needed.
    policy = "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data:; connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'"
    html = html.replace('<meta charset="utf-8">', '<meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="' + policy + '">')
    return html.replace('</body>', '<script>\n' + core + '\n' + app + '\n</script></body>')

def build():
    # A stable file URL keeps browser storage consistent across repo updates.
    output = Path.home() / '.local/share/silo-cleaning/game.html'
    output.parent.mkdir(parents=True, exist_ok=True)
    temporary = output.with_suffix('.tmp')
    temporary.write_text(bundle())
    temporary.replace(output)
    return output

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--build-only', action='store_true', help='Write the standalone HTML without opening it')
    args = parser.parse_args()
    page = build()
    if args.build_only:
        print(page)
    elif shutil.which('omarchy'):
        subprocess.run(['omarchy', 'launch', 'webapp', page.as_uri()], check=True)
    else:
        browser = next((shutil.which(name) for name in ('chromium','google-chrome','brave','brave-browser') if shutil.which(name)), None)
        if not browser:
            raise SystemExit('Open ' + str(page) + ' in a browser, or install a Chromium-based browser for an app window.')
        subprocess.run([browser, '--app=' + page.as_uri()], check=True)
