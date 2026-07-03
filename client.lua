-- loadscreen_manual_shutdown 'yes' (fxmanifest.lua) haelt den nativen Ladebildschirm
-- offen, bis ein Client-Skript ShutdownLoadingScreen() aufruft - die HTML-Seite kann
-- also erst per script.js ausfaden, bevor hier tatsaechlich an das Spiel uebergeben wird.
-- Ohne diesen Aufruf bleibt der Spieler nach dem Spawn auf einem schwarzen Bild haengen.
local hasShutdown = false

local function shutdownLoadingScreen()
    if hasShutdown then return end
    hasShutdown = true

    ShutdownLoadingScreen()
    ShutdownLoadingScreenNui()

    -- ShutdownLoadingScreen() beendet nur den internen Ladezustand, es faded den
    -- Bildschirm NICHT wieder ein. Der Screen wurde beim Verbinden auf schwarz gefaded
    -- (DoScreenFadeOut) - ohne diesen expliziten Fade-In bleibt die Spielwelt dauerhaft
    -- schwarz, waehrend NUI-HUDs (die vom Screen-Fade unabhaengig sind) normal weiterlaufen.
    if IsScreenFadedOut() then
        DoScreenFadeIn(500)
    end
end

-- script.js versucht diesen Callback per fetch() ueber GetParentResourceName() zu
-- erreichen. Das haengt aber davon ab, dass dieser Binding im Loadscreen-Frame verfuegbar
-- ist und der Name mit dem tatsaechlichen Ressourcen-Ordner uebereinstimmt - schlaegt das
-- fehl, kommt hier nichts an und es gibt keinen Fehler, den man sehen wuerde.
RegisterNUICallback('shutdownLoadingScreenNui', function(_, cb)
    shutdownLoadingScreen()
    cb({})
end)

-- Die Ladebildschirm-HTML wartet auf ein 'shutdownLoadingScreen' postMessage-Event,
-- bevor sie ausfadet und den obigen Callback ausloest. FiveM schickt dieses Event aber
-- nie von selbst - es muss per SendLoadingScreenMessage() aktiv an die NUI geschickt
-- werden, sobald der Spieler wirklich im Spiel aktiv ist.
CreateThread(function()
    while not NetworkIsPlayerActive(PlayerId()) do
        Wait(0)
    end

    SendLoadingScreenMessage(json.encode({ eventName = 'shutdownLoadingScreen' }))

    -- Fallback, falls der obige NUI-Callback nie ankommt (siehe Kommentar dort): nach der
    -- Fade-Out-Animation (600ms in script.js) trotzdem direkt aufraeumen, statt dauerhaft
    -- auf einem schwarzen Bildschirm haengen zu bleiben.
    Wait(1000)
    shutdownLoadingScreen()
end)
