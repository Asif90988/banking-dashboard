#!/bin/bash

echo "🚀 Starting GOLDEN COPY upload to GitHub..."
echo "📂 Working directory: $(pwd)"

# Confirm Git status
git status
echo ""
read -p "Are you sure you want to PUSH ALL CHANGES as a GOLDEN COPY to GitHub? (yes/no): " confirm

if [[ "$confirm" != "yes" ]]; then
  echo "❌ Operation aborted."
  exit 1
fi

# Add all changes
git add .

# Ask for commit message
read -p "📝 Enter a commit message for this golden copy: " message
git commit -m "$message"

# Push to GitHub
echo "🔁 Pushing changes to GitHub..."
git push origin main

if [[ $? -eq 0 ]]; then
  echo "✅ GOLDEN COPY pushed successfully!"
else
  echo "❌ Failed to push to GitHub."
fi

