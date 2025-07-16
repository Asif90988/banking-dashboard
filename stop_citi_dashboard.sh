#!/bin/bash

# CITI Dashboard Stop Script
# This script stops the CITI Dashboard application cleanly

echo "🛑 CITI LATAM RegInsight Dashboard - Shutdown"
echo "============================================="

# Function to kill processes on a specific port
kill_port() {
    local port=$1
    echo "🔍 Checking for processes on port $port..."
    
    local pids=$(lsof -ti:$port 2>/dev/null || true)
    if [ ! -z "$pids" ]; then
        echo "🔪 Killing processes on port $port: $pids"
        echo "$pids" | xargs kill -TERM 2>/dev/null || true
        sleep 3
        
        # Force kill if still running
        local remaining=$(lsof -ti:$port 2>/dev/null || true)
        if [ ! -z "$remaining" ]; then
            echo "🔨 Force killing remaining processes: $remaining"
            echo "$remaining" | xargs kill -9 2>/dev/null || true
        fi
        echo "✅ Port $port is now free"
    else
        echo "✅ Port $port is already free"
    fi
}

# Function to stop using saved PIDs
stop_saved_processes() {
    if [ -f "logs/backend.pid" ]; then
        local backend_pid=$(cat logs/backend.pid)
        echo "🔪 Stopping backend process (PID: $backend_pid)..."
        kill -TERM $backend_pid 2>/dev/null || true
        sleep 2
        kill -9 $backend_pid 2>/dev/null || true
        rm -f logs/backend.pid
    fi
    
    if [ -f "logs/frontend.pid" ]; then
        local frontend_pid=$(cat logs/frontend.pid)
        echo "🔪 Stopping frontend process (PID: $frontend_pid)..."
        kill -TERM $frontend_pid 2>/dev/null || true
        sleep 2
        kill -9 $frontend_pid 2>/dev/null || true
        rm -f logs/frontend.pid
    fi
}

# Function to kill any remaining citi-dashboard processes
cleanup_processes() {
    echo "🧹 Cleaning up any remaining citi-dashboard processes..."
    
    # Kill any node processes running from this directory
    pkill -f "citi-dashboard" 2>/dev/null || true
    pkill -f "next dev" 2>/dev/null || true
    pkill -f "npm run dev" 2>/dev/null || true
    
    # Kill specific server processes
    pkill -f "backend/server.js" 2>/dev/null || true
    pkill -f "frontend/node_modules/.bin/next" 2>/dev/null || true
    
    sleep 1
    echo "✅ Process cleanup complete"
}

# Main execution
main() {
    echo "🛑 Stopping CITI Dashboard services..."
    
    # Stop using saved PIDs first
    stop_saved_processes
    
    # Kill processes on specific ports
    kill_port 3000
    kill_port 5050
    
    # Clean up any remaining processes
    cleanup_processes
    
    echo ""
    echo "✅ CITI Dashboard has been stopped successfully!"
    echo "🔍 Verifying ports are free..."
    
    # Verify ports are free
    if lsof -ti:3000 >/dev/null 2>&1; then
        echo "⚠️  Warning: Port 3000 may still be in use"
    else
        echo "✅ Port 3000 is free"
    fi
    
    if lsof -ti:5050 >/dev/null 2>&1; then
        echo "⚠️  Warning: Port 5050 may still be in use"
    else
        echo "✅ Port 5050 is free"
    fi
    
    echo ""
    echo "🚀 To start the dashboard again, run: ./start_citi_dashboard.sh"
}

# Run main function
main "$@"
