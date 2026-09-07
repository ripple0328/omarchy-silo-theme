#!/usr/bin/env python3
"""Register the game automatically on first launch. No services or extra packages."""
from pathlib import Path
import shutil
import subprocess

ROOT = Path(__file__).resolve().parent
ASSETS = ('index.html', 'style.css', 'app.mjs', 'core.mjs', 'icon.svg', 'outside.jpg', 'launch.py', 'install.py')

def desktop_quote(path):
    return '"' + str(path).replace('\\', '\\\\').replace('"', '\\"').replace('`', '\\`').replace('$', '\\$').replace('%', '%%') + '"'

def install(source=ROOT):
    home = Path.home()
    target = home / '.local/share/silo-cleaning'
    apps = home / '.local/share/applications'
    theme = home / '.config/omarchy/themes/silo/companion'
    source = Path(source).resolve()
    # The installed shortcut picks up a freshly installed theme automatically.
    if source == target.resolve() and all((theme / name).is_file() for name in ASSETS):
        source = theme
    # Read everything before writing, so an incomplete source cannot partly update the game.
    assets = {name: (source / name).read_bytes() for name in ASSETS}
    target.mkdir(parents=True, exist_ok=True)
    apps.mkdir(parents=True, exist_ok=True)
    changed = False
    for name, contents in assets.items():
        destination = target / name
        if not destination.is_file() or destination.read_bytes() != contents:
            destination.write_bytes(contents)
            changed = True
    entry = apps / 'silo-cleaning.desktop'
    text = ('[Desktop Entry]\nVersion=1.0\nType=Application\nName=Silo: The Cleaning\n'
            'Comment=Clean the lens. Let them see the world outside.\n'
            'Exec=/usr/bin/python3 ' + desktop_quote(target / 'launch.py') + '\n'
            'Icon=' + str(target / 'icon.svg') + '\nTerminal=false\nCategories=Game;\n'
            'Keywords=Silo;Cleaning;Game;\n')
    if not entry.is_file() or entry.read_text() != text:
        entry.write_text(text)
        changed = True
    if changed and shutil.which('update-desktop-database'):
        subprocess.run(['update-desktop-database', str(apps)], check=True)
    return target

if __name__ == '__main__':
    install()
    level_installer = ROOT.parent / 'levels/launch.py'
    if level_installer.is_file():
        import runpy
        runpy.run_path(str(level_installer))['install'](ROOT.parent)
    print('Ready. Open the Apps menu and search for Silo.')
