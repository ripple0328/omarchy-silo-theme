#!/usr/bin/env python3
"""Start the user service on demand and open its verified local page."""
import subprocess
import time
from urllib.request import urlopen

subprocess.run(['systemctl', '--user', 'start', 'silo-mechanical.service'], check=True)
for attempt in range(30):
    try:
        with urlopen('http://127.0.0.1:48118/health', timeout=1) as response:
            if response.read() != b'silo-mechanical-v1':
                raise RuntimeError('Port 48118 is occupied by a different application')
        break
    except OSError:
        if attempt == 29:
            raise SystemExit('Silo could not start. Check: journalctl --user -u silo-mechanical.service')
        time.sleep(.1)
subprocess.run(['omarchy', 'launch', 'webapp', 'http://127.0.0.1:48118/'], check=True)
