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

Or run `python3 companion/launch.py` from a clone of this repository. Omarchy already includes Python 3 through its `uwsm` dependency and provides the web-app browser launcher. On Omarchy, no extra packages, server, service, or system configuration are needed. Other Linux distributions need Python 3 and a Chromium-based browser.

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

This is how the **Silo: The Cleaning** entry appears in the application menu: the installer copies the game to `~/.local/share/silo-cleaning/` and writes `~/.local/share/applications/silo-cleaning.desktop`. Selecting that entry runs the local launcher and opens a browser app window. It is a shortcut, not a separate native application.

It does not create services or change system configuration. The direct launch command above requires no installation.

### Update

```bash
omarchy theme install https://github.com/ripple0328/omarchy-silo-theme
```

Launch again to play the updated game. If you added the optional shortcut, rerun its installer after updating the theme.

This replaces the former Mechanical dashboard. It does not read or delete that dashboard’s browser-stored notes.

## Wallpaper previews

![All twenty-three Silo wallpapers](preview/collection.jpg)

See [wallpaper credits](WALLPAPERS.md) for sources and resolution details. This unofficial fan theme grants no rights to the show's imagery.
