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
    -- Kein Logo-Eintrag: die Marke steckt als data:-URI in index.html. Als eigene Datei
    -- hat der Server sie nicht ins resource.rpf gepackt, obwohl sie hier gelistet war.
}
