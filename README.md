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

## Mechanical companion

An optional local app with a three-stage generator-balancing puzzle, 15/25/45/60-minute focus shifts, a handover notebook, and quiet machinery ambience (off by default).

![Mechanical duty console](preview/mechanical.jpg)

After installing the theme, install the companion separately:

```bash
python3 ~/.config/omarchy/themes/silo/companion/install.py
```

Open **Silo Mechanical** from your application launcher. Run the same command after a theme update to update the companion. Requires Python 3, a systemd user session, and Omarchy’s supported web-app browser.

The app runs offline at `http://127.0.0.1:48118/`. Its service starts when launched, with no login autostart. Timer state, note drafts, and handovers stay in that browser’s local storage; **Export notes** saves a backup. Clearing browser data removes these records. The timer catches up after closing or suspending the app; it does not deliver background notifications. The inspection puzzle restarts when reloaded. All instruments are fictional.

To stop the local service:

```bash
systemctl --user stop silo-mechanical.service
```

## Wallpaper previews

![All twenty-three Silo wallpapers](preview/collection.jpg)

See [wallpaper credits](WALLPAPERS.md) for sources and resolution details. This unofficial fan theme grants no rights to the show's imagery.
