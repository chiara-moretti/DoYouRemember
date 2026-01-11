# Do You Remember - Backend Setup

## Installazione

1. Installa Node.js (versione 14 o superiore) se non l'hai già fatto
   - Scarica da: https://nodejs.org/

2. Installa le dipendenze:
```bash
npm install
```

## Avvio del Server

Per avviare il server backend:

```bash
npm start
```

Oppure in modalità sviluppo (con auto-reload):

```bash
npm run dev
```

Il server sarà disponibile su: **http://localhost:3000**

## Struttura

- `server.js` - Server Express principale
- `data/users.json` - Database JSON degli utenti (creato automaticamente)
- `admin.html` - Pannello admin per visualizzare gli utenti registrati

## API Endpoints

### POST /api/register
Registra un nuovo utente

### POST /api/login
Login utente

### GET /api/users
Ottiene tutti gli utenti registrati (per admin)

### GET /api/users/:id
Ottiene un singolo utente

### POST /api/users/:id/files
Carica un file per un utente

### DELETE /api/users/:id/files/:fileId
Elimina un file di un utente

## Pannello Admin

Accedi al pannello admin su: **http://localhost:3000/admin.html**

Qui puoi vedere:
- Tutti gli utenti registrati
- Statistiche (utenti totali, file totali)
- Dettagli di ogni utente

## Note

- Il database viene salvato in `data/users.json`
- Le password sono salvate in chiaro (per produzione, usa bcrypt)
- Il server serve anche i file statici del sito
