#!/bin/bash
echo "🔧 Fixing API endpoints to use correct IP address..."

# Replace localhost with 192.168.4.25 in all component files
find frontend/components -name "*.tsx" -exec sed -i '' 's/localhost:5050/192.168.4.25:5050/g' {} +

echo "✅ All API endpoints updated to use 192.168.4.25:5050"
echo "🔄 Refresh your browser to see the changes!"
