# 🚀 Complete Streaming System Integration

## Overview

This document describes the complete real-time streaming system integration for the Citi LATAM RegInsight Dashboard. The system combines Kafka streaming, WebSocket communication, and production-grade data generation to provide real-time updates across all dashboard components.

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Main Server    │    │ Streaming System│
│   Dashboard     │◄──►│   (Port 5000)    │◄──►│   (Port 3001)   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
                       ┌──────────────────┐    ┌─────────────────┐
                       │   PostgreSQL     │    │   Kafka Topics  │
                       │   Database       │    │   (Simulation)  │
                       └──────────────────┘    └─────────────────┘
```

## Components

### 1. Main Integration File (`streaming_main.js`)

The central orchestrator that:
- Initializes Kafka streaming service
- Sets up production data streamer
- Creates dedicated streaming server (port 3001)
- Provides REST API endpoints for streaming control
- Handles WebSocket connections for real-time updates

### 2. Kafka Streaming Service (`services/streaming/KafkaStreamingService.js`)

Features:
- **Graceful Fallback**: Automatically switches to simulation mode if Kafka broker is unavailable
- **Topic Management**: Handles multiple topics (budget, projects, compliance, risk, transactions, metrics)
- **Message Processing**: Routes messages to appropriate handlers
- **WebSocket Integration**: Broadcasts updates to connected clients
- **Health Monitoring**: Continuous health checks and statistics

### 3. Production Data Streamer (`services/streaming/ProductionDataStreamer.js`)

Capabilities:
- **Configurable Streams**: Different intervals and batch sizes for each data type
- **Burst Generation**: On-demand data generation for testing
- **Business Scenarios**: Simulates real-world scenarios (budget crisis, compliance audit, etc.)
- **VPS Optimization**: Configured for production deployment
- **Remote Control**: API endpoints for stream management

### 4. Server Integration (`server.js`)

Enhanced main server with:
- **Streaming System Initialization**: Automatic startup of streaming components
- **Graceful Shutdown**: Proper cleanup of streaming resources
- **Environment Control**: Can disable streaming via `ENABLE_STREAMING=false`
- **WebSocket Bridge**: Connects streaming data to main dashboard WebSocket

## Data Flow

### Real-Time Data Streaming

1. **Data Generation**: ProductionDataStreamer generates realistic data at configured intervals
2. **Kafka Publishing**: Data is published to appropriate Kafka topics
3. **Message Consumption**: KafkaStreamingService consumes and processes messages
4. **WebSocket Broadcast**: Processed data is broadcast to connected dashboard clients
5. **Frontend Updates**: Dashboard components receive real-time updates

### Supported Data Types

- **Budget Updates**: SVP budget allocations, utilization rates, alerts
- **Project Updates**: Project status, risk scores, milestone progress
- **Compliance Alerts**: Regulatory deadlines, audit findings, policy violations
- **Transaction Stream**: Financial transactions, risk assessments
- **Risk Events**: Operational, credit, market, and regulatory risks
- **System Metrics**: Performance monitoring, health checks

## Configuration

### Environment Variables

```bash
# Streaming Configuration
ENABLE_STREAMING=true                    # Enable/disable streaming system
STREAMING_PORT=3001                      # Streaming server port
KAFKA_BROKER=localhost:9092              # Kafka broker URL (optional)

# VPS Configuration
VPS_SERVER_NAME=VPS-DataStreamer         # Server identifier
VPS_REGION=LATAM                         # Region identifier
NODE_ENV=production                      # Environment mode
```

### Stream Configurations

Each stream type has configurable parameters:

```javascript
{
  BUDGET_UPDATES: {
    interval: 300000,    // 5 minutes
    batchSize: 5,        // Messages per batch
    enabled: true,       // Enable/disable stream
    priority: 'HIGH'     // Message priority
  },
  // ... other streams
}
```

## API Endpoints

### Streaming Control

- `GET /health` - Health check
- `GET /api/streaming/status` - Get streaming status
- `POST /api/streaming/start` - Start streaming
- `POST /api/streaming/stop` - Stop streaming
- `POST /api/streaming/burst` - Trigger burst generation
- `POST /api/streaming/simulate` - Simulate business scenarios

### Example Usage

```bash
# Check streaming status
curl http://localhost:3001/api/streaming/status

# Trigger budget update burst
curl -X POST http://localhost:3001/api/streaming/burst \
  -H "Content-Type: application/json" \
  -d '{"streamType": "BUDGET_UPDATES", "count": 10}'

# Simulate budget crisis
curl -X POST http://localhost:3001/api/streaming/simulate \
  -H "Content-Type: application/json" \
  -d '{"scenario": "BUDGET_CRISIS"}'
```

## WebSocket Events

### Client-Side Events

```javascript
// Connect to streaming
socket.emit('join-streaming', 'dashboard-updates');

// Listen for real-time updates
socket.on('streaming-update', (data) => {
  console.log('Received update:', data);
});

socket.on('budget-update', (data) => {
  // Handle budget update
});

socket.on('compliance-alert', (data) => {
  // Handle compliance alert
});
```

### Server-Side Events

- `streaming-update` - General streaming updates
- `budget-update` - Budget-specific updates
- `project-status-update` - Project updates
- `compliance-alert` - Compliance alerts
- `production-metrics` - System metrics
- `immediate-alert` - Critical alerts

## Testing

### Integration Test

Run the comprehensive integration test:

```bash
# Full integration test
node backend/test_streaming_integration.js

# Health check only
node backend/test_streaming_integration.js --health

# API endpoint tests
node backend/test_streaming_integration.js --api

# Help
node backend/test_streaming_integration.js --help
```

### Test Coverage

The integration test covers:
- ✅ Streaming system initialization
- ✅ Kafka connection (real or simulation mode)
- ✅ Data streamer functionality
- ✅ Burst generation
- ✅ Business scenario simulation
- ✅ Message processing
- ✅ Data retrieval
- ✅ WebSocket communication
- ✅ Graceful shutdown

## Deployment

### Development Mode

```bash
# Start main server (includes streaming)
npm run dev

# Or start streaming separately
node backend/streaming_main.js
```

### Production Mode

```bash
# Start with streaming enabled
ENABLE_STREAMING=true npm start

# Start without streaming
ENABLE_STREAMING=false npm start
```

### VPS Deployment

The system includes VPS-specific configurations and deployment scripts in `backend/vps-deployment/`.

## Monitoring

### Health Checks

- **Kafka Health**: Connection status, topic availability
- **Streaming Health**: Active streams, message throughput
- **System Health**: Memory usage, CPU usage, error rates

### Statistics

Real-time statistics available via API:

```javascript
{
  kafka: {
    isConnected: true,
    messagesProduced: 1250,
    messagesConsumed: 1248,
    errors: 0,
    simulationMode: false
  },
  dataStreamer: {
    isStreaming: true,
    activeStreams: 6,
    totalMessagesSent: 1250,
    uptime: 3600
  }
}
```

## Business Scenarios

### Available Scenarios

1. **BUDGET_CRISIS**: Multiple high-utilization budget alerts
2. **PROJECT_DEADLINE**: At-risk projects with high risk scores
3. **COMPLIANCE_AUDIT**: Multiple compliance alerts and findings
4. **MARKET_VOLATILITY**: Risk events and related transactions
5. **SYSTEM_OUTAGE**: Degraded system performance metrics

### Scenario Usage

```javascript
// Trigger via API
await fetch('/api/streaming/simulate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ scenario: 'BUDGET_CRISIS' })
});

// Or programmatically
await dataStreamer.simulateBusinessScenario('BUDGET_CRISIS');
```

## Troubleshooting

### Common Issues

1. **Kafka Connection Failed**
   - System automatically falls back to simulation mode
   - Check `KAFKA_BROKER` environment variable
   - Verify Kafka broker is running (optional)

2. **Port Conflicts**
   - Change `STREAMING_PORT` environment variable
   - Default ports: 5000 (main), 3001 (streaming)

3. **High Memory Usage**
   - Adjust stream intervals and batch sizes
   - Monitor via health check endpoints

4. **WebSocket Connection Issues**
   - Check CORS configuration
   - Verify frontend WebSocket client setup

### Debug Mode

Enable detailed logging:

```bash
DEBUG=streaming:* node backend/server.js
```

## Performance Optimization

### MacBook Optimization

The system is optimized for MacBook development:
- Reduced Kafka resource usage
- Single partition topics
- Optimized batch sizes
- Graceful fallback to simulation mode

### Production Optimization

For production deployment:
- Increase partition count
- Adjust batch sizes based on load
- Enable Kafka clustering
- Configure proper resource limits

## Security Considerations

- **CORS Configuration**: Properly configured for frontend access
- **Rate Limiting**: Applied to API endpoints
- **Input Validation**: All API inputs are validated
- **Error Handling**: Comprehensive error handling and logging

## Future Enhancements

- [ ] Redis integration for caching
- [ ] Message persistence and replay
- [ ] Advanced analytics and reporting
- [ ] Multi-region streaming support
- [ ] Enhanced security features
- [ ] Performance monitoring dashboard

## Support

For issues or questions:
1. Check the integration test results
2. Review health check endpoints
3. Examine server logs
4. Consult this documentation

---

**Last Updated**: January 2025  
**Version**: 1.0.0  
**Status**: Production Ready ✅
