// ============================================
// GESTIONE PROFILO UTENTE
// ============================================

// Controlla se l'utente è loggato
function checkAuth() {
    const user = localStorage.getItem('currentUser');
    if (!user && window.location.pathname.includes('profilo.html')) {
        window.location.href = 'registrati.html';
        return false;
    }
    return true;
}

// Carica i dati del profilo
function loadProfile() {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    if (user.name) {
        document.getElementById('profileName').textContent = user.name;
        document.getElementById('profileEmail').textContent = user.email;
        document.getElementById('profileBirthdate').textContent = user.birthdate || '-';
        document.getElementById('profileBio').textContent = user.bio || 'Nessuna biografia inserita';
        
        // Avatar iniziale con iniziale
        const avatar = document.getElementById('profileAvatar');
        if (avatar) {
            avatar.textContent = user.name.charAt(0).toUpperCase();
        }
    }
}

// URL del backend API
const API_URL = 'http://localhost:3000/api';

// Registrazione nuovo utente
async function handleRegistration(e) {
    e.preventDefault();
    
    const submitButton = e.target.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    
    submitButton.textContent = 'Registrazione in corso...';
    submitButton.disabled = true;
    
    const formData = {
        name: document.getElementById('reg-name').value,
        email: document.getElementById('reg-email').value,
        password: document.getElementById('reg-password').value,
        birthdate: document.getElementById('reg-birthdate').value,
        bio: document.getElementById('reg-bio').value || ''
    };
    
    try {
        // Invia i dati al backend
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Salva anche nel localStorage per compatibilità
            localStorage.setItem('currentUser', JSON.stringify(data.user));
            localStorage.setItem('userId', data.user.id);
            
            // Mostra notifica di successo
            if (typeof showNotification === 'function') {
                showNotification('Profilo creato con successo!', 'success');
            } else {
                alert('Profilo creato con successo!');
            }
            
            // Reindirizza al profilo
            setTimeout(() => {
                window.location.href = 'profilo.html';
            }, 1000);
        } else {
            throw new Error(data.message || 'Errore nella registrazione');
        }
    } catch (error) {
        console.error('Errore:', error);
        if (typeof showNotification === 'function') {
            showNotification(`Errore: ${error.message}. Assicurati che il server sia avviato.`, 'error');
        } else {
            alert(`Errore: ${error.message}\n\nAssicurati che il server backend sia avviato su http://localhost:3000`);
        }
        submitButton.textContent = originalText;
        submitButton.disabled = false;
    }
}

// ============================================
// GESTIONE CARICAMENTO FILE
// ============================================

let uploadedFiles = [];

// Carica i file salvati
function loadFiles() {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (user.email) {
        const savedFiles = JSON.parse(localStorage.getItem(`files_${user.email}`) || '[]');
        uploadedFiles = savedFiles;
        displayFiles();
    }
}

// Salva i file nel localStorage
function saveFiles() {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (user.email) {
        localStorage.setItem(`files_${user.email}`, JSON.stringify(uploadedFiles));
    }
}

// Visualizza i file caricati
function displayFiles() {
    const filesGrid = document.getElementById('filesGrid');
    const emptyState = document.getElementById('emptyState');
    
    if (!filesGrid || !emptyState) return;
    
    if (uploadedFiles.length === 0) {
        filesGrid.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    filesGrid.style.display = 'grid';
    filesGrid.innerHTML = '';
    
    uploadedFiles.forEach((file, index) => {
        const fileCard = createFileCard(file, index);
        filesGrid.appendChild(fileCard);
    });
}

// Crea una card per il file
function createFileCard(file, index) {
    const card = document.createElement('div');
    card.className = 'file-card';
    
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    
    let preview = '';
    if (isImage) {
        preview = `<img src="${file.data}" alt="${file.name}" class="file-preview">`;
    } else if (isVideo) {
        preview = `<video src="${file.data}" class="file-preview" controls></video>`;
    } else {
        preview = `<div class="file-icon">📄</div>`;
    }
    
    card.innerHTML = `
        <button class="delete-file" onclick="deleteFile(${index})" title="Elimina file">×</button>
        ${preview}
        <div class="file-name">${file.name}</div>
        <div class="file-size">${formatFileSize(file.size)}</div>
        <div class="file-date">${formatDate(file.date)}</div>
    `;
    
    return card;
}

// Elimina un file
function deleteFile(index) {
    if (confirm('Sei sicuro di voler eliminare questo file?')) {
        uploadedFiles.splice(index, 1);
        saveFiles();
        displayFiles();
        
        if (typeof showNotification === 'function') {
            showNotification('File eliminato con successo', 'success');
        }
    }
}

// Formatta la dimensione del file
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Formatta la data
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
    });
}

// Gestisce il caricamento dei file
function handleFileUpload(files) {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (!user.email) {
        alert('Devi essere loggato per caricare file');
        return;
    }
    
    Array.from(files).forEach(file => {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const fileData = {
                name: file.name,
                type: file.type,
                size: file.size,
                data: e.target.result,
                date: new Date().toISOString()
            };
            
            uploadedFiles.push(fileData);
            saveFiles();
            displayFiles();
        };
        
        // Legge il file come data URL
        if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
            reader.readAsDataURL(file);
        } else {
            // Per altri file, mostra solo le informazioni
            const fileData = {
                name: file.name,
                type: file.type,
                size: file.size,
                data: null,
                date: new Date().toISOString()
            };
            uploadedFiles.push(fileData);
            saveFiles();
            displayFiles();
        }
    });
    
    if (typeof showNotification === 'function') {
        showNotification(`${files.length} file caricato/i con successo!`, 'success');
    }
}

// Aggiorna la navbar con link al profilo se loggato
function updateNavbar() {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const navMenu = document.querySelector('.nav-menu');
    
    if (user.email && navMenu) {
        // Controlla se il link profilo esiste già
        const existingProfileLink = navMenu.querySelector('a[href="profilo.html"]');
        if (!existingProfileLink) {
            const profileLi = document.createElement('li');
            profileLi.innerHTML = '<a href="profilo.html">Il Mio Profilo</a>';
            navMenu.appendChild(profileLi);
        }
    }
}

// ============================================
// INIZIALIZZAZIONE
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // Aggiorna navbar se necessario
    updateNavbar();
    
    // Gestione registrazione
    const registrationForm = document.getElementById('registrationForm');
    if (registrationForm) {
        registrationForm.addEventListener('submit', handleRegistration);
    }
    
    // Carica profilo se siamo nella pagina profilo
    if (document.getElementById('profileName')) {
        checkAuth();
        loadProfile();
        loadFiles();
        
        // Setup upload area
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('fileInput');
        
        if (uploadArea && fileInput) {
            // Click per aprire file picker
            uploadArea.addEventListener('click', () => {
                fileInput.click();
            });
            
            // Drag and drop
            uploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadArea.classList.add('dragover');
            });
            
            uploadArea.addEventListener('dragleave', () => {
                uploadArea.classList.remove('dragover');
            });
            
            uploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadArea.classList.remove('dragover');
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    handleFileUpload(files);
                }
            });
            
            // File input change
            fileInput.addEventListener('change', (e) => {
                if (e.target.files.length > 0) {
                    handleFileUpload(e.target.files);
                    e.target.value = ''; // Reset input
                }
            });
        }
    }
});
