#!/bin/bash
# 🚀 Installer le Telegram Bot comme service système (démarre au boot)

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SERVICE_FILE="/etc/systemd/system/telegram-commander.service"

echo "📦 Installation du service Telegram Commander..."

# Créer le service systemd
sudo tee "$SERVICE_FILE" > /dev/null << UNIT
[Unit]
Description=Telegram Commander Bot - Maison Deco
After=network.target
StartLimitIntervalSec=0

[Service]
Type=simple
Restart=always
RestartSec=10
User=$USER
WorkingDirectory=$ROOT
EnvironmentFile=$ROOT/n8n/.env
ExecStart=$(which node) $ROOT/scripts/telegram-commander.mjs
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
UNIT

# Activer et démarrer
sudo systemctl daemon-reload
sudo systemctl enable telegram-commander
sudo systemctl start telegram-commander

echo ""
echo "✅ Service installé et démarré !"
echo ""
echo "Commandes utiles :"
echo "  sudo systemctl status telegram-commander"
echo "  sudo journalctl -u telegram-commander -f"
echo "  sudo systemctl restart telegram-commander"
echo "  sudo systemctl stop telegram-commander"
