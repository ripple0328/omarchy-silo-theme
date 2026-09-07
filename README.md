# Silo for Omarchy

Charcoal concrete, aged brass, faded olive, and industrial teal — with architecture, empty sets, and character scenes from **Silo**.

![Silo theme](preview/desktop-review.jpg)

## Install

```bash
omarchy theme install https://github.com/ripple0328/omarchy-silo-theme
```

## Use

```bash
omarchy theme set silo
omarchy theme bg next
```

Twenty-three wallpapers, including **ten new production images**: five concept paintings at 6000–7680 pixels wide and five empty-set photographs around 4K. Abandoned Shaft is the default. Original character photography reaches **8002×5337**. The older 1080p set-tour frames remain available for variety.

## The Cleaning

One cloth, thirty seconds of air. Hold and drag to wipe the camera lens so the people inside can see the world outside.

The outside view revealed beneath the dust — original AI-generated environment artwork, not a still from the show:

![The landscape revealed by cleaning](companion/outside.jpg)

### Launch and play

After installing the theme, run:

```bash
python3 ~/.config/omarchy/themes/silo/companion/launch.py
```

Or run `python3 companion/launch.py` from a clone of this repository. Requires Python 3 and a Chromium-based browser; on Omarchy it uses the normal web-app launcher. No extra packages, server, service, or system configuration are needed.

The launcher builds one self-contained HTML file and opens it in an app window. It makes no network connections.

- Select **Begin cleaning**, then hold and drag across the lens. Air starts with the first wipe.
- Clear the lens before thirty seconds run out. Select **Again** to replay.
- **Pause** or **P** pauses the round; switching away also pauses it.
- Keyboard: focus the lens, hold **Space**, and move the cloth with the **arrow keys**.
- Sound is optional and off by default.
- Select **Exit**, or close the window. No game server or service remains running.

Some ordinary browser tabs prevent pages from closing themselves. In that case Exit stops the game and shows a signed-off screen; close that tab normally.

### Optional application shortcut

To add **Silo: The Cleaning** to your application launcher:

```bash
python3 ~/.config/omarchy/themes/silo/companion/install.py
```

This copies the game into your local application directory and adds a desktop shortcut. It does not create services or change system configuration. The direct launch command above requires no installation.

### Update

```bash
omarchy theme install https://github.com/ripple0328/omarchy-silo-theme
```

Launch again to play the updated game. If you added the optional shortcut, rerun its installer after updating the theme.

This replaces the former Mechanical dashboard. It does not read or delete that dashboard’s browser-stored notes.

## Wallpaper previews

![All twenty-three Silo wallpapers](preview/collection.jpg)

See [wallpaper credits](WALLPAPERS.md) for sources and resolution details. This unofficial fan theme grants no rights to the show's imagery.
