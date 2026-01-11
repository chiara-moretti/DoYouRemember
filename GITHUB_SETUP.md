# Setup GitHub Repository

## Passo 1: Crea il repository su GitHub

1. Vai su https://github.com
2. Clicca sul pulsante "+" in alto a destra
3. Seleziona "New repository"
4. Nome del repository: **DoYouRemember**
5. Scegli se renderlo pubblico o privato
6. **NON** inizializzare con README, .gitignore o licenza (abbiamo già tutto)
7. Clicca "Create repository"

## Passo 2: Collega il repository locale a GitHub

Il repository locale è già stato inizializzato e configurato. Ora devi solo fare il push:

```bash
cd "/Users/chiara_moretti/Library/Mobile Documents/com~apple~CloudDocs/POLIMI/A.A. 25-26/Metaprogetto/SITO"
git push -u origin main
```

Se GitHub ti chiede l'autenticazione, usa:
- **Personal Access Token** (non la password)
- Oppure configura SSH keys

## Alternativa: Usa GitHub CLI

Se hai GitHub CLI installato:

```bash
gh repo create DoYouRemember --public --source=. --remote=origin --push
```

## Verifica

Dopo il push, il tuo codice sarà disponibile su:
**https://github.com/chiara_moretti/DoYouRemember**
