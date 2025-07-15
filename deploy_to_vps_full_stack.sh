#!/bin/bash

echo "🚀 Starting FULL DEPLOYMENT to VPS (Golden Copy from GitHub)..."

read -p "➡️  This will pull from GitHub, rebuild the frontend, and restart services on the VPS. Continue? (yes/no): " confirm
if [[ $confirm != "yes" ]]; then
  echo "❌ Aborted."
  exit 1
fi

VPS_USER="zoha"
VPS_IP="145.223.79.90"
VPS_DIR="/home/zoha/citi-dashboard"

ssh ${VPS_USER}@${VPS_IP} <<EOF
  echo "📂 Switching to project directory: ${VPS_DIR}"
  cd ${VPS_DIR}

  echo "🧳 Stashing local changes if any..."
  git stash save "Auto-stash before pulling updates"

  echo "🔄 Pulling latest from GitHub..."
  git pull origin main

  echo "🏗️  Building Next.js frontend (production)..."
  cd frontend
  npm install
  npm run build
  cd ..

  echo "🔁 Restarting PM2 services..."
  pm2 restart all

  echo "✅ Deployment complete."
EOF

