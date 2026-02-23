#!/bin/bash
# 🤖 Démarrer le Telegram Commander Bot

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$ROOT/n8n/.env"

# Charger les variables d'environnement
if [ -f "$ENV_FILE" ]; then
  export $(grep -v '^#' "$ENV_FILE" | xargs)
  echo "✅ Variables .env chargées"
fi

echo "🤖 Démarrage du Telegram Commander..."
echo "   Bot: @issamtradingbot"
echo "   Site: https://maison-deco-issam.netlify.app"
echo ""

cd "$ROOT"
node scripts/telegram-commander.mjs
