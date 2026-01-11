const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('.')); // Serve i file statici

// Percorso del file database
const DB_PATH = path.join(__dirname, 'data', 'users.json');

// Assicurati che la cartella data esista
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Inizializza il database se non esiste
if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify([], null, 2));
}

// Funzione per leggere gli utenti
function readUsers() {
    try {
        const data = fs.readFileSync(DB_PATH, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Errore nella lettura del database:', error);
        return [];
    }
}

// Funzione per salvare gli utenti
function saveUsers(users) {
    try {
        fs.writeFileSync(DB_PATH, JSON.stringify(users, null, 2));
        return true;
    } catch (error) {
        console.error('Errore nel salvataggio del database:', error);
        return false;
    }
}

// API Routes

// Registrazione nuovo utente
app.post('/api/register', (req, res) => {
    const { name, email, password, birthdate, bio } = req.body;
    
    // Validazione
    if (!name || !email || !password || !birthdate) {
        return res.status(400).json({ 
            success: false, 
            message: 'Tutti i campi obbligatori devono essere compilati' 
        });
    }
    
    // Validazione email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ 
            success: false, 
            message: 'Email non valida' 
        });
    }
    
    const users = readUsers();
    
    // Controlla se l'email esiste già
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
        return res.status(400).json({ 
            success: false, 
            message: 'Un utente con questa email esiste già' 
        });
    }
    
    // Crea nuovo utente
    const newUser = {
        id: Date.now().toString(),
        name,
        email,
        password: password, // In produzione, usa bcrypt per hashare la password
        birthdate,
        bio: bio || '',
        createdAt: new Date().toISOString(),
        files: []
    };
    
    users.push(newUser);
    
    if (saveUsers(users)) {
        res.json({ 
            success: true, 
            message: 'Registrazione completata con successo',
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                birthdate: newUser.birthdate,
                bio: newUser.bio
            }
        });
    } else {
        res.status(500).json({ 
            success: false, 
            message: 'Errore nel salvataggio dei dati' 
        });
    }
});

// Login utente
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ 
            success: false, 
            message: 'Email e password sono obbligatori' 
        });
    }
    
    const users = readUsers();
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        res.json({ 
            success: true, 
            message: 'Login effettuato con successo',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                birthdate: user.birthdate,
                bio: user.bio
            }
        });
    } else {
        res.status(401).json({ 
            success: false, 
            message: 'Email o password non corretti' 
        });
    }
});

// Ottieni tutti gli utenti (per admin)
app.get('/api/users', (req, res) => {
    const users = readUsers();
    
    // Rimuovi le password dalla risposta
    const usersWithoutPasswords = users.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        birthdate: user.birthdate,
        bio: user.bio,
        createdAt: user.createdAt,
        filesCount: user.files ? user.files.length : 0
    }));
    
    res.json({ 
        success: true, 
        users: usersWithoutPasswords,
        total: usersWithoutPasswords.length
    });
});

// Ottieni un singolo utente
app.get('/api/users/:id', (req, res) => {
    const users = readUsers();
    const user = users.find(u => u.id === req.params.id);
    
    if (user) {
        res.json({ 
            success: true, 
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                birthdate: user.birthdate,
                bio: user.bio,
                createdAt: user.createdAt,
                filesCount: user.files ? user.files.length : 0
            }
        });
    } else {
        res.status(404).json({ 
            success: false, 
            message: 'Utente non trovato' 
        });
    }
});

// Salva file per un utente
app.post('/api/users/:id/files', (req, res) => {
    const { fileName, fileType, fileSize, fileData } = req.body;
    
    if (!fileName || !fileType || !fileSize) {
        return res.status(400).json({ 
            success: false, 
            message: 'Dati file mancanti' 
        });
    }
    
    const users = readUsers();
    const userIndex = users.findIndex(u => u.id === req.params.id);
    
    if (userIndex === -1) {
        return res.status(404).json({ 
            success: false, 
            message: 'Utente non trovato' 
        });
    }
    
    if (!users[userIndex].files) {
        users[userIndex].files = [];
    }
    
    const newFile = {
        id: Date.now().toString(),
        name: fileName,
        type: fileType,
        size: fileSize,
        data: fileData,
        uploadedAt: new Date().toISOString()
    };
    
    users[userIndex].files.push(newFile);
    
    if (saveUsers(users)) {
        res.json({ 
            success: true, 
            message: 'File caricato con successo',
            file: newFile
        });
    } else {
        res.status(500).json({ 
            success: false, 
            message: 'Errore nel salvataggio del file' 
        });
    }
});

// Elimina file di un utente
app.delete('/api/users/:id/files/:fileId', (req, res) => {
    const users = readUsers();
    const userIndex = users.findIndex(u => u.id === req.params.id);
    
    if (userIndex === -1) {
        return res.status(404).json({ 
            success: false, 
            message: 'Utente non trovato' 
        });
    }
    
    if (!users[userIndex].files) {
        return res.status(404).json({ 
            success: false, 
            message: 'Nessun file trovato' 
        });
    }
    
    const fileIndex = users[userIndex].files.findIndex(f => f.id === req.params.fileId);
    
    if (fileIndex === -1) {
        return res.status(404).json({ 
            success: false, 
            message: 'File non trovato' 
        });
    }
    
    users[userIndex].files.splice(fileIndex, 1);
    
    if (saveUsers(users)) {
        res.json({ 
            success: true, 
            message: 'File eliminato con successo' 
        });
    } else {
        res.status(500).json({ 
            success: false, 
            message: 'Errore nell\'eliminazione del file' 
        });
    }
});

// Avvia il server
app.listen(PORT, () => {
    console.log(`🚀 Server avviato su http://localhost:${PORT}`);
    console.log(`📊 Database: ${DB_PATH}`);
    console.log(`👥 Admin panel: http://localhost:${PORT}/admin.html`);
});
