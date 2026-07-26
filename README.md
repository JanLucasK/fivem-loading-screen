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
    └── js/script.js
```

## Logo

The NeoV mark is an inline `<svg class="logo-mark">` inside
[html/index.html](html/index.html) — deliberately not an external image file.
An external file would first have to be served through the `files` table, and
that is exactly where the mark fails silently (404, no visible error). Inline,
it is part of the document and cannot go missing.

It is drawn as two copies of the same silhouette: one offset behind it in near
black for the extruded depth, one in front with the brass gradient.

- Size: `.logo-mark` in [html/css/style.css](html/css/style.css).
- Colors: the `neovGold` / `neovDepth` gradient stops in the SVG.

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
