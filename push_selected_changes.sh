#!/bin/bash

# =========================================
# Script: push_selected_changes.sh
# Purpose: Detect & push only changed files to GitHub
# =========================================

# Function to display header
function show_header() {
  echo "\n============================================="
  echo "🚀 GIT PUSH SCRIPT: PUSH CHANGED FILES ONLY"
  echo "Target Repo: $(git remote get-url origin)"
  echo "Current Branch: $(git branch --show-current)"
  echo "Working Directory: $(pwd)"
  echo "=============================================\n"
}

# Check for Git repository
if [ ! -d .git ]; then
  echo "❌ Not a git repository. Please run this in a valid git repo."
  exit 1
fi

show_header

echo "🔍 Checking for file changes...\n"
git status -s

# Check if there are any changes
if [[ -z $(git status -s) ]]; then
  echo "✅ No changes to commit. Working directory clean."
  exit 0
fi

# Add only modified or new files
changed_files=$(git status -s | awk '{print $2}')
git add $changed_files

echo "\n📝 Please enter a commit message:"
read commit_msg

git commit -m "$commit_msg"
git push origin $(git branch --show-current)

echo "\n✅ Changes pushed successfully.\n"

