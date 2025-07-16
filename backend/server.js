const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');

require('dotenv').config();

// Import streaming system
const { initializeStreamingSystem } = require('./streaming_main');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      process.env.FRONTEND_URL || "http://localhost:3000",
      "http://localhost:3002",
      "http://192.168.4.25:3000",
      "http://192.168.4.25:3002"
    ],
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || "http://localhost:3000",
    "http://localhost:3002",
    "http://192.168.4.25:3000",
    "http://192.168.4.25:3002"
  ],
  credentials: true
}));
app.use(express.json());

// Rate limiting - More generous for development
const limiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 1000, // Much higher limit
  message: {
    error: 'Too many requests, please try again later',
    retryAfter: '5 minutes'
  }
});
app.use('/api/', limiter);

// Database connection
const { Pool } = require('pg');
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'citi_dashboard',
  password: process.env.DB_PASSWORD || '',
  port: process.env.DB_PORT || 5432,
});

// Test database connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('Error connecting to database:', err);
  } else {
    console.log(' Database connected successfully');
    release();
  }
});

// Routes
const dashboardRoutes = require('./routes/dashboard');
const budgetRoutes = require('./routes/budget');
const projectRoutes = require('./routes/projects');
const complianceRoutes = require('./routes/compliance');
const activityRoutes = require('./routes/activities');
const riskRoutes = require('./routes/risk');
const chatbotRoutes = require('./routes/chatbot');
const sanctionsRoutes = require('./routes/sanctions');
const projectCreationRoutes = require('./routes/project-creation');

// AI Data Integration Service
const AIDataIntegrationService = require('./services/aiDataIntegration');
const aiService = new AIDataIntegrationService(process.env.LLM_ENDPOINT || 'http://localhost:1234');

// AI Analytics Services
const PredictiveAnalyticsEngine = require('./services/ai/PredictiveAnalyticsEngine');
const AnomalyDetectionSystem = require('./services/ai/AnomalyDetectionSystem');
const { router: aiAnalyticsRoutes, initializeAIServices } = require('./routes/ai-analytics');

// Initialize AI Analytics Services
const predictiveEngine = new PredictiveAnalyticsEngine();
const anomalySystem = new AnomalyDetectionSystem();
initializeAIServices(predictiveEngine, anomalySystem);

app.use('/api/dashboard', dashboardRoutes);
app.use('/api/budget', budgetRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/compliance', complianceRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/risk', riskRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/sanctions', sanctionsRoutes);
app.use('/api/ai-analytics', aiAnalyticsRoutes);
app.use('/api/project-creation', projectCreationRoutes);

// AI Data Integration Routes
app.post('/api/ai/process-request', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log('Processing AI request:', message);
    const result = await aiService.processNLRequest(message);
    
    // Broadcast update to all connected clients if successful
    if (result.success) {
      io.to('dashboard-updates').emit('data_updated', {
        type: 'ai_integration',
        payload: result,
        timestamp: new Date()
      });
    }
    
    res.json(result);
  } catch (error) {
    console.error('AI processing error:', error);
    res.status(500).json({ 
      success: false,
      message: `AI processing failed: ${error.message}`,
      timestamp: new Date()
    });
  }
});

// Get available data sources
app.get('/api/ai/data-sources', (req, res) => {
  try {
    const dataSources = aiService.getDataSources();
    res.json({ success: true, dataSources });
  } catch (error) {
    console.error('Error getting data sources:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Register new data source
app.post('/api/ai/data-sources', (req, res) => {
  try {
    const dataSource = req.body;
    aiService.registerDataSource(dataSource);
    res.json({ success: true, message: 'Data source registered successfully' });
  } catch (error) {
    console.error('Error registering data source:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Streaming status endpoint
app.get('/api/streaming/status', (req, res) => {
  try {
    if (streamingSystem && streamingSystem.kafkaService) {
      const kafkaStats = streamingSystem.kafkaService.getStreamingStats();
      const dataStreamerStatus = streamingSystem.dataStreamer ? streamingSystem.dataStreamer.getStreamingStatus() : null;
      
      res.json({
        kafka: kafkaStats,
        dataStreamer: dataStreamerStatus,
        timestamp: new Date().toISOString()
      });
    } else {
      // If streaming system is not initialized, return disconnected status
      res.json({
        kafka: {
          isConnected: false,
          simulationMode: false,
          messagesProduced: 0,
          messagesConsumed: 0,
          errors: 0,
          lastActivity: null
        },
        dataStreamer: null,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Error getting streaming status:', error);
    res.status(500).json({
      error: 'Failed to get streaming status',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// WebSocket
io.on('connection', (socket) => {
  console.log(' Client connected:', socket.id);

  socket.on('join-dashboard', (userId) => {
    socket.join('dashboard-updates');
    console.log(` User ${userId} joined dashboard updates`);
  });

  socket.on('disconnect', () => {
    console.log(' Client disconnected:', socket.id);
  });
});

app.set('io', io);
app.set('pool', pool);

// Error handling
app.use((err, req, res, next) => {
  console.error(' Error:', err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5050;

// Initialize streaming system alongside main server
let streamingSystem = null;

async function startServer() {
  try {
    // Start main server
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Dashboard API: http://localhost:${PORT}/api/health`);
    });

    // Initialize streaming system (runs on separate port)
    if (process.env.ENABLE_STREAMING !== 'false') {
      console.log('🔄 Initializing streaming system...');
      streamingSystem = await initializeStreamingSystem();
      console.log('✅ Streaming system initialized successfully');
      
      // Connect streaming to main WebSocket
      if (streamingSystem && streamingSystem.kafkaService) {
        streamingSystem.kafkaService.setWebSocketServer(io);
        console.log('🔗 Streaming system connected to main WebSocket server');
      }
    } else {
      console.log('⚠️ Streaming system disabled via environment variable');
    }

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Improved graceful shutdown handling
let isShuttingDown = false;

async function gracefulShutdown(signal) {
  if (isShuttingDown) {
    console.log('⚠️ Shutdown already in progress...');
    return;
  }
  
  isShuttingDown = true;
  console.log(`🛑 Received ${signal}, shutting down gracefully...`);
  
  // Set a timeout to force exit if shutdown takes too long
  const forceExitTimeout = setTimeout(() => {
    console.log('⚠️ Force exiting due to shutdown timeout');
    process.exit(1);
  }, 15000);
  
  try {
    // Close database connections
    if (pool) {
      console.log('🔌 Closing database connections...');
      await pool.end();
      console.log('✅ Database connections closed');
    }
    
    // Shutdown streaming system
    if (streamingSystem) {
      console.log('📡 Shutting down streaming system...');
      try {
        if (streamingSystem.dataStreamer) {
          await streamingSystem.dataStreamer.stopProductionStreaming();
        }
        if (streamingSystem.kafkaService) {
          await streamingSystem.kafkaService.disconnect();
        }
        if (streamingSystem.streamingServer) {
          streamingSystem.streamingServer.close();
        }
        console.log('✅ Streaming system shut down');
      } catch (error) {
        console.error('❌ Error shutting down streaming system:', error);
      }
    }
    
    // Close WebSocket connections
    if (io) {
      console.log('🔌 Closing WebSocket connections...');
      io.close();
      console.log('✅ WebSocket connections closed');
    }
    
    // Close main server
    server.close((err) => {
      clearTimeout(forceExitTimeout);
      if (err) {
        console.error('❌ Error closing server:', err);
        process.exit(1);
      } else {
        console.log('✅ Main server closed');
        process.exit(0);
      }
    });
    
  } catch (error) {
    clearTimeout(forceExitTimeout);
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions and unhandled rejections
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('unhandledRejection');
});

// Start the server
startServer();

module.exports = { app, pool, streamingSystem };
