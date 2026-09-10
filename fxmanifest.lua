fx_version 'cerulean'
game 'gta5'

author 'NEO V'
description 'NEO V cinematic loading screen'
version '2.0.0'

loadscreen 'html/index.html'
loadscreen_manual_shutdown 'yes'
loadscreen_cursor 'yes'

client_script 'client.lua'

files {
    'html/index.html',
    'assets/neologokompakt.png',
    'html/css/*.css',
    'html/js/*.js',
    'html/fonts/*.woff2',
    'html/media/*',
    'html/media/**/*'
}
