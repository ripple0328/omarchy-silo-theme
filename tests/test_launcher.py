import importlib.util
from pathlib import Path
import re
import tempfile
from unittest.mock import patch
import unittest

spec=importlib.util.spec_from_file_location('launcher',Path(__file__).resolve().parents[1]/'companion/launch.py')
launcher=importlib.util.module_from_spec(spec);spec.loader.exec_module(launcher)
class LauncherTest(unittest.TestCase):
    def test_bundle_is_self_contained(self):
        html=launcher.bundle()
        self.assertNotRegex(html,r'<script[^>]+src=')
        self.assertNotIn('type="module"',html)
        self.assertNotIn("import {strokePoints",html)
        self.assertNotRegex(html,r'\bexport (const|function)')
        self.assertIn("connect-src 'none'",html)
        self.assertIn('id="exit"',html)
        self.assertIn('data:image/jpeg;base64,',html)
        self.assertNotIn('src="outside.jpg"',html)
        self.assertNotIn('href="style.css"',html)
        self.assertNotIn('src="icon.svg"',html)
    def test_stable_atomic_output_preserves_other_files(self):
        with tempfile.TemporaryDirectory() as tmp,patch.object(launcher.Path,'home',return_value=Path(tmp)):
            path=launcher.build();self.assertTrue(path.is_file())
            marker=path.parent/'keep.txt';marker.write_text('preserve')
            self.assertEqual(launcher.build(),path)
            self.assertEqual(marker.read_text(),'preserve')
            self.assertFalse(path.with_suffix('.tmp').exists())
    def test_no_service_or_server_dependencies(self):
        for name in ('launch.py','install.py'):
            source=(launcher.ROOT/name).read_text()
            self.assertNotIn('systemctl',source)
            self.assertNotIn('systemd',source)
            self.assertNotIn('HTTPServer',source)
if __name__=='__main__':unittest.main()
