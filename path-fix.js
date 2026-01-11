// Fix per GitHub Pages - determina il base path corretto
(function() {
    // Funzione per ottenere il base path
    function getBasePath() {
        const path = window.location.pathname;
        // Se siamo su GitHub Pages (es: /DoYouRemember/ o /DoYouRemember/index.html)
        if (path.includes('/DoYouRemember/') || path.startsWith('/DoYouRemember')) {
            return '/DoYouRemember/';
        }
        // Altrimenti siamo in locale o nella root
        return '/';
    }
    
    // Applica il fix alle immagini
    function fixImagePaths() {
        const images = document.querySelectorAll('img[src^="images/"]');
        const basePath = getBasePath();
        
        images.forEach(img => {
            const originalSrc = img.getAttribute('src');
            
            // Se siamo su GitHub Pages, usa percorso assoluto
            if (basePath !== '/') {
                img.src = basePath + originalSrc;
            }
            
            // Fallback se l'immagine non si carica
            img.onerror = function() {
                if (!this.dataset.tried) {
                    this.dataset.tried = 'true';
                    // Prova con percorso relativo
                    if (basePath !== '/') {
                        this.src = originalSrc;
                    } else {
                        // Prova con percorso assoluto
                        this.src = '/' + originalSrc;
                    }
                }
            };
        });
    }
    
    // Esegui quando il DOM è pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', fixImagePaths);
    } else {
        fixImagePaths();
    }
})();
