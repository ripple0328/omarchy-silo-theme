import importlib.util
from pathlib import Path
import tempfile
from unittest.mock import patch
import unittest

ROOT=Path(__file__).resolve().parents[1]/'companion'
spec=importlib.util.spec_from_file_location('game_install',ROOT/'install.py')
installer=importlib.util.module_from_spec(spec);spec.loader.exec_module(installer)
class InstallTest(unittest.TestCase):
    def test_first_launch_installs_and_second_launch_is_idempotent(self):
        with tempfile.TemporaryDirectory() as tmp, patch.object(installer.Path,'home',return_value=Path(tmp)),patch.object(installer.shutil,'which',return_value='/usr/bin/update-desktop-database'),patch.object(installer.subprocess,'run') as run:
            target=installer.install(ROOT)
            entry=Path(tmp)/'.local/share/applications/silo-cleaning.desktop'
            self.assertTrue(entry.exists());self.assertIn('Silo: The Cleaning',entry.read_text())
            self.assertIn('launch.py',entry.read_text());self.assertTrue((target/'install.py').exists())
            old=entry.stat().st_mtime_ns;installer.install(ROOT)
            self.assertEqual(entry.stat().st_mtime_ns,old);self.assertEqual(run.call_count,1)
            self.assertFalse((Path(tmp)/'.config/systemd').exists())
    def test_shortcut_picks_up_updated_theme_and_survives_theme_removal(self):
        with tempfile.TemporaryDirectory() as tmp, patch.object(installer.Path,'home',return_value=Path(tmp)),patch.object(installer.shutil,'which',return_value=None):
            target=installer.install(ROOT)
            theme=Path(tmp)/'.config/omarchy/themes/silo/companion';theme.mkdir(parents=True)
            for name in installer.ASSETS:(theme/name).write_bytes((ROOT/name).read_bytes())
            (theme/'app.mjs').write_text('// newer theme copy')
            installer.install(target);self.assertEqual((target/'app.mjs').read_text(),'// newer theme copy')
            (theme/'app.mjs').unlink();installer.install(target)
            self.assertEqual((target/'app.mjs').read_text(),'// newer theme copy')
    def test_incomplete_source_cannot_overwrite_installed_files(self):
        with tempfile.TemporaryDirectory() as tmp,patch.object(installer.Path,'home',return_value=Path(tmp)),patch.object(installer.shutil,'which',return_value=None):
            target=installer.install(ROOT);before=(target/'index.html').read_bytes()
            source=Path(tmp)/'incomplete';source.mkdir();(source/'index.html').write_text('incomplete')
            with self.assertRaises(FileNotFoundError):installer.install(source)
            self.assertEqual((target/'index.html').read_bytes(),before)
if __name__=='__main__':unittest.main()
