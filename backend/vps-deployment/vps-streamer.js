#!/usr/bin/env node

const KafkaStreamingService = require('./services/KafkaStreamingService');
const ProductionDataStreamer = require('./services/ProductionDataStreamer');

class VPSStreamerApp {
  constructor() {
    this.kafkaService = null;
    this.dataStreamer = null;
    this.isRunning = false;
    
    // Configuration from environment variables
    this.config = {
      serverName: process.env.VPS_SERVER_NAME || 'VPS-DataStreamer-01',
      region: process.env.VPS_REGION || 'LATAM',
      environment: process.env.NODE_ENV || 'production',
      kafkaBroker: process.env.KAFKA_BROKER_URL || 'localhost:9092',
      macbookTarget: process.env.MACBOOK_IP || 'localhost',
      logLevel: process.env.LOG_LEVEL || 'info',
      autoStart: process.env.AUTO_START !== 'false'
    };

    // Handle process signals
    this.setupSignalHandlers();
  }

  async initialize() {
    try {
      console.log('🚀 Initializing VPS Data Streamer...');
      console.log('📋 Configuration:', {
        server: this.config.serverName,
        region: this.config.region,
        environment: this.config.environment,
        kafkaBroker: this.config.kafkaBroker,
        target: this.config.macbookTarget
      });

      // Initialize Kafka streaming service
      this.kafkaService = new KafkaStreamingService();
      await this.kafkaService.initialize();

      // Initialize production data streamer
      this.dataStreamer = new ProductionDataStreamer(this.kafkaService);

      console.log('✅ VPS Data Streamer initialized successfully');
      return true;

    } catch (error) {
      console.error('❌ Failed to initialize VPS Data Streamer:', error.message);
      return false;
    }
  }

  async start() {
    if (this.isRunning) {
      console.log('⚠️ VPS Data Streamer is already running');
      return;
    }

    try {
      console.log('🚀 Starting VPS Data Streamer...');
      
      if (!this.kafkaService || !this.dataStreamer) {
        const initialized = await this.initialize();
        if (!initialized) {
          throw new Error('Failed to initialize services');
        }
      }

      // Start production streaming
      await this.dataStreamer.startProductionStreaming();
      
      this.isRunning = true;
      console.log('✅ VPS Data Streamer started successfully');
      console.log('📊 Streaming Status:', this.dataStreamer.getStreamingStatus());

      // Log startup success
      this.logEvent('STARTUP', 'VPS Data Streamer started successfully');

    } catch (error) {
      console.error('❌ Failed to start VPS Data Streamer:', error.message);
      this.logEvent('ERROR', `Startup failed: ${error.message}`);
      throw error;
    }
  }

  async stop() {
    if (!this.isRunning) {
      console.log('⚠️ VPS Data Streamer is not running');
      return;
    }

    try {
      console.log('🛑 Stopping VPS Data Streamer...');

      if (this.dataStreamer) {
        await this.dataStreamer.stopProductionStreaming();
      }

      if (this.kafkaService) {
        await this.kafkaService.disconnect();
      }

      this.isRunning = false;
      console.log('✅ VPS Data Streamer stopped successfully');
      this.logEvent('SHUTDOWN', 'VPS Data Streamer stopped successfully');

    } catch (error) {
      console.error('❌ Error stopping VPS Data Streamer:', error.message);
      this.logEvent('ERROR', `Shutdown error: ${error.message}`);
    }
  }

  async restart() {
    console.log('🔄 Restarting VPS Data Streamer...');
    await this.stop();
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
    await this.start();
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      config: this.config,
      kafkaStatus: this.kafkaService ? this.kafkaService.getStreamingStats() : null,
      streamerStatus: this.dataStreamer ? this.dataStreamer.getStreamingStatus() : null,
      uptime: this.isRunning ? process.uptime() : 0,
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage()
    };
  }

  // Remote control methods for MacBook integration
  async handleRemoteCommand(command, params = {}) {
    console.log(`📡 Received remote command: ${command}`, params);

    try {
      switch (command) {
        case 'START':
          await this.start();
          break;

        case 'STOP':
          await this.stop();
          break;

        case 'RESTART':
          await this.restart();
          break;

        case 'STATUS':
          return this.getStatus();

        case 'BURST_GENERATION':
          if (this.dataStreamer) {
            await this.dataStreamer.triggerBurstGeneration(
              params.streamType || 'BUDGET_UPDATES',
              params.count || 10
            );
          }
          break;

        case 'SIMULATE_SCENARIO':
          if (this.dataStreamer) {
            await this.dataStreamer.simulateBusinessScenario(
              params.scenario || 'BUDGET_CRISIS'
            );
          }
          break;

        case 'UPDATE_CONFIG':
          if (this.dataStreamer && params.streamName && params.config) {
            this.dataStreamer.updateStreamConfig(params.streamName, params.config);
          }
          break;

        case 'HEALTH_CHECK':
          return {
            healthy: this.isRunning,
            status: this.getStatus(),
            timestamp: new Date().toISOString()
          };

        default:
          console.log(`❌ Unknown remote command: ${command}`);
          return { error: `Unknown command: ${command}` };
      }

      this.logEvent('REMOTE_COMMAND', `Executed: ${command}`, params);
      return { success: true, command, params };

    } catch (error) {
      console.error(`❌ Error executing remote command ${command}:`, error.message);
      this.logEvent('ERROR', `Remote command failed: ${command} - ${error.message}`);
      return { error: error.message, command, params };
    }
  }

  setupSignalHandlers() {
    // Graceful shutdown on SIGTERM
    process.on('SIGTERM', async () => {
      console.log('📡 Received SIGTERM signal');
      await this.stop();
      process.exit(0);
    });

    // Graceful shutdown on SIGINT (Ctrl+C)
    process.on('SIGINT', async () => {
      console.log('📡 Received SIGINT signal');
      await this.stop();
      process.exit(0);
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      console.error('💥 Uncaught Exception:', error);
      this.logEvent('ERROR', `Uncaught exception: ${error.message}`);
      process.exit(1);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
      this.logEvent('ERROR', `Unhandled rejection: ${reason}`);
    });
  }

  logEvent(type, message, data = null) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      server: this.config.serverName,
      type,
      message,
      data,
      pid: process.pid
    };

    console.log(`📝 [${type}] ${message}`, data ? data : '');

    // In production, you might want to send this to a logging service
    // or write to a log file
  }

  // Development mode helpers
  startDevelopmentMode() {
    console.log('🔧 Starting in development mode...');
    
    // More verbose logging
    this.config.logLevel = 'debug';
    
    // Shorter intervals for testing
    if (this.dataStreamer) {
      this.dataStreamer.updateStreamConfig('BUDGET_UPDATES', { interval: 30000 }); // 30 seconds
      this.dataStreamer.updateStreamConfig('PROJECT_UPDATES', { interval: 20000 }); // 20 seconds
      this.dataStreamer.updateStreamConfig('TRANSACTION_STREAM', { interval: 5000 }); // 5 seconds
    }
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const app = new VPSStreamerApp();

  // Handle command line arguments
  if (args.includes('--dev')) {
    app.startDevelopmentMode();
  }

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
🚀 VPS Data Streamer - Citi Dashboard

Usage: node vps-streamer.js [options]

Options:
  --dev          Start in development mode (shorter intervals)
  --help, -h     Show this help message
  --status       Show current status and exit
  --test         Run test mode and exit

Environment Variables:
  VPS_SERVER_NAME    Server identifier (default: VPS-DataStreamer-01)
  VPS_REGION         Server region (default: LATAM)
  NODE_ENV           Environment (default: production)
  KAFKA_BROKER_URL   Kafka broker URL (default: localhost:9092)
  MACBOOK_IP         Target MacBook IP (default: localhost)
  LOG_LEVEL          Logging level (default: info)
  AUTO_START         Auto-start streaming (default: true)

Examples:
  node vps-streamer.js                    # Start in production mode
  node vps-streamer.js --dev              # Start in development mode
  VPS_SERVER_NAME=VPS-01 node vps-streamer.js  # Custom server name
    `);
    process.exit(0);
  }

  if (args.includes('--status')) {
    console.log('📊 VPS Data Streamer Status:');
    console.log(JSON.stringify(app.getStatus(), null, 2));
    process.exit(0);
  }

  if (args.includes('--test')) {
    console.log('🧪 Running VPS Data Streamer test...');
    try {
      await app.initialize();
      console.log('✅ Test passed - VPS Data Streamer can be initialized');
      process.exit(0);
    } catch (error) {
      console.error('❌ Test failed:', error.message);
      process.exit(1);
    }
  }

  // Default: start the streamer
  try {
    await app.initialize();
    
    if (app.config.autoStart) {
      await app.start();
      
      // Keep the process running
      console.log('🔄 VPS Data Streamer is running. Press Ctrl+C to stop.');
      
      // Periodic status updates
      setInterval(() => {
        const status = app.getStatus();
        console.log(`📊 [${new Date().toISOString()}] Status: Running | Messages: ${status.streamerStatus?.stats?.totalMessagesSent || 0} | Uptime: ${Math.round(status.uptime)}s`);
      }, 60000); // Every minute
      
    } else {
      console.log('⏸️ Auto-start disabled. Use remote commands to control the streamer.');
    }

  } catch (error) {
    console.error('💥 Failed to start VPS Data Streamer:', error.message);
    process.exit(1);
  }
}

// Export for testing
module.exports = VPSStreamerApp;

// Run if this file is executed directly
if (require.main === module) {
  main().catch(error => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });
}
