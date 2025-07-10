const KafkaStreamingService = require('./services/streaming/KafkaStreamingService');
const ProductionDataStreamer = require('./services/streaming/ProductionDataStreamer');
const { createServer } = require('http');
const { Server } = require('socket.io');
const express = require('express');

async function initializeStreamingSystem() {
  console.log('🚀 Initializing Real-Time Streaming System...');
  
  try {
    // Initialize Kafka streaming
    const kafkaService = new KafkaStreamingService();
    await kafkaService.initialize();
    
    // Initialize production data streamer
    const dataStreamer = new ProductionDataStreamer(kafkaService);
    
    // Set up Express server for streaming
    const app = express();
    const server = createServer(app);
    const io = new Server(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });
    
    // Connect WebSocket to Kafka
    kafkaService.setWebSocketServer(io);
    
    // Add middleware
    app.use(express.json());
    
    // Health check endpoint
    app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        streaming: {
          kafka: kafkaService.getConnectionStatus(),
          dataStreamer: dataStreamer.getStreamingStatus(),
          timestamp: new Date().toISOString()
        }
      });
    });
    
    // Streaming control endpoints
    app.post('/api/streaming/start', async (req, res) => {
      try {
        await dataStreamer.startProductionStreaming();
        res.json({ success: true, message: 'Streaming started successfully' });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });
    
    app.post('/api/streaming/stop', async (req, res) => {
      try {
        await dataStreamer.stopProductionStreaming();
        res.json({ success: true, message: 'Streaming stopped successfully' });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });
    
    app.get('/api/streaming/status', (req, res) => {
      res.json({
        kafka: kafkaService.getStreamingStats(),
        dataStreamer: dataStreamer.getStreamingStatus()
      });
    });
    
    // Burst generation endpoint
    app.post('/api/streaming/burst', async (req, res) => {
      try {
        const { streamType, count = 10 } = req.body;
        await dataStreamer.triggerBurstGeneration(streamType, count);
        res.json({ success: true, message: `Burst generation triggered for ${streamType}` });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });
    
    // Business scenario simulation endpoint
    app.post('/api/streaming/simulate', async (req, res) => {
      try {
        const { scenario } = req.body;
        await dataStreamer.simulateBusinessScenario(scenario);
        res.json({ success: true, message: `Scenario ${scenario} simulation started` });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });
    
    // WebSocket connection handling
    io.on('connection', (socket) => {
      console.log('📡 Client connected to streaming server:', socket.id);
      
      socket.on('join-streaming', (room) => {
        socket.join(room);
        console.log(`📡 Client joined streaming room: ${room}`);
      });
      
      socket.on('disconnect', () => {
        console.log('📡 Client disconnected from streaming server:', socket.id);
      });
      
      // Send initial status
      socket.emit('streaming-status', {
        kafka: kafkaService.getStreamingStats(),
        dataStreamer: dataStreamer.getStreamingStatus()
      });
    });
    
    // Start production data streaming
    await dataStreamer.startProductionStreaming();
    
    // Start server only if running as standalone
    if (require.main === module) {
      const STREAMING_PORT = process.env.STREAMING_PORT || 3001;
      server.listen(STREAMING_PORT, () => {
        console.log(`✅ Streaming server running on port ${STREAMING_PORT}`);
        console.log(`📊 Health check: http://localhost:${STREAMING_PORT}/health`);
        console.log(`🔗 WebSocket endpoint: ws://localhost:${STREAMING_PORT}`);
      });
    }
    
    // Graceful shutdown
    process.on('SIGTERM', async () => {
      console.log('🛑 Shutting down streaming system...');
      await dataStreamer.stopProductionStreaming();
      await kafkaService.disconnect();
      server.close(() => {
        console.log('✅ Streaming server closed');
        process.exit(0);
      });
    });
    
    process.on('SIGINT', async () => {
      console.log('🛑 Received SIGINT, shutting down streaming system...');
      await dataStreamer.stopProductionStreaming();
      await kafkaService.disconnect();
      server.close(() => {
        console.log('✅ Streaming server closed');
        process.exit(0);
      });
    });
    
    // Export for integration with main server
    return {
      kafkaService,
      dataStreamer,
      streamingServer: server,
      streamingIO: io
    };
    
  } catch (error) {
    console.error('❌ Failed to initialize streaming system:', error);
    process.exit(1);
  }
}

// If this file is run directly, start the streaming system
if (require.main === module) {
  initializeStreamingSystem();
}

module.exports = { initializeStreamingSystem };
