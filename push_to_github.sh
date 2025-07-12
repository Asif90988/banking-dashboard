#!/bin/bash

# Set your commit message
read -p "Enter commit message: " msg

echo "📦 Staging all files..."
git add .

echo "📝 Committing..."
git commit -m "$msg"

echo "🚀 Pushing to GitHub..."
git push origin main

echo "✅ Done: Your latest code is now on GitHub."

