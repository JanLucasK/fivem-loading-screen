-- loadscreen_manual_shutdown 'yes' (fxmanifest.lua) haelt den nativen Ladebildschirm
-- offen, bis ein Client-Skript ShutdownLoadingScreen() aufruft - die HTML-Seite kann
-- also erst per script.js ausfaden, bevor hier tatsaechlich an das Spiel uebergeben wird.
-- Ohne diesen Callback bleibt der Spieler nach dem Spawn auf einem schwarzen Bild haengen.
RegisterNUICallback('shutdownLoadingScreenNui', function(_, cb)
    ShutdownLoadingScreen()
    ShutdownLoadingScreenNui()
    cb({})
end)
