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
    ├── img/logo.svg
    └── js/script.js
```

## Logo

The screen loads `html/img/logo.png` first and falls back to the vector
`html/img/logo.svg` when that file is absent, so the mark is never missing.

To use the original render, drop the file in as `html/img/logo.png` — no code
change needed, it is already covered by the `files` table in
[fxmanifest.lua](fxmanifest.lua). Recommended: square PNG with transparency,
around 512×512 px.

## Customization

- Language: all player-facing strings are German — the markup in
  [html/index.html](html/index.html) and the status texts in
  [html/js/script.js](html/js/script.js).
- Colors: edit the `--gold` / `--black` variables in [html/css/style.css](html/css/style.css).
- Server name: edit the `.wordmark` markup in [html/index.html](html/index.html).
- Logo size: `.logo-mark` in [html/css/style.css](html/css/style.css).

## How it works

The screen listens for the loading-screen messages FiveM posts to the page:

- `beginMap` / `onScriptConnecting` / `onScriptConnected` — status text updates.
- `loadProgress` — drives the progress bar (`data.loadFraction`, 0–1).
- `shutdownLoadingScreen` — fired when the game is ready to hand off. Since
  `loadscreen_manual_shutdown` is enabled, the page fades out and then calls
  the `shutdownLoadingScreenNui` NUI callback itself, so the transition into
  the game is smooth instead of an abrupt cut.
