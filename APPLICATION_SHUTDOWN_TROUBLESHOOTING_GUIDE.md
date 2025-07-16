# 🛠️ Application Shutdown Troubleshooting Guide

## 🚨 Problem Overview

**Issue**: When shutting down one application, other applications experience issues and vice versa.

**Root Causes Identified**:
1. **Port Conflicts**: Multiple services competing for the same ports
2. **Shared Resources**: Database connections, WebSocket connections, and Kafka streams not properly cleaned up
3. **Improper Shutdown Handling**: Applications not gracefully terminating dependent services
4. **Process Dependencies**: Frontend depends on backend, streaming system depends on both
5. **Signal Handling**: Inadequate SIGTERM/SIGINT handling causing forced kills

---

## ✅ **SOLUTION IMPLEMENTED**

### 🔧 **New Improved Startup System**

We've created several solutions to address these issues:

#### **1. Improved Application Manager** (`improved_startup_system.js`)
- **Graceful Shutdown**: Proper SIGTERM/SIGINT handling with timeouts
- **Port Management**: Automatically detects and cleans up port conflicts
- **Process Coordination**: Starts services in correct order with health checks
- **Resource Cleanup**: Properly closes database, WebSocket, and Kafka connections

#### **2. Enhanced Backend Server** (`backend/server.js`)
- **Improved Shutdown Logic**: Comprehensive cleanup of all resources
- **Timeout Protection**: Force exit after 15 seconds if shutdown hangs
- **Database Connection Management**: Proper pool cleanup
- **Streaming System Integration**: Coordinated shutdown of streaming services

#### **3. Better Streaming System** (`backend/streaming_main.js`)
- **Standalone vs Integrated**: Proper signal handling based on execution mode
- **Resource Cleanup**: Kafka disconnection and data streaming termination
- **Timeout Handling**: Prevents hanging during shutdown

#### **4. Improved PM2 Script** (`improved_pm2_restart.sh`)
- **Smart Port Cleanup**: Graceful SIGTERM followed by SIGKILL if needed
- **Health Checks**: Verifies services are actually running before proceeding
- **Dependency Management**: Ensures backend is healthy before starting frontend
- **Error Handling**: Comprehensive error checking and reporting

---

## 🚀 **How to Use the New System**

### **Option 1: Use the Improved PM2 Script (Recommended)**
```bash
./improved_pm2_restart.sh
```

**What it does**:
- ✅ Safely kills processes on ports 3000, 5050, 3001, 1234
- ✅ Cleans up existing PM2 processes gracefully
- ✅ Checks system requirements and dependencies
- ✅ Starts backend first, waits for health check
- ✅ Starts frontend after backend is confirmed healthy
- ✅ Shows comprehensive status and logs

### **Option 2: Use the Application Manager**
```bash
node improved_startup_system.js
```

**What it does**:
- ✅ Direct process management without PM2
- ✅ Real-time log streaming
- ✅ Comprehensive shutdown handling
- ✅ Health monitoring and status reporting

### **Option 3: Manual Cleanup (Emergency)**
```bash
# Kill all processes on relevant ports
lsof -ti :3000 | xargs kill -TERM
lsof -ti :5050 | xargs kill -TERM  
lsof -ti :3002 | xargs kill -TERM

# Clean up PM2
pm2 delete all

# Wait a moment
sleep 2

# Start fresh
./improved_pm2_restart.sh
```

---

## 🔍 **Troubleshooting Common Issues**

### **Issue 1: "Port Already in Use" Errors**

**Symptoms**:
```
Error: listen EADDRINUSE: address already in use :::3000
Error: listen EADDRINUSE: address already in use :::5050
```

**Solution**:
```bash
# Use the improved script which handles this automatically
./improved_pm2_restart.sh

# Or manually clean up
lsof -ti :3000 | xargs kill -TERM
lsof -ti :5050 | xargs kill -TERM
sleep 2
```

### **Issue 2: Applications Don't Shut Down Gracefully**

**Symptoms**:
- Processes hang when trying to stop
- Database connections remain open
- WebSocket connections not closed

**Solution**:
The new backend server includes improved shutdown handling:
```javascript
// Now includes proper cleanup of:
// - Database connections (pool.end())
// - WebSocket connections (io.close())
// - Streaming system (kafkaService.disconnect())
// - Timeout protection (15-second force exit)
```

### **Issue 3: Frontend Starts Before Backend is Ready**

**Symptoms**:
- Frontend shows connection errors
- API calls fail on startup
- WebSocket connections fail

**Solution**:
The improved PM2 script now includes health checks:
```bash
# Waits for backend health check before starting frontend
for i in {1..10}; do
    if curl -s http://localhost:5050/api/health >/dev/null 2>&1; then
        backend_health=true
        break
    fi
    sleep 2
done
```

### **Issue 4: Streaming System Conflicts**

**Symptoms**:
- Kafka connection errors
- Streaming data not flowing
- Port 3001 conflicts

**Solution**:
Enhanced streaming system with proper integration:
```javascript
// Only sets up signal handlers if running standalone
if (require.main === module) {
    process.on('SIGTERM', () => shutdownStreaming('SIGTERM'));
    process.on('SIGINT', () => shutdownStreaming('SIGINT'));
}
```

### **Issue 5: PM2 Process Conflicts**

**Symptoms**:
- PM2 shows processes as "errored"
- Multiple instances of same service
- Restart loops

**Solution**:
```bash
# Clean slate approach
pm2 kill          # Nuclear option - kills PM2 daemon
pm2 start ecosystem.config.js  # Start fresh

# Or use our improved script
./improved_pm2_restart.sh
```

---

## 📊 **Monitoring and Diagnostics**

### **Check System Status**
```bash
# PM2 status
pm2 status

# Port usage
lsof -i :3000
lsof -i :5050
lsof -i :3001

# Health checks
curl http://localhost:5050/api/health
curl http://localhost:3001/health

# Process tree
pstree -p | grep -E "(node|npm)"
```

### **View Logs**
```bash
# PM2 logs
pm2 logs --timestamp

# Individual service logs
pm2 logs backend --lines 50
pm2 logs frontend --lines 50

# Real-time monitoring
pm2 monit
```

### **Resource Usage**
```bash
# Memory usage
pm2 list --format table

# System resources
top -p $(pgrep -d, node)

# Network connections
netstat -tulpn | grep -E "(3000|5050|3001)"
```

---

## 🛡️ **Prevention Best Practices**

### **1. Always Use Graceful Shutdown**
```bash
# Good
pm2 stop all
pm2 delete all

# Avoid
kill -9 $(pgrep node)  # Force kill can cause issues
```

### **2. Check Health Before Operations**
```bash
# Before making changes
curl http://localhost:5050/api/health
pm2 status
```

### **3. Use the Improved Scripts**
```bash
# For regular startup
./improved_pm2_restart.sh

# For development with logs
./improved_pm2_restart.sh --no-logs
pm2 logs --timestamp
```

### **4. Monitor Resource Usage**
```bash
# Set up monitoring
pm2 install pm2-server-monit

# Regular health checks
watch -n 5 'curl -s http://localhost:5050/api/health | jq .'
```

---

## 🚨 **Emergency Procedures**

### **Complete System Reset**
```bash
#!/bin/bash
echo "🚨 Emergency system reset..."

# Kill all Node processes
pkill -f node

# Kill PM2 daemon
pm2 kill

# Clean up ports
for port in 3000 5050 3001 1234; do
    lsof -ti :$port | xargs kill -KILL 2>/dev/null || true
done

# Wait for cleanup
sleep 5

# Restart fresh
./improved_pm2_restart.sh
```

### **Database Connection Issues**
```bash
# Check PostgreSQL status
brew services list | grep postgresql
# or
systemctl status postgresql

# Restart if needed
brew services restart postgresql
# or
sudo systemctl restart postgresql

# Test connection
psql -h localhost -U postgres -d citi_dashboard -c "SELECT 1;"
```

### **Kafka/Streaming Issues**
```bash
# Check Kafka connection
telnet 145.223.79.90 9092

# Reset streaming system
curl -X POST http://localhost:5050/api/streaming/stop
sleep 2
curl -X POST http://localhost:5050/api/streaming/start
```

---

## 📈 **Performance Optimization**

### **Startup Time Optimization**
- Backend health check: ~5 seconds
- Frontend ready: ~8 seconds
- Total startup: ~15-20 seconds

### **Memory Usage**
- Backend: ~150-200MB
- Frontend (dev): ~200-300MB
- Streaming: ~100-150MB
- Total: ~450-650MB

### **Shutdown Time**
- Graceful shutdown: ~5-10 seconds
- Force shutdown timeout: 15 seconds
- Port cleanup: ~2-3 seconds

---

## 🎯 **Success Indicators**

Your system is working correctly when:

✅ **Startup**: All services start without port conflicts  
✅ **Health**: All health endpoints return 200 OK  
✅ **Connectivity**: Frontend can reach backend APIs  
✅ **Streaming**: Real-time data flows correctly  
✅ **Shutdown**: All processes terminate gracefully  
✅ **Restart**: System can restart without manual intervention  

---

## 📞 **Getting Help**

If you continue to experience issues:

1. **Check the logs**: `pm2 logs --timestamp`
2. **Run diagnostics**: `./improved_pm2_restart.sh`
3. **Try emergency reset**: See emergency procedures above
4. **Check system resources**: Ensure sufficient RAM/CPU
5. **Verify dependencies**: Node.js, npm, PM2, PostgreSQL

**The improved startup system should resolve the shutdown conflicts you were experiencing. The key improvements are proper resource cleanup, coordinated shutdown handling, and better process management.**
