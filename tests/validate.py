#!/usr/bin/env python3
"""Validate palette readability, source images, and installed Omarchy templates."""
import hashlib, json, os, pathlib, subprocess, tempfile, tomllib
root = pathlib.Path(__file__).resolve().parents[1]
c = tomllib.loads((root / 'colors.toml').read_text())
def luminance(h):
    channels = [int(h[i:i+2], 16) / 255 for i in (1, 3, 5)]
    linear = [v / 12.92 if v <= .04045 else ((v + .055) / 1.055) ** 2.4 for v in channels]
    return sum(a*b for a, b in zip(linear, (.2126, .7152, .0722)))
def contrast(a, b):
    low, high = sorted((luminance(a), luminance(b)))
    return (high + .05) / (low + .05)
ratios = {k: round(contrast(c[k], c['background']), 2) for k in
          ('foreground', 'muted', 'accent', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan')}
ratios['selection'] = round(contrast(c['selection_foreground'], c['selection_background']), 2)
assert min(ratios.values()) >= 4.5, ratios
for source in json.loads((root / 'sources.json').read_text()):
    image = root / source['file']
    assert hashlib.sha256(image.read_bytes()).hexdigest() == source['sha256'], image
    dimensions = subprocess.check_output(['magick', 'identify', '-format', '%wx%h', str(image)], text=True)
    assert dimensions == source['dimensions'], dimensions
with tempfile.TemporaryDirectory(prefix='silo-validation-') as tmp:
    stage = pathlib.Path(tmp) / '.local/state/omarchy/current/next-theme'
    stage.mkdir(parents=True)
    (stage / 'colors.toml').write_text((root / 'colors.toml').read_text())
    subprocess.run(['omarchy-theme-set-templates'], env=dict(os.environ, HOME=tmp), check=True)
    outputs = list(stage.iterdir())
    for f in outputs:
        assert '{{' not in f.read_text(), f
        if f.suffix == '.toml':
            tomllib.loads(f.read_text())
    subprocess.run(['foot', '-C', '-c', str(stage / 'foot.ini')], check=True)
    report = {'contrast_ratios': ratios, 'generated_configs': len(outputs),
              'source_images': 6, 'hashes_dimensions_templates_and_foot': 'PASS'}
results = root / 'tests/results'
results.mkdir(exist_ok=True)
(results / 'validation.json').write_text(json.dumps(report, indent=2) + '\n')
print(json.dumps(report, indent=2))
