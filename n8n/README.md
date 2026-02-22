# n8n Automatisation - Maison Déco Affiliation

## Démarrage rapide

```bash
# Lancer n8n
./start.sh

# Ouvrir dans le navigateur
http://localhost:5678
```

## Configuration

1. Copier `.env.example` en `.env`
2. Remplir les clés API (OpenAI, Telegram, GitHub)
3. Lancer n8n et importer les workflows

## Workflows disponibles

| # | Fichier | Description | Fréquence |
|---|---|---|---|
| 01 | `01-generer-articles-seo.json` | Génère un article SEO via ChatGPT et le publie sur GitHub | Quotidien |
| 02 | `02-alertes-clics-affilies.json` | Reçoit les clics affiliés et alerte sur Telegram | Temps réel |
| 03 | `03-rapport-seo-hebdo.json` | Rapport SEO hebdomadaire sur Telegram | Lundi 9h |

## Importer un workflow dans n8n

1. Aller sur `http://localhost:5678`
2. Menu → Workflows → Import from file
3. Sélectionner le fichier `.json` du dossier `workflows/`

## Clés API nécessaires

### OpenAI (ChatGPT)
- https://platform.openai.com/api-keys
- Modèle recommandé : `gpt-4o-mini` (moins cher)

### Telegram Bot
1. Parler à @BotFather sur Telegram
2. `/newbot` → donner un nom
3. Récupérer le token
4. Récupérer ton Chat ID via @userinfobot

### GitHub Token
- https://github.com/settings/tokens
- Droits nécessaires : `repo` (lecture/écriture)

## Déploiement sur VPS Hostinger

```bash
# Sur le VPS
npm install -g n8n
mkdir ~/n8n && cd ~/n8n
# Copier le .env et les workflows
# Lancer avec PM2 pour la persistance
npm install -g pm2
pm2 start "n8n start" --name n8n
pm2 save
pm2 startup
```
