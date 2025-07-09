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

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
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

app.use('/api/dashboard', dashboardRoutes);
app.use('/api/budget', budgetRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/compliance', complianceRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/risk', riskRoutes);
app.use('/api/chatbot', chatbotRoutes);

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
