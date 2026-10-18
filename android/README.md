# Home for Android TV, Google TV and Fire TV

A native home screen modelled closely on Apple TV (tvOS). It lists every app installed on the
device and opens the real apps (Netflix, YouTube, Disney+ and the rest), not websites.

**Home screen**
- Full-screen **Top Shelf** photography behind the top row, slowly drifting (Ken Burns), with a
  title, description and page dots for the focused app; pages turn by themselves every 9 seconds
- Press **Up** from the top row to expand the Top Shelf: the icons slide away and **Open** / **•••**
  buttons appear; **Left/Right** turn pages
- tvOS icon grid: 5 per row, the focused icon lifts with a deep shadow, a glass rim and a glare,
  and leans toward the direction you came from before settling
- Scrolling into the grid blurs the photo behind it, like tvOS
- Soft click sounds as focus moves, and a "bonk" at the edges

**Controls**

| Remote | Does |
| --- | --- |
| Arrows | Move |
| OK | Open |
| Hold OK | Edit mode: the icon wiggles, arrows move it, OK when done |
| ≡ Menu / ⏯ Play-Pause | Action sheet: Open, Move, Hide, App Info, Delete |
| Up (from the expanded Top Shelf) | Control Center: clock, Aerials, Wi-Fi, Display, Sound, Bluetooth, weather, settings |
| Back | Jump to the first app / close |
| Home (while home) | Jump back to the start |

**Also:** a tvOS-style Settings screen (Top Shelf photos or colours, screensaver delay, clock,
weather, click sounds, reduce motion, hidden apps, reset) and an **Aerial** screensaver: full-screen
photos drifting and cross-fading, with the place name shown, like Apple's Aerials.

APK size about 4.7 MB; runs on Android 7+ (Fire OS 6/7/8, Android TV, Google TV).

## 1. Get the APK onto the device

The ready-built file is [`site/download/Home.apk`](../site/download/Home.apk), also downloadable from the website.

**Easiest, with ADB from this Mac** (enable *Developer options → USB/Network debugging* on the TV first):

```sh
adb connect <tv-ip-address>
adb install -r Home.apk
```

**Without a computer:** install the free *Downloader* app on the TV, host `Home.apk` somewhere
(Google Drive, or `python3 -m http.server` in this folder) and open the link in Downloader.
Allow "Install unknown apps" for Downloader when asked.

## 2. Make it your home screen

### Android TV and Google TV (tested on the Android TV emulator)

Some TVs show a chooser when you press **Home**: pick *Home → Always* and you're done.

Most Google-made builds don't, and their own home screen always wins the Home button.
Switch it off. This is reversible, and Home takes over the Home button and power-on:

```sh
adb shell cmd role add-role-holder android.app.role.HOME dev.erzen.home 0
adb shell pm disable-user --user 0 com.google.android.tvlauncher            # Android TV
adb shell pm disable-user --user 0 com.google.android.apps.tv.launcherx     # Google TV
```

(Run whichever line matches your device; the other prints an error and does nothing.)

**To undo** and get the original home screen back:

```sh
adb shell pm enable com.google.android.tvlauncher
adb shell pm enable com.google.android.apps.tv.launcherx
```

### Fire TV

| Device | How |
| --- | --- |
| Fire OS 7/8 (Fire TV Stick 4K / 4K Max / Lite, Cube) | Install the free open-source **Home on Fire** app and pick *Home*. It sends the Home button to Home and opens it at boot, no root needed. |
| **Fire TV Stick 4K Select** (Vega OS) | Not possible: Vega OS only installs apps from Amazon's store. |

You can always open Home like any other app from the device's app list too.

## Build it yourself

```sh
cd android
./gradlew assembleRelease     # → app/build/outputs/apk/release/app-release.apk
```

Uses Kotlin + Jetpack Compose. Source is in `app/src/main/java/dev/erzen/home/`:

- `Apps.kt`: finds installed apps, loads banners/icons and their colours, saved layout
- `HomeState.kt`: remote-control handling, focus, menus, settings
- `Home.kt`: Top Shelf, icon grid and focus effects
- `Panels.kt`: action sheet, Control Center, Settings, Aerial screensaver, drawn icons
- `Catalog.kt`: Top Shelf pages for well-known apps · `Photos.kt`: photo loading and blur · `Sound.kt`: click sounds
- `Weather.kt`: Open-Meteo weather (no API key)

## Credits

- Photos from [Unsplash](https://unsplash.com) (Unsplash License), IDs:
  1506905925346-21bda4d32df4, 1501785888041-af3ef285b470, 1470071459604-3b5ec3a7fe05,
  1500530855697-b586d89ba3ee, 1519681393784-d120267933ba, 1475924156734-496f6cac6ec1,
  1504608524841-42fe6f032b4b, 1505144808419-1957a94ca61e, 1531366936337-7c912a4589a7,
  1446776811953-b23d57bd21aa, 1451187580459-43490279c0fa, 1514565131-fce0801e5785,
  1493246507139-91e8fad9978e, 1508739773434-c26b3d09e071, 1500964757637-c85e8a162699,
  1470770841072-f978cf4d019e, 1494500764479-0c8f2919a3d8, 1491466424936-e304919aada7
- [Inter](https://rsms.me/inter/) typeface by Rasmus Andersson (SIL Open Font License)
- Not affiliated with Apple. Apple TV and tvOS are trademarks of Apple Inc.
