# 🚀 VPS Data Streamer - Deployment Package

## 📋 Overview

This package contains everything needed to deploy the **Citi Dashboard VPS Data Streamer** to your VPS server. The streamer generates realistic financial data and streams it to your MacBook for real-time dashboard processing.

## 🏗️ Architecture

```
VPS Server (Data Producer)          MacBook (Data Consumer & Processor)
├── Production Data Streamer    →    ├── Kafka Streaming Service
├── High-volume data streams    →    ├── Event Processing & Analytics  
├── Business scenario simulation →   ├── WebSocket Broadcasting
├── 24/7 continuous operation   →    ├── Live Dashboard Updates
└── Enterprise-scale generation  →   └── AI Integration & Commands
```

## 📦 Package Contents

```
backend/vps-deployment/
├── package.json              # Node.js dependencies
├── vps-streamer.js           # Main application
├── deploy.sh                 # Automated deployment script
├── services/
│   ├── KafkaStreamingService.js     # Kafka client
│   └── ProductionDataStreamer.js    # Data generation engine
└── README.md                 # This file
```

## 🚀 Quick Deployment

### Prerequisites

1. **VPS Server** with Ubuntu/Debian (recommended)
2. **SSH access** to your VPS
3. **Node.js 16+** (will be installed automatically)
4. **Your VPS IP address**

### One-Command Deployment

```bash
# Navigate to deployment directory
cd backend/vps-deployment

# Deploy to your VPS (replace with your VPS IP)
VPS_HOST=your-vps-ip-address ./deploy.sh
```

### Custom Deployment Options

```bash
# Custom user and port
VPS_HOST=192.168.1.100 VPS_USER=ubuntu VPS_PORT=2222 ./deploy.sh

# Custom deployment directory
VPS_HOST=192.168.1.100 DEPLOY_DIR=/home/ubuntu/streamer ./deploy.sh
```

## 🔧 Manual Deployment

If you prefer manual deployment:

### 1. Copy Files to VPS

```bash
# Copy all files to your VPS
scp -r ./* user@your-vps-ip:/opt/citi-dashboard-streamer/
```

### 2. Install Dependencies

```bash
# SSH into your VPS
ssh user@your-vps-ip

# Navigate to deployment directory
cd /opt/citi-dashboard-streamer

# Install Node.js (if not installed)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install dependencies
npm install

# Make executable
chmod +x vps-streamer.js
```

### 3. Test Installation

```bash
# Test the streamer
node vps-streamer.js --test
```

### 4. Start the Service

```bash
# Start in production mode
node vps-streamer.js

# Or start in development mode (shorter intervals)
node vps-streamer.js --dev
```

## ⚙️ Configuration

### Environment Variables

```bash
# Server identification
export VPS_SERVER_NAME="VPS-DataStreamer-01"
export VPS_REGION="LATAM"

# Kafka configuration
export KAFKA_BROKER_URL="localhost:9092"

# Target MacBook (for future remote control)
export MACBOOK_IP="192.168.1.50"

# Environment
export NODE_ENV="production"
export LOG_LEVEL="info"
```

### Stream Configuration

The streamer generates data with these default intervals:

- **Budget Updates**: Every 5 minutes (5 records)
- **Project Updates**: Every 3 minutes (3 records)
- **Compliance Alerts**: Every 10 minutes (2 records)
- **Transaction Stream**: Every 10 seconds (20 records)
- **Risk Events**: Every 15 minutes (1 record)
- **System Metrics**: Every 30 seconds (10 records)

## 🎛️ Control Commands

### Service Management

```bash
# Check status
systemctl status citi-dashboard-streamer

# Start service
systemctl start citi-dashboard-streamer

# Stop service
systemctl stop citi-dashboard-streamer

# Restart service
systemctl restart citi-dashboard-streamer

# View logs
journalctl -u citi-dashboard-streamer -f
```

### Application Commands

```bash
# Show help
node vps-streamer.js --help

# Check status
node vps-streamer.js --status

# Test mode
node vps-streamer.js --test

# Development mode (faster intervals)
node vps-streamer.js --dev
```

## 📊 Data Streams

### Budget Updates
- **Frequency**: Every 5 minutes
- **Volume**: 5 records per batch
- **Content**: SVP budget allocations, utilization rates, department spending

### Project Updates
- **Frequency**: Every 3 minutes
- **Volume**: 3 records per batch
- **Content**: Project progress, risk scores, budget utilization

### Compliance Alerts
- **Frequency**: Every 10 minutes
- **Volume**: 2 records per batch
- **Content**: Regulatory deadlines, audit findings, policy violations

### Transaction Stream
- **Frequency**: Every 10 seconds
- **Volume**: 20 records per batch
- **Content**: Financial transactions, multi-currency, risk scoring

### Risk Events
- **Frequency**: Every 15 minutes
- **Volume**: 1 record per batch
- **Content**: Operational, credit, market, regulatory risks

### System Metrics
- **Frequency**: Every 30 seconds
- **Volume**: 10 records per batch
- **Content**: CPU, memory, disk, network, API performance

## 🎭 Business Scenarios

The streamer can simulate realistic business scenarios:

### Available Scenarios
- **Budget Crisis**: Multiple departments exceeding budget thresholds
- **Project Deadline**: High-risk projects approaching deadlines
- **Compliance Audit**: Regulatory findings requiring attention
- **Market Volatility**: High-risk market events and transactions
- **System Outage**: Degraded system performance metrics

### Triggering Scenarios
```bash
# Via application (when running)
# Scenarios are triggered automatically based on data patterns
# Or can be triggered via remote commands from MacBook
```

## 🔗 MacBook Integration

### Configure MacBook to Receive VPS Data

1. **Update Kafka Configuration** on your MacBook:
```javascript
// In your MacBook's KafkaStreamingService.js
const kafka = new Kafka({
  clientId: 'citi-dashboard-streaming',
  brokers: ['YOUR_VPS_IP:9092'], // Replace with your VPS IP
  // ... other config
});
```

2. **Test Connection** from MacBook:
```bash
# Test if MacBook can connect to VPS Kafka
telnet YOUR_VPS_IP 9092
```

## 🔒 Security Considerations

### Firewall Configuration
```bash
# Allow Kafka port (if using real Kafka)
sudo ufw allow 9092

# Allow SSH
sudo ufw allow 22

# Enable firewall
sudo ufw enable
```

### SSH Security
- Use SSH keys instead of passwords
- Change default SSH port if needed
- Disable root login (recommended)

## 📈 Monitoring

### Health Checks
The service includes built-in health monitoring:
- **System metrics**: CPU, memory, disk usage
- **Stream status**: Active streams, message counts
- **Error tracking**: Failed operations, connection issues

### Log Files
```bash
# Application logs
journalctl -u citi-dashboard-streamer -f

# System logs
tail -f /var/log/syslog
```

## 🚨 Troubleshooting

### Common Issues

#### Service Won't Start
```bash
# Check logs
journalctl -u citi-dashboard-streamer -n 50

# Check if port is in use
netstat -tulpn | grep 9092

# Restart service
systemctl restart citi-dashboard-streamer
```

#### High CPU/Memory Usage
```bash
# Check resource usage
htop

# Reduce stream intervals (edit configuration)
# Restart with lower batch sizes
```

#### Connection Issues
```bash
# Test network connectivity
ping YOUR_MACBOOK_IP

# Check firewall
sudo ufw status

# Test Kafka connectivity
telnet localhost 9092
```

### Performance Optimization

#### For Lower Resource Usage
```bash
# Start with reduced intervals
VPS_SERVER_NAME=VPS-Light node vps-streamer.js --dev
```

#### For Higher Throughput
```bash
# Increase batch sizes (edit ProductionDataStreamer.js)
# Add more concurrent streams
# Optimize data generation algorithms
```

## 📞 Support

### Getting Help
1. **Check logs**: `journalctl -u citi-dashboard-streamer -f`
2. **Test connectivity**: `node vps-streamer.js --test`
3. **Review configuration**: Environment variables and stream settings
4. **Monitor resources**: CPU, memory, disk, network usage

### Useful Commands
```bash
# Complete service restart
systemctl stop citi-dashboard-streamer
systemctl start citi-dashboard-streamer

# Check service health
curl -s http://localhost:8080/health || echo "Health endpoint not available"

# Monitor real-time logs
journalctl -u citi-dashboard-streamer -f --since "1 hour ago"
```

## 🎯 Next Steps

After successful deployment:

1. **Verify streaming**: Check logs for data generation
2. **Configure MacBook**: Update Kafka broker settings
3. **Test end-to-end**: Ensure data flows from VPS to MacBook
4. **Monitor performance**: Watch resource usage and stream health
5. **Customize scenarios**: Adjust business scenario triggers

## 🏆 Success Indicators

Your deployment is successful when you see:

✅ **Service Status**: `systemctl status citi-dashboard-streamer` shows "active (running)"  
✅ **Data Generation**: Logs show regular message production  
✅ **Health Checks**: No error messages in logs  
✅ **Resource Usage**: CPU < 10%, Memory < 500MB  
✅ **MacBook Connection**: MacBook receives streaming data  

---

**🚀 Your VPS is now a powerful data streaming engine for the Citi Dashboard!**

The system will continuously generate realistic financial data, simulating enterprise-scale operations while maintaining optimal performance on your VPS infrastructure.
