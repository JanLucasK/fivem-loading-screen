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
    -- Logo: index.html laedt zuerst img/logo.png und faellt auf img/logo.svg zurueck.
    -- Beide muessen hier gelistet sein, sonst liefert der Client 404 und die Marke fehlt.
    'html/img/*.png',
    'html/img/*.svg',
}
