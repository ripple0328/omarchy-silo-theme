import importlib.util
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

THEME = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('levels', THEME / 'levels/launch.py')
levels = importlib.util.module_from_spec(spec)
spec.loader.exec_module(levels)

class LevelsTest(unittest.TestCase):
    def test_catalog_assets_exist_and_are_unique(self):
        entries = levels.catalog(THEME)
        self.assertEqual(len(entries), 9)
        self.assertEqual(len({e['path'] for e in entries}), 9)
        self.assertTrue(all(e['url'].startswith('file:///') for e in entries))

    def test_catalog_rejects_missing_and_escaping_paths(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            (root / 'levels').mkdir()
            (root / 'backgrounds').mkdir()
            (root / 'outside.jpg').write_bytes(b'image')
            for filename in ('missing.jpg', '../outside.jpg'):
                (root / 'levels/levels.json').write_text(json.dumps([{'file': filename}]))
                with self.assertRaises(ValueError):
                    levels.catalog(root)

    def test_installer_registers_menu_entry_without_launching(self):
        with tempfile.TemporaryDirectory() as tmp, patch.object(levels.Path, 'home', return_value=Path(tmp)), patch.object(levels.subprocess, 'run') as run:
            target = levels.install(THEME)
            entry = Path(tmp) / '.local/share/applications/silo-levels.desktop'
            self.assertIn('Name=Silo: Levels', entry.read_text())
            self.assertTrue((target / 'launch.py').is_file())
            self.assertEqual((target / 'source.txt').read_text(), str(THEME))
            run.assert_not_called()

if __name__ == '__main__':
    unittest.main()
