// Fix per GitHub Pages - determina il base path corretto
(function() {
    // Ottieni il percorso base della repository
    const path = window.location.pathname;
    const pathParts = path.split('/').filter(p => p);
    
    // Se siamo su GitHub Pages (path contiene il nome della repo)
    if (pathParts.length > 0 && pathParts[0] !== '') {
        // Trova il base path (es: /DoYouRemember/)
        const repoName = pathParts[0];
        const basePath = '/' + repoName + '/';
        
        // Crea un tag base se non esiste già
        if (!document.querySelector('base')) {
            const base = document.createElement('base');
            base.href = basePath;
            document.head.insertBefore(base, document.head.firstChild);
        }
    }
    
    // Fix per le immagini con percorsi relativi
    document.addEventListener('DOMContentLoaded', function() {
        const images = document.querySelectorAll('img[src^="images/"]');
        images.forEach(img => {
            const originalSrc = img.getAttribute('src');
            // Se l'immagine non si carica, prova con percorso assoluto
            img.onerror = function() {
                if (!this.dataset.tried) {
                    this.dataset.tried = 'true';
                    const basePath = window.location.pathname.split('/').slice(0, -1).join('/') || '';
                    this.src = basePath + '/' + originalSrc;
                }
            };
        });
    });
})();
