#!/bin/bash

# Create logs directory if it doesn't exist
mkdir -p logs

# Generate timestamped log filename
TIMESTAMP=$(date "+%Y-%m-%d_%H-%M-%S")
LOGFILE="logs/status-${TIMESTAMP}.log"

# Color for terminal, no color in file
GREEN="\033[0;32m"
NC="\033[0m"

echo -e "${GREEN}📄 Generating log file: ${LOGFILE}${NC}"

# Write headers and logs to file
{
  echo "=== Frontend Logs (last 10 lines) ==="
  pm2 logs frontend --lines 10 --nostream
  echo ""
  echo "=== Backend Logs (last 10 lines) ==="
  pm2 logs backend --lines 10 --nostream
} > "$LOGFILE"

# Display to user
echo -e "${GREEN}✅ Log file created:${NC} $LOGFILE"
echo ""
cat "$LOGFILE"

