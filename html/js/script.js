const progressFill = document.getElementById('progress-fill');
const progressLabel = document.getElementById('progress-label');
const statusText = document.getElementById('status-text');

function setProgress(fraction) {
    const percent = Math.max(0, Math.min(100, Math.round(fraction * 100)));
    progressFill.style.width = percent + '%';
    progressLabel.textContent = percent + '%';
}

window.addEventListener('message', (event) => {
    const data = event.data;

    switch (data.eventName) {
        case 'beginMap':
            statusText.textContent = 'Loading ' + (data.data || 'world') + '...';
            break;

        case 'loadProgress':
            setProgress(data.loadFraction);
            break;

        case 'onScriptConnecting':
            statusText.textContent = 'Connecting...';
            break;

        case 'onScriptConnected':
            statusText.textContent = 'Connected';
            break;

        // Fired when the loading screen is allowed to close.
        // Because loadscreen_manual_shutdown is enabled, we control the timing
        // so we can fade out smoothly before handing control to the game.
        case 'shutdownLoadingScreen':
            setProgress(1);
            statusText.textContent = 'Ready';

            document.body.classList.add('fade-out');
            setTimeout(() => {
                fetch('https://loadingScreen/shutdownLoadingScreenNui', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json; charset=UTF-8' },
                    body: '{}'
                });
            }, 600);
            break;
    }
});
