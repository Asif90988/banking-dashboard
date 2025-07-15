#!/bin/bash

echo "🏦 Restarting Citi Banking Application ONLY..."
echo "============================================="

# Stop only banking-related processes (leave supreme untouched)
echo "🛑 Stopping existing banking services..."
pm2 stop citi-frontend citi-backend 2>/dev/null || true
pm2 delete citi-frontend citi-backend 2>/dev/null || true

# Kill any processes on banking ports only (3050, 5050)
echo "🔌 Freeing up banking ports (3050, 5050)..."
fuser -k 3050/tcp 2>/dev/null || true
fuser -k 5050/tcp 2>/dev/null || true

# Wait for ports to be free
sleep 3

# Start only banking services using our ecosystem.config.js
echo "🚀 Starting banking services..."
pm2 start ecosystem.config.js

# Show status of ALL PM2 processes (supreme should still be running)
echo ""
echo "📊 All PM2 Services Status:"
pm2 status

echo ""
echo "🔗 Banking Application URLs:"
echo "   Frontend: http://localhost:3050"
echo "   Backend:  http://localhost:5050"
echo "   Public:   https://banking.scnfinc.com"

echo ""
echo "✅ Banking application restart complete!"
echo "📝 Supreme application should still be running above"
