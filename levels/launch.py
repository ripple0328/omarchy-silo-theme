#!/usr/bin/env python3
"""Open the Silo level selector."""
import json
import os
from pathlib import Path
import shutil
import subprocess

ROOT = Path(__file__).resolve().parent

def catalog(theme):
    entries = json.loads((theme / 'levels/levels.json').read_text())
    for entry in entries:
        path = (theme / 'backgrounds' / entry['file']).resolve()
        if not path.is_relative_to((theme / 'backgrounds').resolve()) or not path.is_file():
            raise ValueError('Missing wallpaper: ' + entry['file'])
        entry['path'] = str(path)
        entry['url'] = path.as_uri()
    return entries

def install(theme):
    target = Path.home() / '.local/share/silo-levels'
    target.mkdir(parents=True, exist_ok=True)
    for name in ('launch.py', 'shell.qml'):
        shutil.copyfile(theme / 'levels' / name, target / name)
    (target / 'source.txt').write_text(str(theme.resolve()))
    apps = Path.home() / '.local/share/applications'
    apps.mkdir(parents=True, exist_ok=True)
    quote = str(target / 'launch.py').replace('\\', '\\\\').replace('"', '\\"').replace('$', '\\$').replace('`', '\\`').replace('%', '%%')
    (apps / 'silo-levels.desktop').write_text(
        '[Desktop Entry]\nType=Application\nName=Silo: Levels\n'
        'Comment=Travel through the silo and change your wallpaper\n'
        f'Exec=/usr/bin/python3 "{quote}"\nIcon=preferences-desktop-wallpaper\n'
        'Terminal=false\nCategories=Utility;\nKeywords=Silo;Wallpaper;Levels;\n')
    return target

def main():
    candidates = [Path.home() / '.config/omarchy/themes/silo', ROOT.parent]
    if (ROOT / 'source.txt').is_file():
        candidates.append(Path((ROOT / 'source.txt').read_text().strip()))
    theme = next((p for p in candidates if (p / 'levels/levels.json').is_file()), None)
    if theme is None:
        raise SystemExit('Reinstall the Silo theme to restore its wallpapers.')
    entries = catalog(theme)
    current = (Path.home() / '.local/state/omarchy/current/background').resolve()
    index = next((i for i,e in enumerate(entries) if Path(e['path']).name == current.name), 0)
    env = dict(os.environ, SILO_LEVELS=json.dumps(entries), SILO_LEVEL_INDEX=str(index))
    subprocess.run(['quickshell', '-p', str(theme / 'levels/shell.qml')], env=env, check=True)

if __name__ == '__main__':
    main()
