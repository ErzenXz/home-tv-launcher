# Home — a tvOS-style launcher for any TV

> **Native app for Android TV / Google TV / Fire TV:** see [`../android/README.md`](../android/README.md).
> The ready-to-install file is [`../site/download/Home.apk`](../site/download/Home.apk). This page covers the web version (for any TV with a browser).

A fast, Apple TV–style home screen that runs in a browser. No framework and no build step:
plain HTML, CSS and JS, animated only with GPU transforms so it stays smooth on TV chips.

## Run it

```sh
./serve.sh
```

Open the printed `http://<your-mac-ip>:8080` address on the TV. Or deploy the folder to any
static host (Vercel, Netlify, GitHub Pages) to get an HTTPS link that also works offline.

## Remote controls

| Button | Action |
| --- | --- |
| Arrows | Move between apps |
| OK | Open app |
| Hold OK | Open, Move, Edit or Remove the app |
| Back | Jump to the first app, or close a panel |
| Menu / Blue (or `M`) | Settings |
| Red | Edit the focused app |
| Yellow | Add an app |
| Green | Start the screensaver |

A mouse or air mouse also works: hover to focus (with tilt and shine), click to open, right-click to edit.

## Settings

Wallpaper (follow the focused app, or a fixed theme), 12/24-hour clock, weather by city
(Open-Meteo, no key needed), screensaver delay, reduced motion, and **Glass Effects off**
for slower TVs.

Your layout and settings are saved in the browser on that device.

## Files

- `index.html`: page structure
- `styles.css`: look and animations, laid out on a 1920×1080 stage that scales to any screen
- `app.js`: apps, focus engine, remote input, settings, weather and screensaver
- `sw.js`: offline cache (works on HTTPS or localhost)
