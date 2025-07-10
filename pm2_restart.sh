#!/bin/bash

# Colored output
GREEN="\033[0;32m"
NC="\033[0m"

echo -e "${GREEN}🔍 Killing any process on port 3000 (frontend)...${NC}"
lsof -ti :3000 | xargs kill -9 2>/dev/null

echo -e "${GREEN}🔍 Killing any process on port 5050 (backend)...${NC}"
lsof -ti :5050 | xargs kill -9 2>/dev/null

sleep 1

echo -e "${GREEN}🛑 Stopping and deleting any existing PM2 processes...${NC}"
pm2 delete frontend 2>/dev/null
pm2 delete backend 2>/dev/null

echo -e "${GREEN}🚀 Starting frontend via PM2...${NC}"
pm2 start "npm run dev" --name frontend --cwd ./frontend

echo -e "${GREEN}🚀 Starting backend via PM2...${NC}"
pm2 start backend/server.js --name backend

echo -e "${GREEN}⏳ Waiting 3 seconds for processes to start...${NC}"
sleep 3

echo -e "${GREEN}📄 Showing last 10 lines of logs for FRONTEND:${NC}"
pm2 logs frontend --lines 10

echo -e "${GREEN}📄 Showing last 10 lines of logs for BACKEND:${NC}"
pm2 logs backend --lines 10

