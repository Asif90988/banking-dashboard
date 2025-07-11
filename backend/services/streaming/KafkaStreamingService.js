const { Kafka, logLevel } = require('kafkajs');
const { EventEmitter } = require('events');

class KafkaStreamingService extends EventEmitter {
  constructor() {
    super();
    
    this.kafka = new Kafka({
      clientId: 'citi-dashboard-streaming',
      brokers: [process.env.KAFKA_BROKER_URL || '145.223.79.90:9092'],
      logLevel: logLevel.INFO,
      retry: {
        initialRetryTime: 100,
        retries: 8
      },
      // MacBook optimization - reduce resource usage
      connectionTimeout: 3000,
      requestTimeout: 30000
    });

    this.producer = this.kafka.producer({
      // Optimize for MacBook performance
      maxInFlightRequests: 1,
      idempotent: false,
      transactionTimeout: 30000
    });
    
    this.consumer = this.kafka.consumer({ 
      groupId: 'dashboard-consumer-group',
      sessionTimeout: 30000,
      heartbeatInterval: 3000,
      // MacBook optimization
      maxBytesPerPartition: 1048576, // 1MB
      minBytes: 1,
      maxBytes: 10485760, // 10MB
      maxWaitTimeInMs: 5000
    });

    this.topics = {
      BUDGET_UPDATES: 'budget-updates',
      PROJECT_UPDATES: 'project-updates',
      COMPLIANCE_ALERTS: 'compliance-alerts',
      SYSTEM_METRICS: 'system-metrics',
      TRANSACTION_STREAM: 'transaction-stream',
      RISK_EVENTS: 'risk-events',
      ETL_EVENTS: 'etl-events',
      SANCTIONS_DATA: 'sanctions-data',
      FLAGGED_TRANSACTIONS: 'flagged-transactions'
    };

    this.isConnected = false;
    this.messageHandlers = new Map();
    this.webSocketServer = null;
    this.streamingStats = {
      messagesProduced: 0,
      messagesConsumed: 0,
      lastActivity: null,
      activeStreams: 0,
      errors: 0
    };

    // Database simulation (will integrate with real DB later)
    this.dataStore = {
      budget: new Map(),
      projects: new Map(),
      compliance: new Map(),
      alerts: []
    };
  }

  async initialize() {
    try {
      console.log('🚀 Initializing Kafka Streaming Service...');
      
      // Check if Kafka is available (graceful fallback)
      const isKafkaAvailable = await this.checkKafkaAvailability();
      
      // Initialize SanctionsDataProducer
      const SanctionsDataProducer = require('./SanctionsDataProducer');
      this.sanctionsProducer = new SanctionsDataProducer({
        kafka: {
          clientId: 'sanctions-producer',
          brokers: [process.env.KAFKA_BROKER_URL || '145.223.79.90:9092']
        },
        topic: this.topics.SANCTIONS_DATA
      });
      await this.sanctionsProducer.initialize();
      await this.sanctionsProducer.start();
      console.log('✅ SanctionsDataProducer initialized and started');
      
      // Initialize SanctionsMatcher
      const SanctionsMatcher = require('./SanctionsMatcher');
      this.sanctionsMatcher = new SanctionsMatcher({
        kafka: {
          clientId: 'sanctions-matcher',
          brokers: [process.env.KAFKA_BROKER_URL || '145.223.79.90:9092'],
          groupId: 'sanctions-matcher-group'
        },
        topics: {
          transactions: this.topics.TRANSACTION_STREAM,
          sanctions: this.topics.SANCTIONS_DATA,
          flagged: 'flagged-transactions'
        }
      }, this);
      await this.sanctionsMatcher.initialize();
      await this.sanctionsMatcher.start();
      console.log('✅ SanctionsMatcher initialized and started');
      
      if (!isKafkaAvailable) {
        console.log('⚠️ Kafka not available, running in simulation mode');
        this.initializeSimulationMode();
        return;
      }

      // Connect producer and consumer
      await this.producer.connect();
      console.log('✅ Kafka producer connected');
      
      await this.consumer.connect();
      console.log('✅ Kafka consumer connected');
      
      // Create topics if they don't exist
      await this.createTopics();
      
      // Subscribe to all topics except FLAGGED_TRANSACTIONS (handled by SanctionsMatcher)
      const topicsToSubscribe = Object.values(this.topics).filter(topic => topic !== this.topics.FLAGGED_TRANSACTIONS);
      await this.consumer.subscribe({
        topics: topicsToSubscribe,
        fromBeginning: false
      });

      // Start consuming messages
      await this.consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          await this.handleIncomingMessage(topic, partition, message);
        }
      });

      this.isConnected = true;
      console.log('✅ Kafka Streaming Service initialized successfully');
      
      // Start health check
      this.startHealthCheck();
      
    } catch (error) {
      console.error('❌ Failed to initialize Kafka:', error.message);
      console.log('🔄 Falling back to simulation mode...');
      this.initializeSimulationMode();
    }
  }

  async checkKafkaAvailability() {
    try {
      const admin = this.kafka.admin();
      await admin.connect();
      await admin.listTopics();
      await admin.disconnect();
      return true;
    } catch (error) {
      return false;
    }
  }

  initializeSimulationMode() {
    console.log('🎭 Running Kafka in simulation mode (no broker required)');
    this.isConnected = true;
    this.simulationMode = true;
    
    // Start simulation health check
    this.startHealthCheck();
  }

  async createTopics() {
    try {
      const admin = this.kafka.admin();
      await admin.connect();
      
      const existingTopics = await admin.listTopics();
      const topicsToCreate = Object.values(this.topics)
        .filter(topic => !existingTopics.includes(topic))
        .map(topic => ({
          topic,
          numPartitions: 1, // Single partition for MacBook optimization
          replicationFactor: 1 // Single replica for development
        }));

      if (topicsToCreate.length > 0) {
        await admin.createTopics({
          topics: topicsToCreate
        });
        console.log(`✅ Created ${topicsToCreate.length} Kafka topics`);
      }
      
      await admin.disconnect();
    } catch (error) {
      console.warn('⚠️ Could not create topics:', error.message);
    }
  }

  async handleIncomingMessage(topic, partition, message) {
    try {
      const data = JSON.parse(message.value.toString());
      const messageKey = message.key?.toString();
      
      this.streamingStats.messagesConsumed++;
      this.streamingStats.lastActivity = new Date();
      
      console.log(`📨 Received message from ${topic}:`, {
        key: messageKey,
        partition,
        offset: message.offset,
        timestamp: data.timestamp
      });

      // Route message to appropriate handler
      switch (topic) {
        case this.topics.BUDGET_UPDATES:
          await this.handleBudgetUpdate(data);
          break;
        case this.topics.PROJECT_UPDATES:
          await this.handleProjectUpdate(data);
          break;
        case this.topics.COMPLIANCE_ALERTS:
          await this.handleComplianceAlert(data);
          break;
        case this.topics.SYSTEM_METRICS:
          await this.handleSystemMetrics(data);
          break;
        case this.topics.TRANSACTION_STREAM:
          await this.handleTransactionStream(data);
          break;
        case this.topics.RISK_EVENTS:
          await this.handleRiskEvent(data);
          break;
        case this.topics.ETL_EVENTS:
          await this.handleETLEvent(data);
          break;
        case this.topics.SANCTIONS_DATA:
          await this.handleSanctionsData(data);
          break;
        case this.topics.FLAGGED_TRANSACTIONS:
          await this.handleFlaggedTransaction(data);
          break;
        default:
          console.warn(`Unknown topic: ${topic}`);
      }

      // Broadcast to WebSocket clients
      this.broadcastToClients(topic, data);
      
    } catch (error) {
      console.error('Error handling message:', error);
      this.streamingStats.errors++;
    }
  }

  async handleBudgetUpdate(data) {
    console.log('💰 Processing budget update:', data);
    
    // Store in local data store
    this.dataStore.budget.set(data.svp_id || data.id, data);
    
    // Check for alerts
    if (data.utilization_rate > 90) {
      await this.sendAlert('CRITICAL', `Budget utilization at ${data.utilization_rate}% for ${data.department}`);
    } else if (data.utilization_rate > 75) {
      await this.sendAlert('WARNING', `Budget utilization at ${data.utilization_rate}% for ${data.department}`);
    }

    // Emit event for other services
    this.emit('budget_updated', data);
  }

  async handleProjectUpdate(data) {
    console.log('📊 Processing project update:', data);
    
    // Store in local data store
    this.dataStore.projects.set(data.project_id || data.id, data);
    
    // Check for project risks
    if (data.risk_score > 80) {
      await this.sendAlert('HIGH', `Project ${data.project_name} has high risk score: ${data.risk_score}`);
    }

    // Check for budget overruns
    if (data.budget_utilization > 100) {
      await this.sendAlert('CRITICAL', `Project ${data.project_name} is over budget: ${data.budget_utilization}%`);
    }

    // Emit event for other services
    this.emit('project_updated', data);
  }

  async handleComplianceAlert(data) {
    console.log('⚠️ Processing compliance alert:', data);
    
    // Store alert
    this.dataStore.alerts.push({
      ...data,
      type: 'compliance',
      timestamp: new Date()
    });
    
    // Immediate notification for critical alerts
    if (data.severity === 'CRITICAL') {
      await this.sendImmediateNotification(data);
    }

    // Emit event for other services
    this.emit('compliance_alert', data);
  }

  async handleTransactionStream(data) {
    console.log('💳 Processing transaction stream:', data);
    
    // Process transaction (simulation)
    await this.processTransaction(data);
    
    // Real-time analytics
    await this.updateTransactionAnalytics(data);

    // Emit event for other services
    this.emit('transaction_processed', data);
  }

  async handleRiskEvent(data) {
    console.log('🚨 Processing risk event:', data);
    
    // Store risk event
    this.dataStore.alerts.push({
      ...data,
      type: 'risk',
      timestamp: new Date()
    });
    
    // Trigger risk assessment
    await this.triggerRiskAssessment(data);

    // Emit event for other services
    this.emit('risk_event', data);
  }

  async handleSystemMetrics(data) {
    console.log('📊 Processing system metrics:', data);
    
    // Store system metrics
    this.dataStore.alerts.push({
      ...data,
      type: 'system_metrics',
      timestamp: new Date()
    });
    
    // Check for system alerts
    if (data.cpu_usage > 90) {
      await this.sendAlert('CRITICAL', `High CPU usage: ${data.cpu_usage}%`);
    } else if (data.memory_usage > 85) {
      await this.sendAlert('WARNING', `High memory usage: ${data.memory_usage}%`);
    }

    // Emit event for other services
    this.emit('system_metrics', data);
  }

  async handleETLEvent(data) {
    console.log('🔄 Processing ETL event:', data);
    
    // Handle ETL pipeline events
    if (data.eventType === 'pipeline_completed') {
      console.log(`✅ ETL Pipeline ${data.pipeline} completed with ${data.recordsProcessed} records`);
    } else if (data.eventType === 'pipeline_failed') {
      await this.sendAlert('ERROR', `ETL Pipeline ${data.pipeline} failed: ${data.error}`);
    }

    // Emit event for other services
    this.emit('etl_event', data);
  }

  async handleSanctionsData(data) {
    console.log('🛡️ Processing sanctions data:', data);
    
    // Store sanctions data
    if (!this.dataStore.sanctions) {
      this.dataStore.sanctions = new Map();
    }
    this.dataStore.sanctions.set(data.id, data);
    
    // Check for potential matches or alerts (basic implementation)
    if (data.sanctions && data.sanctions.length > 0) {
      await this.sendAlert('WARNING', `Sanctioned entity detected: ${data.name} (${data.sanctions.join(', ')})`);
    }

    // Emit event for other services
    this.emit('sanctions_data', data);
  }

  async handleFlaggedTransaction(data) {
    console.log('🚨 Processing flagged transaction:', data);
    
    // Store flagged transaction
    if (!this.dataStore.flaggedTransactions) {
      this.dataStore.flaggedTransactions = [];
    }
    this.dataStore.flaggedTransactions.push({
      ...data,
      type: 'flagged_transaction',
      timestamp: new Date()
    });
    
    // Immediate notification for flagged transactions
    await this.sendImmediateNotification(data);

    // Emit event for other services
    this.emit('flagged_transaction', data);
  }

  // Production method to send data to Kafka
  async sendToStream(topic, data, key = null) {
    try {
      if (this.simulationMode) {
        // Simulate message sending
        console.log(`🎭 Simulated send to ${topic}:`, { key: key || data.id });
        this.streamingStats.messagesProduced++;
        
        // Simulate processing delay
        setTimeout(() => {
          this.handleIncomingMessage(topic, 0, {
            key: Buffer.from(key || data.id || Date.now().toString()),
            value: Buffer.from(JSON.stringify({
              ...data,
              timestamp: new Date().toISOString(),
              source: 'citi-dashboard'
            })),
            offset: this.streamingStats.messagesProduced
          });
        }, 100);
        
        return;
      }

      const message = {
        topic,
        messages: [{
          key: key || data.id || Date.now().toString(),
          value: JSON.stringify({
            ...data,
            timestamp: new Date().toISOString(),
            source: 'citi-dashboard'
          })
        }]
      };

      await this.producer.send(message);
      this.streamingStats.messagesProduced++;
      
      console.log(`✅ Sent message to ${topic}:`, { key: message.messages[0].key });
      
    } catch (error) {
      console.error(`❌ Failed to send message to ${topic}:`, error);
      this.streamingStats.errors++;
      throw error;
    }
  }

  // Broadcast to WebSocket clients
  broadcastToClients(topic, data) {
    if (this.webSocketServer) {
      // Broadcast to dashboard-updates room
      this.webSocketServer.to('dashboard-updates').emit('stream-update', {
        topic,
        data,
        timestamp: new Date().toISOString()
      });
      
      // Also emit specific event types for backward compatibility
      switch (topic) {
        case this.topics.BUDGET_UPDATES:
          this.webSocketServer.to('dashboard-updates').emit('budget-update', data);
          break;
        case this.topics.PROJECT_UPDATES:
          this.webSocketServer.to('dashboard-updates').emit('project-update', data);
          break;
        case this.topics.COMPLIANCE_ALERTS:
          this.webSocketServer.to('dashboard-updates').emit('compliance-update', data);
          break;
        case this.topics.RISK_EVENTS:
          this.webSocketServer.to('dashboard-updates').emit('risk-update', data);
          break;
        case this.topics.TRANSACTION_STREAM:
          this.webSocketServer.to('dashboard-updates').emit('activity-update', data);
          break;
        case this.topics.SANCTIONS_DATA:
          this.webSocketServer.to('dashboard-updates').emit('sanctions-update', data);
          break;
        case this.topics.FLAGGED_TRANSACTIONS:
          this.webSocketServer.to('dashboard-updates').emit('flagged-transaction', data);
          break;
      }
      
      console.log(`📡 Broadcasted ${topic} update to WebSocket clients`);
    }
  }

  setWebSocketServer(server) {
    this.webSocketServer = server;
    console.log('📡 WebSocket server connected to Kafka streaming');
  }

  async sendAlert(severity, message) {
    const alert = {
      id: Date.now().toString(),
      severity,
      message,
      timestamp: new Date().toISOString(),
      source: 'kafka-streaming'
    };

    // Send to compliance alerts topic
    await this.sendToStream(this.topics.COMPLIANCE_ALERTS, alert);
    
    console.log(`🚨 Alert sent [${severity}]: ${message}`);
  }

  async sendImmediateNotification(data) {
    console.log('🚨 IMMEDIATE NOTIFICATION:', data);
    
    // Broadcast immediately to WebSocket
    this.broadcastToClients('immediate-alert', data);
    
    // Could integrate with email/SMS services here
  }

  async processTransaction(data) {
    // Simulate transaction processing
    console.log('💳 Transaction processed:', {
      id: data.id,
      amount: data.amount,
      type: data.type
    });
  }

  async updateTransactionAnalytics(data) {
    // Simulate analytics update
    console.log('📈 Transaction analytics updated');
  }

  async triggerRiskAssessment(data) {
    // Simulate risk assessment
    console.log('🔍 Risk assessment triggered for:', data.type);
  }

  startHealthCheck() {
    setInterval(() => {
      this.checkKafkaHealth();
    }, 30000); // Check every 30 seconds
  }

  async checkKafkaHealth() {
    try {
      if (this.simulationMode) {
        console.log('📊 Kafka Health Check (Simulation Mode):', {
          connected: this.isConnected,
          mode: 'simulation',
          stats: this.streamingStats
        });
        return;
      }

      const admin = this.kafka.admin();
      await admin.connect();
      
      // Check topics
      const topics = await admin.listTopics();
      console.log('📊 Kafka Health Check:', {
        connected: this.isConnected,
        topics: topics.length,
        stats: this.streamingStats
      });
      
      await admin.disconnect();
    } catch (error) {
      console.error('❌ Kafka health check failed:', error.message);
      this.streamingStats.errors++;
    }
  }

  getStreamingStats() {
    return {
      ...this.streamingStats,
      isConnected: this.isConnected,
      simulationMode: this.simulationMode || false,
      topics: Object.keys(this.topics).length,
      dataStore: {
        budget: this.dataStore.budget.size,
        projects: this.dataStore.projects.size,
        alerts: this.dataStore.alerts.length
      }
    };
  }

  // Get stored data for dashboard
  getBudgetData() {
    return Array.from(this.dataStore.budget.values());
  }

  getProjectData() {
    return Array.from(this.dataStore.projects.values());
  }

  getAlerts(limit = 10) {
    return this.dataStore.alerts
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
  }

  getSanctionsData(limit = 100) {
    return Array.from(this.dataStore.sanctions?.values() || []).slice(0, limit);
  }

  getFlaggedTransactions(limit = 50) {
    return (this.dataStore.flaggedTransactions || [])
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
  }

  async disconnect() {
    try {
      if (!this.simulationMode) {
        await this.consumer.disconnect();
        await this.producer.disconnect();
      }
      if (this.sanctionsProducer) {
        await this.sanctionsProducer.stop();
      }
      if (this.sanctionsMatcher) {
        await this.sanctionsMatcher.stop();
      }
      this.isConnected = false;
      console.log('✅ Kafka Streaming Service disconnected');
    } catch (error) {
      console.error('❌ Error disconnecting Kafka:', error);
    }
  }

  // Integration with ETL system
  connectToETL(etlController) {
    console.log('🔗 Connecting Kafka streaming to ETL system...');
    
    // Listen to ETL events and stream them
    if (etlController.scheduler) {
      etlController.scheduler.setBroadcastFunction((event) => {
        this.sendToStream(this.topics.ETL_EVENTS, event);
      });
    }
    
    console.log('✅ Kafka streaming connected to ETL system');
  }
}

module.exports = KafkaStreamingService;
