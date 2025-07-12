#!/bin/bash

# Set these variables
VPS_USER="zoha"
VPS_HOST="145.223.79.90"
VPS_PORT="2222"
LOCAL_PROJECT_PATH="."
REMOTE_PATH="/home/zoha/citi-dashboard"

echo "🔁 Uploading project to VPS..."
scp -P $VPS_PORT -r "$LOCAL_PROJECT_PATH" "$VPS_USER@$VPS_HOST:$REMOTE_PATH"

echo "✅ Upload complete!"
echo "➡️  Next: SSH into VPS and apply Step 2"

