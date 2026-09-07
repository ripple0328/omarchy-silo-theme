# Silo for Omarchy

A dark Omarchy theme inspired by **Silo**: charcoal concrete, aged brass, faded olive, and industrial teal.

![Silo theme running on Omarchy](preview/desktop-review.jpg)

## Install

Requires Omarchy and Python 3. The installer downloads six high-resolution wallpapers from Apple TV Press, verifies their checksums, and applies the theme.

```bash
git clone https://github.com/ripple0328/omarchy-silo-theme.git ~/Projects/Personal/omarchy-silo-theme
cd ~/Projects/Personal/omarchy-silo-theme
./install.sh
```

Keep the cloned folder: the installed theme links to its `theme/` directory.
Use the commands above rather than `omarchy theme install`, because this repo includes a wallpaper downloader.

## Use

```bash
omarchy theme set silo       # Apply the theme
omarchy theme bg next        # Next scene
```

Switch back with `omarchy theme set <previous-theme>`.

## Palette and wallpapers

| Background | Text | Brass | Olive | Teal |
|---|---|---|---|---|
| `#151b19` | `#d6cfbc` | `#c4a36a` | `#a6b28a` | `#86b5a7` |

Six original scene photos range from 3840 pixels wide to **8002×5337**. The default is **6072×4050**. Omarchy crops images to fit your screen; files are not pre-upscaled.

Colors follow the show's green-orange industrial lighting, described in [British Cinematographer's Silo interviews](https://britishcinematographer.co.uk/baz-irvine-bsc-isc-ollie-downey-bsc-kate-reid-bsc-ed-moore-bsc-silo/), with brighter text for readability.

Photos and screenshot imagery are credited to **Apple TV / the respective rights holders**. Original wallpapers download from [Apple TV Press](https://www.apple.com/tv-pr/originals/silo/episodes-images/) and are not bundled in Git. See [sources.json](sources.json) for captions, URLs, dimensions, and checksums. This unofficial fan theme grants no rights to the show's imagery.

## Tested

Tested locally on Omarchy **4.0.2-1** at **6144×3456**: live wallpaper, shell, terminal, and borders; no Hyprland config errors. Primary text contrast: **11.23:1**.

```bash
python3 tests/validate.py
```

Validation requires downloaded wallpapers, Omarchy, ImageMagick, and Foot. It checks image integrity, contrast, generated configs, and terminal configuration.

On the test machine, browser tinting was blocked by a local `pkexec` permissions error; desktop theming worked.
