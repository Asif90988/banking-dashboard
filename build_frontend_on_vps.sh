#!/bin/bash

echo "🚀 Connecting to VPS to build frontend..."
echo "ℹ️  This will run 'npm install' and 'npm run build' in the frontend directory on your VPS."
read -p "➡️  Continue? (yes/no): " confirm

if [[ "$confirm" != "yes" ]]; then
  echo "❌ Operation cancelled."
  exit 1
fi

ssh zoha@145.223.79.90 << 'EOF'
  echo "📂 Moving to frontend directory..."
  cd ~/citi-dashboard/frontend || exit 1

  echo "📦 Installing dependencies..."
  npm install

  echo "🔧 Building frontend for production..."
  npm run build

  echo "✅ Frontend build completed."
EOF

