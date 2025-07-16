#!/bin/bash

# CITI Dashboard Isolated Startup Script
# This script ensures ONLY this application runs on ports 3000 and 5050

set -e

echo "🏦 CITI LATAM RegInsight Dashboard - Isolated Startup"
echo "=================================================="

# Function to kill processes on a specific port
kill_port() {
    local port=$1
    echo "🔍 Checking for processes on port $port..."
    
    # Find and kill processes using the port
    local pids=$(lsof -ti:$port 2>/dev/null || true)
    if [ ! -z "$pids" ]; then
        echo "⚠️  Found processes on port $port: $pids"
        echo "🔪 Killing processes on port $port..."
        echo "$pids" | xargs kill -9 2>/dev/null || true
        sleep 2
        
        # Double check
        local remaining=$(lsof -ti:$port 2>/dev/null || true)
        if [ ! -z "$remaining" ]; then
            echo "❌ Failed to kill some processes on port $port: $remaining"
            echo "$remaining" | xargs kill -9 2>/dev/null || true
            sleep 1
        fi
        echo "✅ Port $port is now free"
    else
        echo "✅ Port $port is already free"
    fi
}

# Function to kill any node processes related to this project
kill_project_processes() {
    echo "🔍 Killing any existing citi-dashboard processes..."
    
    # Kill any node processes running from this directory
    pkill -f "citi-dashboard" 2>/dev/null || true
    pkill -f "next dev" 2>/dev/null || true
    pkill -f "npm run dev" 2>/dev/null || true
    
    # Kill specific server processes
    pkill -f "backend/server.js" 2>/dev/null || true
    pkill -f "frontend/node_modules/.bin/next" 2>/dev/null || true
    
    sleep 2
    echo "✅ Cleaned up existing processes"
}

# Function to check if we're in the right directory
check_directory() {
    if [ ! -f "backend/server.js" ] || [ ! -f "frontend/package.json" ]; then
        echo "❌ Error: This script must be run from the citi-dashboard root directory"
        echo "   Current directory: $(pwd)"
        echo "   Expected files: backend/server.js, frontend/package.json"
        exit 1
    fi
    echo "✅ Running from correct directory: $(pwd)"
}

# Function to check dependencies
check_dependencies() {
    echo "🔍 Checking dependencies..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        echo "❌ Node.js is not installed"
        exit 1
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        echo "❌ npm is not installed"
        exit 1
    fi
    
    echo "✅ Node.js version: $(node --version)"
    echo "✅ npm version: $(npm --version)"
}

# Function to install dependencies if needed
install_dependencies() {
    echo "📦 Checking and installing dependencies..."
    
    # Backend dependencies
    if [ ! -d "backend/node_modules" ]; then
        echo "📦 Installing backend dependencies..."
        cd backend && npm install && cd ..
    fi
    
    # Frontend dependencies
    if [ ! -d "frontend/node_modules" ]; then
        echo "📦 Installing frontend dependencies..."
        cd frontend && npm install && cd ..
    fi
    
    echo "✅ Dependencies are ready"
}

# Function to start backend server
start_backend() {
    echo "🚀 Starting backend server on port 5050..."
    cd backend
    
    # Ensure the server starts on port 5050
    export PORT=5050
    nohup node server.js > ../logs/backend.log 2>&1 &
    BACKEND_PID=$!
    
    cd ..
    
    # Wait for backend to start
    echo "⏳ Waiting for backend to start..."
    for i in {1..30}; do
        if curl -s http://localhost:5050 >/dev/null 2>&1; then
            echo "✅ Backend server is running on port 5050 (PID: $BACKEND_PID)"
            return 0
        fi
        sleep 1
    done
    
    echo "❌ Backend failed to start within 30 seconds"
    return 1
}

# Function to start frontend server
start_frontend() {
    echo "🚀 Starting frontend server on port 3000..."
    cd frontend
    
    # Force port 3000
    nohup npm run dev > ../logs/frontend.log 2>&1 &
    FRONTEND_PID=$!
    
    cd ..
    
    # Wait for frontend to start
    echo "⏳ Waiting for frontend to start..."
    for i in {1..60}; do
        if curl -s http://localhost:3000 >/dev/null 2>&1; then
            echo "✅ Frontend server is running on port 3000 (PID: $FRONTEND_PID)"
            return 0
        fi
        sleep 1
    done
    
    echo "❌ Frontend failed to start within 60 seconds"
    return 1
}

# Function to create logs directory
setup_logs() {
    mkdir -p logs
    echo "📁 Logs directory ready"
}

# Function to display final status
show_status() {
    echo ""
    echo "🎉 CITI Dashboard is now running!"
    echo "================================"
    echo "🌐 Frontend: http://localhost:3000"
    echo "🔧 Backend:  http://localhost:5050"
    echo ""
    echo "📊 Application Status:"
    echo "  - Frontend PID: $FRONTEND_PID"
    echo "  - Backend PID:  $BACKEND_PID"
    echo ""
    echo "📝 Logs:"
    echo "  - Backend:  logs/backend.log"
    echo "  - Frontend: logs/frontend.log"
    echo ""
    echo "🛑 To stop the application:"
    echo "  kill $FRONTEND_PID $BACKEND_PID"
    echo "  or run: ./stop_citi_dashboard.sh"
    echo ""
    echo "✅ Startup complete!"
}

# Main execution
main() {
    check_directory
    check_dependencies
    setup_logs
    
    echo "🧹 Cleaning up ports and processes..."
    kill_project_processes
    kill_port 3000
    kill_port 5050
    
    echo "📦 Setting up dependencies..."
    install_dependencies
    
    echo "🚀 Starting services..."
    if start_backend && start_frontend; then
        show_status
        
        # Save PIDs for stop script
        echo "$BACKEND_PID" > logs/backend.pid
        echo "$FRONTEND_PID" > logs/frontend.pid
        
        # Keep script running to monitor
        echo "🔍 Monitoring services... (Press Ctrl+C to stop)"
        trap 'echo "🛑 Shutting down..."; kill $FRONTEND_PID $BACKEND_PID 2>/dev/null; exit 0' INT
        
        while true; do
            sleep 10
            # Check if processes are still running
            if ! kill -0 $BACKEND_PID 2>/dev/null; then
                echo "❌ Backend process died!"
                break
            fi
            if ! kill -0 $FRONTEND_PID 2>/dev/null; then
                echo "❌ Frontend process died!"
                break
            fi
        done
    else
        echo "❌ Failed to start services"
        exit 1
    fi
}

# Run main function
main "$@"
