#!/bin/bash
# Test de connexion Telegram Bot - Maison Déco Affiliation
# Usage: ./test-telegram.sh

source /home/user/maison-deco-affiliation/n8n/.env

if [ "$TELEGRAM_BOT_TOKEN" = "COLLE_TON_TOKEN_ICI" ]; then
  echo "❌ Token non configuré !"
  echo ""
  echo "1. Ouvre Telegram → @BotFather"
  echo "2. Envoie /mybots"
  echo "3. Sélectionne @issamtradingbot"
  echo "4. Clique API Token → copie-le"
  echo "5. Colle-le dans n8n/.env à la ligne TELEGRAM_BOT_TOKEN"
  exit 1
fi

if [ "$TELEGRAM_CHAT_ID" = "COLLE_TON_CHAT_ID_ICI" ]; then
  echo "❌ Chat ID non configuré !"
  echo ""
  echo "1. Ouvre Telegram → @userinfobot"
  echo "2. Envoie /start"
  echo "3. Copie ton Id (nombre)"
  echo "4. Colle-le dans n8n/.env à la ligne TELEGRAM_CHAT_ID"
  exit 1
fi

echo "🔄 Test du bot @issamtradingbot..."
echo ""

# Test envoi message
RESPONSE=$(curl -s "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
  -d "chat_id=${TELEGRAM_CHAT_ID}" \
  -d "parse_mode=Markdown" \
  -d "text=🏠 *Maison Déco Affiliation*%0A%0A✅ Bot Telegram connecté avec succès !%0A🤖 n8n est prêt à envoyer des alertes.%0A%0A_Test automatique_")

# Vérifier résultat
OK=$(echo "$RESPONSE" | grep -o '"ok":true')

if [ -n "$OK" ]; then
  echo "✅ Message envoyé ! Vérifie ton Telegram."
  echo ""
  echo "Le bot est prêt. Tu peux maintenant :"
  echo "  1. Lancer n8n : ./start.sh"
  echo "  2. Importer les workflows"
  echo "  3. Recevoir tes alertes affiliés en temps réel"
else
  echo "❌ Erreur d'envoi :"
  echo "$RESPONSE"
  echo ""
  echo "Vérifie ton token et chat ID dans n8n/.env"
fi
