#!/usr/bin/env python3
"""Install or update the optional companion. No theme or browser data is modified."""
from pathlib import Path
import shutil
import subprocess

source = Path(__file__).resolve().parent
home = Path.home()
target = home / '.local/share/silo-mechanical'
apps = home / '.local/share/applications'
units = home / '.config/systemd/user'
for directory in (target, apps, units):
    directory.mkdir(parents=True, exist_ok=True)
for name in ('index.html','style.css','app.mjs','core.mjs','icon.svg','serve.py','launch.py'):
    shutil.copyfile(source / name, target / name)
def unit_quote(path):
    return '"' + str(path).replace('\\', '\\\\').replace('"', '\\"').replace('%','%%') + '"'
def desktop_quote(path):
    return '"' + str(path).replace('\\', '\\\\').replace('"', '\\"').replace('`','\\`').replace('$','\\$').replace('%','%%') + '"'
(units / 'silo-mechanical.service').write_text('[Unit]\nDescription=Silo Mechanical local companion\n\n[Service]\nType=simple\nExecStart=/usr/bin/python3 ' + unit_quote(target / 'serve.py') + '\nRestart=on-failure\nRestartSec=3\nNoNewPrivileges=true\nUMask=0077\n')
(apps / 'silo-mechanical.desktop').write_text('[Desktop Entry]\nVersion=1.0\nType=Application\nName=Silo Mechanical\nComment=Generator inspection, focus shifts, and local handovers\nExec=/usr/bin/python3 ' + desktop_quote(target / 'launch.py') + '\nIcon=' + str(target / 'icon.svg') + '\nTerminal=false\nCategories=Utility;\nKeywords=Silo;Mechanical;Focus;Timer;\n')
subprocess.run(['systemctl','--user','daemon-reload'],check=True)
# Update a running instance, without starting a service the user has not launched.
subprocess.run(['systemctl','--user','try-restart','silo-mechanical.service'],check=True)
if shutil.which('update-desktop-database'):
    subprocess.run(['update-desktop-database',str(apps)],check=True)
print('Installed. Open “Silo Mechanical” in the application launcher.')
