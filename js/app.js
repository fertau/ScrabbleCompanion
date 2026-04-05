document.addEventListener('DOMContentLoaded', async function () {
    try {
        await Dictionary.load();
        UI.hideLoading();
        UI.init();
        UI.updateWordCount();
    } catch (err) {
        document.getElementById('loading-overlay').innerHTML =
            '<div class="loading-content">' +
            '<p>Error al cargar el diccionario</p>' +
            '<p class="loading-sub">' + err.message + '</p>' +
            '</div>';
    }

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js').catch(function (err) {
            console.warn('Service Worker registration failed:', err);
        });
    }
});
