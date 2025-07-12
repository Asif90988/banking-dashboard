#!/bin/bash

echo "📡 Connecting to VPS and updating the project from GitHub..."
echo "ℹ️  This will pull the latest changes into the VPS and restart PM2."

read -p "➡️  Do you want to continue? (yes/no): " confirm
if [[ $confirm != "yes" ]]; then
  echo "❌ Operation cancelled."
  exit 1
fi

# VPS details – customize if needed
VPS_USER="zoha"
VPS_HOST="145.223.79.90"
VPS_PROJECT_DIR="/home/zoha/citi-dashboard"  # Update if using another directory
PM2_PROCESS_NAME="backend"                   # Or use a custom process name like "citi-dashboard-backend"

ssh ${VPS_USER}@${VPS_HOST} << EOF
  echo "📂 Navigating to project directory: $VPS_PROJECT_DIR"
  cd $VPS_PROJECT_DIR || { echo "❌ Directory not found!"; exit 1; }

  echo "🔄 Pulling latest changes from GitHub..."
  git pull origin main || { echo "❌ Git pull failed."; exit 1; }

  echo "🔁 Restarting backend with PM2..."
  pm2 restart $PM2_PROCESS_NAME || echo "⚠️ PM2 restart failed or process not found."

  echo "✅ VPS update completed successfully."
EOF

