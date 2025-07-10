const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');

require('dotenv').config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      process.env.FRONTEND_URL || "http://localhost:3000",
      "http://192.168.4.25:3000"
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
    "http://192.168.4.25:3000"
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

// AI Data Integration Service
const AIDataIntegrationService = require('./services/aiDataIntegration');
const aiService = new AIDataIntegrationService(process.env.LLM_ENDPOINT || 'http://localhost:1234');

app.use('/api/dashboard', dashboardRoutes);
app.use('/api/budget', budgetRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/compliance', complianceRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/risk', riskRoutes);
app.use('/api/chatbot', chatbotRoutes);

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

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
  console.log(` Dashboard API: http://localhost:${PORT}/api/health`);
});

module.exports = { app, pool };
