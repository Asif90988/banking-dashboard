#!/bin/bash

echo "🚀 Syncing Local Changes to GitHub and VPS Server..."
echo "📂 Working directory: $(pwd)"

# Confirm sync operation
read -p "❓ Are you sure you want to COMMIT → PUSH → DEPLOY to VPS? (yes/no): " CONFIRM
if [[ "$CONFIRM" != "yes" ]]; then
    echo "❌ Aborted."
    exit 1
fi

# Stage all changes
echo "📦 Staging all modified/untracked files..."
git add .

# Ask for commit message
read -p "📝 Enter commit message: " COMMIT_MSG

# Commit changes
git commit -m "$COMMIT_MSG"

# Push to GitHub
echo "⬆️  Pushing changes to GitHub..."
git push origin main

# Pull and deploy on VPS
echo "🌐 Connecting to VPS and pulling latest code..."
ssh zoha@145.223.79.90 'bash -s' <<'ENDSSH'
  echo "📥 Pulling latest from GitHub on VPS..."
  cd ~/citi-dashboard

  # Stash any local changes to avoid merge conflict
  git stash
  git pull origin main
  git stash pop || true

  echo "🔧 Installing dependencies and building Next.js app..."
  cd frontend
  npm install
  npm run build
  cd ..

  echo "🔁 Restarting PM2 services..."
  pm2 restart all
ENDSSH

echo "✅ Sync complete. Local and VPS are now up to date!"

