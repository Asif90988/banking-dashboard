# CITI Dashboard - Isolated Startup Guide

## Quick Start

### Start the Application
```bash
./start_citi_dashboard.sh
```

### Stop the Application
```bash
./stop_citi_dashboard.sh
```

## What These Scripts Do

### `start_citi_dashboard.sh`
- **Kills any processes** running on ports 3000 and 5050
- **Cleans up** any existing citi-dashboard processes
- **Installs dependencies** if needed (backend and frontend)
- **Starts backend** on port 5050
- **Starts frontend** on port 3000
- **Monitors** both services and keeps them running
- **Logs** all output to `logs/backend.log` and `logs/frontend.log`

### `stop_citi_dashboard.sh`
- **Gracefully stops** both frontend and backend services
- **Kills processes** on ports 3000 and 5050
- **Cleans up** any remaining citi-dashboard processes
- **Verifies** ports are free

## Application URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5050

## Features

✅ **Port Isolation**: Ensures ONLY this application uses ports 3000 and 5050  
✅ **Process Cleanup**: Kills conflicting processes automatically  
✅ **Dependency Check**: Installs missing dependencies  
✅ **Health Monitoring**: Waits for services to be ready  
✅ **Logging**: Comprehensive logs in `logs/` directory  
✅ **PID Tracking**: Saves process IDs for clean shutdown  

## Troubleshooting

### If startup fails:
1. Check logs: `tail -f logs/backend.log` or `tail -f logs/frontend.log`
2. Ensure you're in the citi-dashboard root directory
3. Check Node.js and npm are installed
4. Run `./stop_citi_dashboard.sh` first to clean up

### If ports are busy:
The startup script automatically kills processes on ports 3000 and 5050, but if you get port conflicts:
```bash
# Manual port cleanup
lsof -ti:3000 | xargs kill -9
lsof -ti:5050 | xargs kill -9
```

### Manual process cleanup:
```bash
pkill -f "citi-dashboard"
pkill -f "next dev"
pkill -f "npm run dev"
```

## Directory Structure
```
citi-dashboard/
├── start_citi_dashboard.sh    # Main startup script
├── stop_citi_dashboard.sh     # Shutdown script
├── logs/                      # Application logs
│   ├── backend.log
│   ├── frontend.log
│   ├── backend.pid
│   └── frontend.pid
├── backend/                   # Backend server
└── frontend/                  # Frontend Next.js app
```

## Notes

- The startup script runs in **monitoring mode** - it will detect if either service dies
- Press `Ctrl+C` in the startup script terminal to stop both services
- The script ensures **complete isolation** from other Node.js applications on your system
- All conflicting startup scripts have been removed to prevent conflicts
