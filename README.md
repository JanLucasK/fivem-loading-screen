# fivem-loading-screen

Custom black & gold loading screen for the **NeoV** FiveM server. Replaces the
default resource-download screen with a branded screen that shows a live
progress bar while assets stream in.

## Installation

1. Copy this folder into your server's `resources` directory as `fivem-loading-screen`.
2. Add to `server.cfg`:
   ```
   ensure fivem-loading-screen
   ```
3. Make sure it starts before other resources (loadscreens don't depend on order,
   but keep it near the top of `server.cfg` for clarity).

## Structure

```
fivem-loading-screen/
├── fxmanifest.lua
└── html/
    ├── index.html
    ├── css/style.css
    ├── img/logo.png
    └── js/script.js
```

## Logo

`html/img/logo.png` is the original NeoV render, cropped to the mark and cut
out — the black backdrop of the source render was keyed out by luminance, so
the mark carries its own alpha and sits on the page background instead of on a
black box. 512×512, square.

The file has to be listed in the `files` table in
[fxmanifest.lua](fxmanifest.lua). Without that entry the client 404s and the
screen loads without a logo and without any visible error — worth checking
first if the mark ever goes missing.

- Size: `.logo-mark` in [html/css/style.css](html/css/style.css).
- The gold glow around it is a `drop-shadow()` filter on the same rule; it
  follows the alpha channel, so it hugs the silhouette rather than a box.

## Customization

- Language: all player-facing strings are German — the markup in
  [html/index.html](html/index.html) and the status texts in
  [html/js/script.js](html/js/script.js).
- Colors: edit the `--gold` / `--black` variables in [html/css/style.css](html/css/style.css).

## How it works

The screen listens for the loading-screen messages FiveM posts to the page:

- `beginMap` / `onScriptConnecting` / `onScriptConnected` — status text updates.
- `loadProgress` — drives the progress bar (`data.loadFraction`, 0–1).
- `shutdownLoadingScreen` — fired when the game is ready to hand off. Since
  `loadscreen_manual_shutdown` is enabled, the page fades out and then calls
  the `shutdownLoadingScreenNui` NUI callback itself, so the transition into
  the game is smooth instead of an abrupt cut.
