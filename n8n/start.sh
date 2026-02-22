#!/bin/bash
# Script de démarrage n8n - Maison Déco Affiliation

echo "🚀 Démarrage de n8n..."
echo "📍 Interface : http://localhost:5678"
echo "👤 Login : admin / change_me_123"
echo ""
echo "Pour arrêter : CTRL+C"
echo "---"

# Charger les variables d'environnement
export $(grep -v '^#' /home/user/maison-deco-affiliation/n8n/.env | xargs)

# Lancer n8n
n8n start
