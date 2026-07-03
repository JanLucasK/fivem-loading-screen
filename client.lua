-- loadscreen_manual_shutdown 'yes' (fxmanifest.lua) haelt den nativen Ladebildschirm
-- offen, bis ein Client-Skript ShutdownLoadingScreen() aufruft - die HTML-Seite kann
-- also erst per script.js ausfaden, bevor hier tatsaechlich an das Spiel uebergeben wird.
-- Ohne diesen Callback bleibt der Spieler nach dem Spawn auf einem schwarzen Bild haengen.
RegisterNUICallback('shutdownLoadingScreenNui', function(_, cb)
    ShutdownLoadingScreen()
    ShutdownLoadingScreenNui()
    cb({})
end)

-- Die Ladebildschirm-HTML wartet auf ein 'shutdownLoadingScreen' postMessage-Event,
-- bevor sie ausfadet und obigen Callback ausloest. FiveM schickt dieses Event aber nie
-- von selbst - es muss per SendLoadingScreenMessage() aktiv an die NUI geschickt werden,
-- sobald der Spieler wirklich im Spiel aktiv ist. Ohne diesen Trigger wartet script.js
-- fuer immer und der Spieler bleibt nach dem Verbinden auf schwarzem Bild haengen.
CreateThread(function()
    while not NetworkIsPlayerActive(PlayerId()) do
        Wait(0)
    end

    SendLoadingScreenMessage(json.encode({ eventName = 'shutdownLoadingScreen' }))
end)
