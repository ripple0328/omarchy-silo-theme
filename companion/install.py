#!/usr/bin/env python3
"""Optionally add an application shortcut. No services or system configuration."""
from pathlib import Path
import shutil
import subprocess

source = Path(__file__).resolve().parent
home = Path.home()
target = home / '.local/share/silo-cleaning'
apps = home / '.local/share/applications'
for directory in (target, apps):
    directory.mkdir(parents=True, exist_ok=True)
for name in ('index.html','style.css','app.mjs','core.mjs','icon.svg','outside.jpg','launch.py'):
    if (source / name).resolve() != (target / name).resolve():
        shutil.copyfile(source / name, target / name)
def desktop_quote(path):
    return '"' + str(path).replace('\\', '\\\\').replace('"', '\\"').replace('`','\\`').replace('$','\\$').replace('%','%%') + '"'
(apps / 'silo-cleaning.desktop').write_text('[Desktop Entry]\nVersion=1.0\nType=Application\nName=Silo: The Cleaning\nComment=Clean the lens. Let them see the world outside.\nExec=/usr/bin/python3 ' + desktop_quote(target / 'launch.py') + '\nIcon=' + str(target / 'icon.svg') + '\nTerminal=false\nCategories=Game;\nKeywords=Silo;Cleaning;Game;\n')
if shutil.which('update-desktop-database'):
    subprocess.run(['update-desktop-database',str(apps)],check=True)
print('Shortcut installed. Open “Silo: The Cleaning” in the application launcher.')
