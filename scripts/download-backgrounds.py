#!/usr/bin/env python3
"""Fetch the credited original Apple press photos, checking pinned SHA-256 hashes."""
import hashlib
import io
import json
from pathlib import Path
import urllib.request
import zipfile

ROOT = Path(__file__).resolve().parents[1]

def main():
    for source in json.loads((ROOT / 'sources.json').read_text()):
        target = ROOT / source['file']
        expected = source['sha256']
        if target.is_file() and hashlib.sha256(target.read_bytes()).hexdigest() == expected:
            print(f'Already verified: {target.name}')
            continue
        print(f'Downloading: {target.name}', flush=True)
        with urllib.request.urlopen(source['download'], timeout=60) as response:
            archive = response.read()
        with zipfile.ZipFile(io.BytesIO(archive)) as z:
            matches = [name for name in z.namelist()
                       if name.lower().endswith('.jpg') and not name.startswith('__MACOSX')]
            if len(matches) != 1:
                raise ValueError(f'Expected one JPG in archive for {target.name}')
            photo = z.read(matches[0])
        if hashlib.sha256(photo).hexdigest() != expected:
            raise ValueError(f'Photo checksum changed: {target.name}; review the source before updating')
        target.parent.mkdir(parents=True, exist_ok=True)
        temporary = target.with_suffix('.jpg.part')
        try:
            temporary.write_bytes(photo)
            temporary.replace(target)
        finally:
            temporary.unlink(missing_ok=True)
    print('All six backgrounds verified.')

if __name__ == '__main__':
    main()
