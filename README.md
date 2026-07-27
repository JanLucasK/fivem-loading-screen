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
├── assets/logo.png       # Quelle, wird nicht ausgeliefert
└── html/
    ├── index.html        # enthaelt das Logo als data:-URI
    ├── css/style.css
    └── js/script.js
```

## Logo

Die Marke ist als `data:image/png;base64,…` direkt in das `<img class="logo-mark">`
in [html/index.html](html/index.html) eingebettet — **bewusst keine eigene Datei.**

Als eigene Datei kam sie nie beim Client an. Sie lag korrekt unter `html/img/`,
war lesbar, stand in der `files`-Tabelle und die Resource war neu gestartet —
der Server hat die Bytes trotzdem nicht in `cache/files/…/resource.rpf` gepackt
(Paket blieb 20 KB, null PNG-Signaturen darin, nur der Dateiname). Im Spiel gab
das ein Broken-Image ohne jede Fehlermeldung, server- wie clientseitig.
Eingebettet gibt es keine Datei mehr, die fehlen kann, und keinen
`files`-Eintrag, der falsch sein kann.

`assets/logo.png` ist die Quelle (384×384, freigestellt — der schwarze
Hintergrund des Original-Renders wurde per Luminanz ausgekeyt, das Logo bringt
sein eigenes Alpha mit). Sie steht bewusst ausserhalb von `html/` und wird
nicht ausgeliefert.

Nach dem Austausch neu einbetten:

```
node -e "const fs=require('fs');const b='data:image/png;base64,'+fs.readFileSync('assets/logo.png').toString('base64');const f='html/index.html';fs.writeFileSync(f,fs.readFileSync(f,'utf8').replace(/src=\"data:image\/png;base64,[^\"]*\"/,'src=\"'+b+'\"'))"
```

- Größe: `.logo-mark` in [html/css/style.css](html/css/style.css).
- Der Goldschein ist ein `drop-shadow()` auf derselben Regel; er folgt dem
  Alphakanal und legt sich damit um die Silhouette statt um einen Kasten.

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
