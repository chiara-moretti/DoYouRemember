// Fix per GitHub Pages - determina il base path corretto
(function() {
    // Funzione per ottenere il base path
    function getBasePath() {
        const path = window.location.pathname;
        const hostname = window.location.hostname;
        
        // Se siamo su GitHub Pages (github.io)
        if (hostname.includes('github.io')) {
            // Estrai il nome della repository dal path
            // Es: /DoYouRemember/ o /DoYouRemember/index.html -> /DoYouRemember/
            const pathParts = path.split('/').filter(p => p);
            if (pathParts.length > 0) {
                return '/' + pathParts[0] + '/';
            }
        }
        
        // Per localhost o altri domini, usa percorso relativo
        return '';
    }
    
    // Applica il fix alle immagini
    function fixImagePaths() {
        const images = document.querySelectorAll('img[src^="images/"]');
        const basePath = getBasePath();
        
        images.forEach(img => {
            const originalSrc = img.getAttribute('src');
            let newSrc = originalSrc;
            
            // Se abbiamo un basePath (GitHub Pages), aggiungilo
            if (basePath) {
                newSrc = basePath + originalSrc;
                img.src = newSrc;
            }
            
            // Fallback multipli se l'immagine non si carica
            let attempts = 0;
            img.onerror = function() {
                attempts++;
                const paths = [
                    originalSrc,                    // Percorso relativo originale
                    '/' + originalSrc,              // Percorso assoluto dalla root
                    basePath + originalSrc,         // Con basePath
                    './' + originalSrc,             // Percorso relativo esplicito
                    window.location.origin + '/' + originalSrc  // URL completo
                ];
                
                if (attempts <= paths.length) {
                    this.src = paths[attempts - 1];
                } else {
                    console.error('Impossibile caricare immagine:', originalSrc);
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
    
    // Esegui anche dopo che tutte le immagini sono caricate
    window.addEventListener('load', fixImagePaths);
})();
