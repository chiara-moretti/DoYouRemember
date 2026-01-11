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

// Formatta la data di nascita
function formatBirthdate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
    });
}

// Carica i dati del profilo
function loadProfile() {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    if (user.name) {
        document.getElementById('profileName').textContent = user.name;
        document.getElementById('profileEmail').textContent = user.email;
        document.getElementById('profileBirthdate').textContent = formatBirthdate(user.birthdate);
        document.getElementById('profileBio').textContent = user.bio || 'Nessuna biografia inserita';
        
        // Avatar iniziale con iniziale
        const avatar = document.getElementById('profileAvatar');
        if (avatar) {
            avatar.textContent = user.name.charAt(0).toUpperCase();
        }
    }
}

// Carica tutti gli utenti dal localStorage
function getAllUsers() {
    const usersJson = localStorage.getItem('allUsers');
    return usersJson ? JSON.parse(usersJson) : [];
}

// Salva tutti gli utenti nel localStorage
function saveAllUsers(users) {
    localStorage.setItem('allUsers', JSON.stringify(users));
}

// Registrazione nuovo utente
function handleRegistration(e) {
    e.preventDefault();
    
    const submitButton = e.target.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    
    submitButton.textContent = 'Registrazione in corso...';
    submitButton.disabled = true;
    
    const formData = {
        name: document.getElementById('reg-name').value.trim(),
        email: document.getElementById('reg-email').value.trim().toLowerCase(),
        password: document.getElementById('reg-password').value,
        birthdate: document.getElementById('reg-birthdate').value,
        bio: document.getElementById('reg-bio').value.trim() || ''
    };
    
    try {
        // Validazione
        if (!formData.name || formData.name.length < 2) {
            throw new Error('Il nome deve contenere almeno 2 caratteri');
        }
        
        if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            throw new Error('Inserisci un indirizzo email valido');
        }
        
        if (!formData.password || formData.password.length < 6) {
            throw new Error('La password deve contenere almeno 6 caratteri');
        }
        
        if (!formData.birthdate) {
            throw new Error('Inserisci la data di nascita');
        }
        
        // Controlla se l'email esiste già
        const allUsers = getAllUsers();
        const emailExists = allUsers.some(user => user.email === formData.email);
        
        if (emailExists) {
            throw new Error('Un utente con questa email esiste già');
        }
        
        // Crea nuovo utente
        const newUser = {
            id: Date.now().toString(),
            name: formData.name,
            email: formData.email,
            password: formData.password, // In produzione, usa bcrypt per hashare la password
            birthdate: formData.birthdate,
            bio: formData.bio,
            createdAt: new Date().toISOString()
        };
        
        // Salva l'utente nella lista
        allUsers.push(newUser);
        saveAllUsers(allUsers);
        
        // Salva l'utente corrente nel localStorage
        const userForSession = {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            birthdate: newUser.birthdate,
            bio: newUser.bio
        };
        localStorage.setItem('currentUser', JSON.stringify(userForSession));
        localStorage.setItem('userId', newUser.id);
        
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
    } catch (error) {
        console.error('Errore:', error);
        if (typeof showNotification === 'function') {
            showNotification(`Errore: ${error.message}`, 'error');
        } else {
            alert(`Errore: ${error.message}`);
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
// LOGOUT
// ============================================

function handleLogout() {
    if (confirm('Sei sicuro di voler fare logout?')) {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('userId');
        
        if (typeof showNotification === 'function') {
            showNotification('Logout effettuato con successo', 'success');
        }
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 500);
    }
}

// ============================================
// MODIFICA PROFILO
// ============================================

function showEditProfileForm() {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const editForm = document.getElementById('editProfileForm');
    const profileInfo = document.getElementById('profileInfo');
    
    if (!editForm || !user.email) return;
    
    // Popola il form con i dati attuali
    document.getElementById('edit-name').value = user.name || '';
    document.getElementById('edit-email').value = user.email || '';
    document.getElementById('edit-birthdate').value = user.birthdate || '';
    document.getElementById('edit-bio').value = user.bio || '';
    document.getElementById('edit-password').value = '';
    
    // Mostra il form e nascondi le info
    editForm.classList.add('active');
    profileInfo.style.display = 'none';
}

function hideEditProfileForm() {
    const editForm = document.getElementById('editProfileForm');
    const profileInfo = document.getElementById('profileInfo');
    
    if (!editForm) return;
    
    editForm.classList.remove('active');
    profileInfo.style.display = 'block';
}

function handleEditProfile(e) {
    e.preventDefault();
    
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (!user.email) {
        alert('Errore: utente non trovato');
        return;
    }
    
    const formData = {
        name: document.getElementById('edit-name').value.trim(),
        email: document.getElementById('edit-email').value.trim().toLowerCase(),
        birthdate: document.getElementById('edit-birthdate').value,
        bio: document.getElementById('edit-bio').value.trim() || '',
        password: document.getElementById('edit-password').value
    };
    
    try {
        // Validazione
        if (!formData.name || formData.name.length < 2) {
            throw new Error('Il nome deve contenere almeno 2 caratteri');
        }
        
        if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            throw new Error('Inserisci un indirizzo email valido');
        }
        
        if (formData.password && formData.password.length > 0 && formData.password.length < 6) {
            throw new Error('La password deve contenere almeno 6 caratteri');
        }
        
        if (!formData.birthdate) {
            throw new Error('Inserisci la data di nascita');
        }
        
        // Controlla se l'email è cambiata e se esiste già (solo se diversa dalla propria)
        const allUsers = getAllUsers();
        if (formData.email !== user.email) {
            const emailExists = allUsers.some(u => u.email === formData.email && u.id !== user.id);
            if (emailExists) {
                throw new Error('Un utente con questa email esiste già');
            }
        }
        
        // Aggiorna l'utente nella lista
        const userIndex = allUsers.findIndex(u => u.id === user.id);
        if (userIndex === -1) {
            throw new Error('Utente non trovato');
        }
        
        // Aggiorna i dati dell'utente
        allUsers[userIndex].name = formData.name;
        allUsers[userIndex].email = formData.email;
        allUsers[userIndex].birthdate = formData.birthdate;
        allUsers[userIndex].bio = formData.bio;
        if (formData.password && formData.password.length > 0) {
            allUsers[userIndex].password = formData.password;
        }
        
        // Salva la lista aggiornata
        saveAllUsers(allUsers);
        
        // Aggiorna l'utente corrente nel localStorage
        const updatedUser = {
            id: user.id,
            name: formData.name,
            email: formData.email,
            birthdate: formData.birthdate,
            bio: formData.bio
        };
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        
        // Ricarica il profilo
        loadProfile();
        hideEditProfileForm();
        
        // Mostra notifica di successo
        if (typeof showNotification === 'function') {
            showNotification('Profilo aggiornato con successo!', 'success');
        } else {
            alert('Profilo aggiornato con successo!');
        }
    } catch (error) {
        console.error('Errore:', error);
        if (typeof showNotification === 'function') {
            showNotification(`Errore: ${error.message}`, 'error');
        } else {
            alert(`Errore: ${error.message}`);
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
        
        // Setup logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', handleLogout);
        }
        
        // Setup edit profile button
        const editProfileBtn = document.getElementById('editProfileBtn');
        if (editProfileBtn) {
            editProfileBtn.addEventListener('click', showEditProfileForm);
        }
        
        // Setup cancel edit button
        const cancelEditBtn = document.getElementById('cancelEditBtn');
        if (cancelEditBtn) {
            cancelEditBtn.addEventListener('click', hideEditProfileForm);
        }
        
        // Setup edit profile form
        const editProfileFormElement = document.getElementById('editProfileFormElement');
        if (editProfileFormElement) {
            editProfileFormElement.addEventListener('submit', handleEditProfile);
        }
        
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
