fx_version 'cerulean'
game 'gta5'

author 'NeoV'
description 'NeoV Loading Screen'
version '1.0.0'

loadscreen 'html/index.html'
loadscreen_manual_shutdown 'yes'

client_script 'client.lua'

files {
    'html/index.html',
    'html/css/style.css',
    'html/js/script.js',
    -- Bildmarke. Bewusst als exakter Pfad statt als Glob: faellt der Eintrag weg oder
    -- greift das Muster nicht, laedt der Screen ohne Logo und ohne sichtbaren Fehler.
    'html/img/logo.png',
}
