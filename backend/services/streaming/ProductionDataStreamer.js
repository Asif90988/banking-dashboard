const KafkaStreamingService = require('./KafkaStreamingService');
const DataGenerator = require('../etl/DataGenerator');

class ProductionDataStreamer {
  constructor(kafkaService) {
    this.kafkaService = kafkaService;
    this.dataGenerator = new DataGenerator();
    this.streamingIntervals = new Map();
    this.isStreaming = false;
    this.streamingStats = {
      totalMessagesSent: 0,
      startTime: null,
      lastActivity: null,
      errors: 0
    };
    
    // Production-grade streaming configurations
    this.streamConfigs = {
      BUDGET_UPDATES: {
        interval: 300000, // 5 minutes
        batchSize: 5,
        enabled: true,
        priority: 'HIGH'
      },
      PROJECT_UPDATES: {
        interval: 180000, // 3 minutes
        batchSize: 3,
        enabled: true,
        priority: 'HIGH'
      },
      COMPLIANCE_ALERTS: {
        interval: 600000, // 10 minutes
        batchSize: 2,
        enabled: true,
        priority: 'CRITICAL'
      },
      TRANSACTION_STREAM: {
        interval: 10000, // 10 seconds
        batchSize: 20,
        enabled: true,
        priority: 'MEDIUM'
      },
      RISK_EVENTS: {
        interval: 900000, // 15 minutes
        batchSize: 1,
        enabled: true,
        priority: 'CRITICAL'
      },
      SYSTEM_METRICS: {
        interval: 30000, // 30 seconds
        batchSize: 10,
        enabled: true,
        priority: 'LOW'
      }
    };

    // VPS-specific configuration
    this.vpsConfig = {
      serverName: process.env.VPS_SERVER_NAME || 'VPS-DataStreamer',
      region: process.env.VPS_REGION || 'LATAM',
      environment: process.env.NODE_ENV || 'production',
      maxConcurrentStreams: 6,
      healthCheckInterval: 60000, // 1 minute
      reconnectAttempts: 5,
      reconnectDelay: 5000
    };
  }

  async startProductionStreaming() {
    console.log('🚀 Starting Production Data Streaming on VPS...');
    console.log(`📍 Server: ${this.vpsConfig.serverName}`);
    console.log(`🌍 Region: ${this.vpsConfig.region}`);
    console.log(`🔧 Environment: ${this.vpsConfig.environment}`);
    
    if (this.isStreaming) {
      console.log('⚠️ Streaming already active');
      return;
    }

    this.isStreaming = true;
    this.streamingStats.startTime = new Date();

    try {
      // Start all enabled streams
      await this.initializeStreams();
      
      // Start health monitoring
      this.startHealthMonitoring();
      
      console.log('✅ All production data streams started successfully');
      console.log('📊 Stream configurations:', this.getActiveStreamSummary());
      
    } catch (error) {
      console.error('❌ Failed to start production streaming:', error);
      this.isStreaming = false;
      throw error;
    }
  }

  async initializeStreams() {
    const streamPromises = [];

    if (this.streamConfigs.BUDGET_UPDATES.enabled) {
      streamPromises.push(this.startBudgetUpdateStream());
    }
    
    if (this.streamConfigs.PROJECT_UPDATES.enabled) {
      streamPromises.push(this.startProjectUpdateStream());
    }
    
    if (this.streamConfigs.COMPLIANCE_ALERTS.enabled) {
      streamPromises.push(this.startComplianceAlertStream());
    }
    
    if (this.streamConfigs.TRANSACTION_STREAM.enabled) {
      streamPromises.push(this.startTransactionStream());
    }
    
    if (this.streamConfigs.RISK_EVENTS.enabled) {
      streamPromises.push(this.startRiskEventStream());
    }
    
    if (this.streamConfigs.SYSTEM_METRICS.enabled) {
      streamPromises.push(this.startSystemMetricsStream());
    }

    await Promise.all(streamPromises);
  }

  startBudgetUpdateStream() {
    const config = this.streamConfigs.BUDGET_UPDATES;
    if (!config.enabled) return;

    console.log(`💰 Starting Budget Updates stream (${config.interval/1000}s intervals, batch size: ${config.batchSize})`);

    const interval = setInterval(async () => {
      try {
        const budgetUpdates = await this.generateBudgetUpdates(config.batchSize);
        
        for (const update of budgetUpdates) {
          await this.kafkaService.sendToStream(
            this.kafkaService.topics.BUDGET_UPDATES,
            {
              ...update,
              vps_source: this.vpsConfig.serverName,
              stream_priority: config.priority
            },
            update.svp_id
          );
        }
        
        this.updateStats(budgetUpdates.length);
        console.log(`💰 [${new Date().toISOString()}] Sent ${budgetUpdates.length} budget updates`);
        
      } catch (error) {
        console.error('❌ Error sending budget updates:', error.message);
        this.streamingStats.errors++;
      }
    }, config.interval);

    this.streamingIntervals.set('BUDGET_UPDATES', interval);
  }

  startProjectUpdateStream() {
    const config = this.streamConfigs.PROJECT_UPDATES;
    if (!config.enabled) return;

    console.log(`📊 Starting Project Updates stream (${config.interval/1000}s intervals, batch size: ${config.batchSize})`);

    const interval = setInterval(async () => {
      try {
        const projectUpdates = await this.generateProjectUpdates(config.batchSize);
        
        for (const update of projectUpdates) {
          await this.kafkaService.sendToStream(
            this.kafkaService.topics.PROJECT_UPDATES,
            {
              ...update,
              vps_source: this.vpsConfig.serverName,
              stream_priority: config.priority
            },
            update.project_id
          );
        }
        
        this.updateStats(projectUpdates.length);
        console.log(`📊 [${new Date().toISOString()}] Sent ${projectUpdates.length} project updates`);
        
      } catch (error) {
        console.error('❌ Error sending project updates:', error.message);
        this.streamingStats.errors++;
      }
    }, config.interval);

    this.streamingIntervals.set('PROJECT_UPDATES', interval);
  }

  startTransactionStream() {
    const config = this.streamConfigs.TRANSACTION_STREAM;
    if (!config.enabled) return;

    console.log(`💳 Starting Transaction stream (${config.interval/1000}s intervals, batch size: ${config.batchSize})`);

    const interval = setInterval(async () => {
      try {
        const transactions = await this.generateTransactions(config.batchSize);
        
        for (const transaction of transactions) {
          await this.kafkaService.sendToStream(
            this.kafkaService.topics.TRANSACTION_STREAM,
            {
              ...transaction,
              vps_source: this.vpsConfig.serverName,
              stream_priority: config.priority
            },
            transaction.transaction_id
          );
        }
        
        this.updateStats(transactions.length);
        console.log(`💳 [${new Date().toISOString()}] Sent ${transactions.length} transactions`);
        
      } catch (error) {
        console.error('❌ Error sending transactions:', error.message);
        this.streamingStats.errors++;
      }
    }, config.interval);

    this.streamingIntervals.set('TRANSACTION_STREAM', interval);
  }

  startComplianceAlertStream() {
    const config = this.streamConfigs.COMPLIANCE_ALERTS;
    if (!config.enabled) return;

    console.log(`⚠️ Starting Compliance Alerts stream (${config.interval/1000}s intervals, batch size: ${config.batchSize})`);

    const interval = setInterval(async () => {
      try {
        const alerts = await this.generateComplianceAlerts(config.batchSize);
        
        for (const alert of alerts) {
          await this.kafkaService.sendToStream(
            this.kafkaService.topics.COMPLIANCE_ALERTS,
            {
              ...alert,
              vps_source: this.vpsConfig.serverName,
              stream_priority: config.priority
            },
            alert.alert_id
          );
        }
        
        this.updateStats(alerts.length);
        console.log(`⚠️ [${new Date().toISOString()}] Sent ${alerts.length} compliance alerts`);
        
      } catch (error) {
        console.error('❌ Error sending compliance alerts:', error.message);
        this.streamingStats.errors++;
      }
    }, config.interval);

    this.streamingIntervals.set('COMPLIANCE_ALERTS', interval);
  }

  startRiskEventStream() {
    const config = this.streamConfigs.RISK_EVENTS;
    if (!config.enabled) return;

    console.log(`🚨 Starting Risk Events stream (${config.interval/1000}s intervals, batch size: ${config.batchSize})`);

    const interval = setInterval(async () => {
      try {
        const riskEvents = await this.generateRiskEvents(config.batchSize);
        
        for (const event of riskEvents) {
          await this.kafkaService.sendToStream(
            this.kafkaService.topics.RISK_EVENTS,
            {
              ...event,
              vps_source: this.vpsConfig.serverName,
              stream_priority: config.priority
            },
            event.event_id
          );
        }
        
        this.updateStats(riskEvents.length);
        console.log(`🚨 [${new Date().toISOString()}] Sent ${riskEvents.length} risk events`);
        
      } catch (error) {
        console.error('❌ Error sending risk events:', error.message);
        this.streamingStats.errors++;
      }
    }, config.interval);

    this.streamingIntervals.set('RISK_EVENTS', interval);
  }

  startSystemMetricsStream() {
    const config = this.streamConfigs.SYSTEM_METRICS;
    if (!config.enabled) return;

    console.log(`📊 Starting System Metrics stream (${config.interval/1000}s intervals, batch size: ${config.batchSize})`);

    const interval = setInterval(async () => {
      try {
        const metrics = await this.generateSystemMetrics(config.batchSize);
        
        for (const metric of metrics) {
          await this.kafkaService.sendToStream(
            this.kafkaService.topics.SYSTEM_METRICS,
            {
              ...metric,
              vps_source: this.vpsConfig.serverName,
              stream_priority: config.priority
            },
            metric.metric_id
          );
        }
        
        this.updateStats(metrics.length);
        console.log(`📊 [${new Date().toISOString()}] Sent ${metrics.length} system metrics`);
        
      } catch (error) {
        console.error('❌ Error sending system metrics:', error.message);
        this.streamingStats.errors++;
      }
    }, config.interval);

    this.streamingIntervals.set('SYSTEM_METRICS', interval);
  }

  async generateBudgetUpdates(count) {
    const updates = [];
    const svps = ['maria-rodriguez', 'carlos-santos', 'ana-gutierrez', 'juan-perez', 'lucia-fernandez'];
    
    for (let i = 0; i < count; i++) {
      const svp = svps[Math.floor(Math.random() * svps.length)];
      const baseAmount = Math.random() * 2000000 + 500000; // $500K - $2.5M
      const spentAmount = baseAmount * (0.3 + Math.random() * 0.6); // 30-90% utilization
      const utilizationRate = (spentAmount / baseAmount) * 100;
      
      updates.push({
        update_id: `budget_${Date.now()}_${i}`,
        svp_id: svp,
        svp_name: this.getSVPName(svp),
        department: this.getDepartmentForSVP(svp),
        allocated_budget: Math.round(baseAmount),
        spent_amount: Math.round(spentAmount),
        remaining_budget: Math.round(baseAmount - spentAmount),
        utilization_rate: Math.round(utilizationRate * 100) / 100,
        budget_status: this.getBudgetStatus(utilizationRate),
        period: this.getCurrentPeriod(),
        fiscal_year: 2024,
        quarter: Math.ceil((new Date().getMonth() + 1) / 3),
        region: this.vpsConfig.region,
        update_type: 'REAL_TIME',
        source: 'VPS_SAP_HANA',
        timestamp: new Date().toISOString(),
        change_reason: this.getBudgetChangeReason()
      });
    }
    
    return updates;
  }

  async generateProjectUpdates(count) {
    const updates = [];
    const statuses = ['IN_PROGRESS', 'AT_RISK', 'ON_TRACK', 'COMPLETED', 'DELAYED'];
    const riskLevels = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
    
    for (let i = 0; i < count; i++) {
      const progress = Math.random() * 100;
      const riskScore = Math.random() * 100;
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const budgetAllocated = Math.round(Math.random() * 800000 + 100000);
      const budgetSpent = Math.round(budgetAllocated * (progress / 100) * (0.8 + Math.random() * 0.4));
      
      updates.push({
        update_id: `project_${Date.now()}_${i}`,
        project_id: `PROJ_${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        project_name: this.generateProjectName(),
        status: status,
        progress_percent: Math.round(progress * 100) / 100,
        risk_score: Math.round(riskScore * 100) / 100,
        risk_level: this.calculateRiskLevel(riskScore),
        budget_allocated: budgetAllocated,
        budget_spent: budgetSpent,
        budget_utilization: Math.round((budgetSpent / budgetAllocated) * 100 * 100) / 100,
        budget_remaining: budgetAllocated - budgetSpent,
        svp_owner: this.getRandomSVP(),
        department: this.getRandomDepartment(),
        team_size: Math.round(Math.random() * 15 + 5),
        milestone_progress: Math.round(Math.random() * 10),
        total_milestones: Math.round(Math.random() * 10 + 5),
        start_date: this.getRandomPastDate(),
        estimated_completion: this.getRandomFutureDate(),
        last_milestone: this.getRandomMilestone(),
        last_updated: new Date().toISOString(),
        update_type: 'PROGRESS',
        source: 'VPS_PROJECT_MANAGEMENT_SYSTEM',
        region: this.vpsConfig.region
      });
    }
    
    return updates;
  }

  async generateTransactions(count) {
    const transactions = [];
    const transactionTypes = ['BUDGET_ALLOCATION', 'EXPENSE', 'TRANSFER', 'ADJUSTMENT', 'INVESTMENT', 'PAYMENT'];
    const currencies = ['USD', 'BRL', 'MXN', 'ARS', 'COP', 'CLP'];
    const channels = ['ONLINE', 'MOBILE', 'ATM', 'BRANCH', 'PHONE', 'API'];
    
    for (let i = 0; i < count; i++) {
      const amount = Math.random() * 500000 + 1000; // $1K - $500K
      const currency = currencies[Math.floor(Math.random() * currencies.length)];
      
      transactions.push({
        transaction_id: `TXN_${Date.now()}_${i}`,
        type: transactionTypes[Math.floor(Math.random() * transactionTypes.length)],
        amount: Math.round(amount * 100) / 100,
        currency: currency,
        exchange_rate: this.getExchangeRate(currency),
        usd_amount: Math.round((amount * this.getExchangeRate(currency)) * 100) / 100,
        department: this.getRandomDepartment(),
        svp_id: this.getRandomSVP(),
        project_id: `PROJ_${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        description: this.generateTransactionDescription(),
        status: this.getTransactionStatus(),
        channel: channels[Math.floor(Math.random() * channels.length)],
        risk_score: Math.round(Math.random() * 100),
        country: this.getRandomCountry(),
        processed_at: new Date().toISOString(),
        source_system: 'VPS_FINANCIAL_CORE',
        region: this.vpsConfig.region
      });
    }
    
    return transactions;
  }

  async generateComplianceAlerts(count) {
    const alerts = [];
    const severities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
    const alertTypes = ['REGULATORY_DEADLINE', 'AUDIT_FINDING', 'POLICY_VIOLATION', 'RISK_THRESHOLD', 'DOCUMENTATION_GAP'];
    const regulations = ['BCRA', 'FATCA', 'CRS', 'AML', 'KYC', 'MiFID II', 'Basel III'];
    
    for (let i = 0; i < count; i++) {
      const severity = severities[Math.floor(Math.random() * severities.length)];
      const alertType = alertTypes[Math.floor(Math.random() * alertTypes.length)];
      
      alerts.push({
        alert_id: `ALERT_${Date.now()}_${i}`,
        type: alertType,
        severity: severity,
        title: this.generateAlertTitle(alertType),
        description: this.generateAlertDescription(alertType),
        department: this.getRandomDepartment(),
        regulation_id: `REG_${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        regulation_name: regulations[Math.floor(Math.random() * regulations.length)],
        due_date: this.generateFutureDate(),
        responsible_person: this.getRandomSVP(),
        status: 'OPEN',
        priority: this.calculatePriority(severity),
        findings_count: Math.round(Math.random() * 5 + 1),
        estimated_effort: Math.round(Math.random() * 40 + 8), // 8-48 hours
        created_at: new Date().toISOString(),
        source: 'VPS_COMPLIANCE_MONITORING_SYSTEM',
        region: this.vpsConfig.region
      });
    }
    
    return alerts;
  }

  async generateRiskEvents(count) {
    const events = [];
    const eventTypes = ['OPERATIONAL_RISK', 'CREDIT_RISK', 'MARKET_RISK', 'REGULATORY_RISK', 'CYBERSECURITY_RISK', 'REPUTATION_RISK'];
    const impactLevels = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
    
    for (let i = 0; i < count; i++) {
      const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
      const impact = impactLevels[Math.floor(Math.random() * impactLevels.length)];
      const probability = Math.round(Math.random() * 100);
      const financialImpact = Math.round(Math.random() * 2000000 + 100000);
      
      events.push({
        event_id: `RISK_${Date.now()}_${i}`,
        type: eventType,
        impact_level: impact,
        probability: probability,
        risk_score: Math.round((probability * this.getImpactMultiplier(impact)) / 100),
        financial_impact: financialImpact,
        currency: 'USD',
        description: this.generateRiskDescription(eventType),
        department: this.getRandomDepartment(),
        owner: this.getRandomSVP(),
        mitigation_plan: this.generateMitigationPlan(eventType),
        status: this.getRiskStatus(),
        detection_method: this.getDetectionMethod(),
        estimated_resolution_time: Math.round(Math.random() * 30 + 1), // 1-30 days
        detected_at: new Date().toISOString(),
        source: 'VPS_RISK_MANAGEMENT_SYSTEM',
        region: this.vpsConfig.region
      });
    }
    
    return events;
  }

  async generateSystemMetrics(count) {
    const metrics = [];
    const metricTypes = ['CPU_USAGE', 'MEMORY_USAGE', 'DISK_USAGE', 'NETWORK_LATENCY', 'API_RESPONSE_TIME', 'DATABASE_CONNECTIONS'];
    const systems = ['SAP-HANA', 'ORACLE-DB', 'API-GATEWAY', 'WEB-SERVER', 'KAFKA-CLUSTER', 'REDIS-CACHE'];
    
    for (let i = 0; i < count; i++) {
      const metricType = metricTypes[Math.floor(Math.random() * metricTypes.length)];
      const system = systems[Math.floor(Math.random() * systems.length)];
      const value = this.generateMetricValue(metricType);
      const threshold = this.getMetricThreshold(metricType);
      
      metrics.push({
        metric_id: `METRIC_${Date.now()}_${i}`,
        type: metricType,
        value: value,
        unit: this.getMetricUnit(metricType),
        threshold: threshold,
        status: this.getMetricStatus(value, threshold),
        system: system,
        server: this.vpsConfig.serverName,
        region: this.vpsConfig.region,
        environment: this.vpsConfig.environment,
        collected_at: new Date().toISOString(),
        source: 'VPS_MONITORING_SYSTEM'
      });
    }
    
    return metrics;
  }

  // Helper methods
  updateStats(messageCount) {
    this.streamingStats.totalMessagesSent += messageCount;
    this.streamingStats.lastActivity = new Date();
  }

  getSVPName(svpId) {
    const names = {
      'maria-rodriguez': 'Maria Rodriguez',
      'carlos-santos': 'Carlos Santos',
      'ana-gutierrez': 'Ana Gutierrez',
      'juan-perez': 'Juan Perez',
      'lucia-fernandez': 'Lucia Fernandez'
    };
    return names[svpId] || 'Unknown SVP';
  }

  getDepartmentForSVP(svp) {
    const mapping = {
      'maria-rodriguez': 'Risk Management',
      'carlos-santos': 'Compliance',
      'ana-gutierrez': 'AML Monitoring',
      'juan-perez': 'Internal Audit',
      'lucia-fernandez': 'Regulatory Affairs'
    };
    return mapping[svp] || 'Unknown Department';
  }

  getBudgetStatus(utilizationRate) {
    if (utilizationRate >= 95) return 'Critical';
    if (utilizationRate >= 85) return 'Over Budget';
    if (utilizationRate >= 75) return 'High Utilization';
    return 'Normal';
  }

  getBudgetChangeReason() {
    const reasons = [
      'Monthly budget review',
      'Project completion',
      'New project allocation',
      'Budget reallocation',
      'Emergency funding',
      'Cost optimization',
      'Regulatory requirement',
      'Market adjustment'
    ];
    return reasons[Math.floor(Math.random() * reasons.length)];
  }

  getCurrentPeriod() {
    const now = new Date();
    const quarter = Math.ceil((now.getMonth() + 1) / 3);
    return `Q${quarter}_${now.getFullYear()}`;
  }

  generateProjectName() {
    const prefixes = ['BCRA', 'KYC', 'AML', 'Risk', 'Compliance', 'Audit', 'Digital', 'Cyber', 'Data'];
    const suffixes = ['Enhancement', 'Update', 'Implementation', 'Monitoring', 'Assessment', 'Review', 'Transformation', 'Integration'];
    
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    const phase = Math.floor(Math.random() * 3) + 1;
    
    return `${prefix} ${suffix} Phase ${phase}`;
  }

  getRandomSVP() {
    const svps = ['maria-rodriguez', 'carlos-santos', 'ana-gutierrez', 'juan-perez', 'lucia-fernandez'];
    return svps[Math.floor(Math.random() * svps.length)];
  }

  getRandomDepartment() {
    const departments = ['Risk Management', 'Compliance', 'AML Monitoring', 'Internal Audit', 'Regulatory Affairs', 'Operations', 'Technology'];
    return departments[Math.floor(Math.random() * departments.length)];
  }

  getRandomMilestone() {
    const milestones = ['Requirements Gathering', 'Design Phase', 'Development', 'Testing', 'User Acceptance', 'Deployment', 'Go-Live', 'Post-Implementation'];
    return milestones[Math.floor(Math.random() * milestones.length)];
  }

  getRandomPastDate() {
    const now = new Date();
    const past = new Date(now.getTime() - (Math.random() * 180 * 24 * 60 * 60 * 1000)); // Last 6 months
    return past.toISOString();
  }

  getRandomFutureDate() {
    const now = new Date();
    const future = new Date(now.getTime() + (Math.random() * 90 * 24 * 60 * 60 * 1000)); // Next 3 months
    return future.toISOString();
  }

  getExchangeRate(currency) {
    const rates = {
      'USD': 1.0,
      'BRL': 0.20,
      'MXN': 0.055,
      'ARS': 0.0011,
      'COP': 0.00025,
      'CLP': 0.0011
    };
    return rates[currency] || 1.0;
  }

  getRandomCountry() {
    const countries = ['Argentina', 'Brazil', 'Chile', 'Colombia', 'Mexico', 'Peru', 'Uruguay'];
    return countries[Math.floor(Math.random() * countries.length)];
  }

  getTransactionStatus() {
    const statuses = ['PROCESSED', 'PENDING', 'FAILED', 'CANCELLED'];
    const weights = [0.8, 0.1, 0.05, 0.05]; // 80% processed, 10% pending, 5% failed, 5% cancelled
    
    const random = Math.random();
    let cumulative = 0;
    
    for (let i = 0; i < statuses.length; i++) {
      cumulative += weights[i];
      if (random <= cumulative) {
        return statuses[i];
      }
    }
    
    return 'PROCESSED';
  }

  calculateRiskLevel(score) {
    if (score >= 80) return 'CRITICAL';
    if (score >= 60) return 'HIGH';
    if (score >= 30) return 'MEDIUM';
    return 'LOW';
  }

  generateFutureDate() {
    const now = new Date();
    const future = new Date(now.getTime() + (Math.random() * 60 * 24 * 60 * 60 * 1000)); // Next 60 days
    return future.toISOString();
  }

  calculatePriority(severity) {
    const mapping = {
      'CRITICAL': 1,
      'HIGH': 2,
      'MEDIUM': 3,
      'LOW': 4
    };
    return mapping[severity] || 4;
  }

  generateAlertTitle(type) {
    const titles = {
      'REGULATORY_DEADLINE': 'Regulatory Deadline Approaching',
      'AUDIT_FINDING': 'Audit Finding Requires Attention',
      'POLICY_VIOLATION': 'Policy Violation Detected',
      'RISK_THRESHOLD': 'Risk Threshold Exceeded',
      'DOCUMENTATION_GAP': 'Documentation Gap Identified'
    };
    return titles[type] || 'Compliance Alert';
  }

  generateAlertDescription(type) {
    const descriptions = {
      'REGULATORY_DEADLINE': 'Immediate action required to maintain compliance with regulatory deadline',
      'AUDIT_FINDING': 'Review and remediation needed within 5 business days',
      'POLICY_VIOLATION': 'Policy violation detected requiring immediate investigation',
      'RISK_THRESHOLD': 'Risk threshold exceeded - escalation to senior management recommended',
      'DOCUMENTATION_GAP': 'Critical documentation missing - update required'
    };
    return descriptions[type] || 'Compliance issue requiring attention';
  }

  generateRiskDescription(type) {
    const descriptions = {
      'OPERATIONAL_RISK': 'Potential operational disruption identified in critical business process',
      'CREDIT_RISK': 'Credit exposure exceeding established limits for counterparty',
      'MARKET_RISK': 'Market volatility impacting portfolio beyond acceptable thresholds',
      'REGULATORY_RISK': 'Regulatory changes affecting current operations and compliance status',
      'CYBERSECURITY_RISK': 'Security vulnerability requiring immediate attention and remediation',
      'REPUTATION_RISK': 'Potential reputation impact from external events or internal issues'
    };
    return descriptions[type] || 'Risk event requiring assessment';
  }

  generateMitigationPlan(type) {
    const plans = {
      'OPERATIONAL_RISK': 'Implement additional controls and monitoring procedures',
      'CREDIT_RISK': 'Conduct thorough credit review and adjust exposure limits',
      'MARKET_RISK': 'Rebalance portfolio and implement hedging strategies',
      'REGULATORY_RISK': 'Update policies and procedures to meet new requirements',
      'CYBERSECURITY_RISK': 'Patch vulnerabilities and enhance security monitoring',
      'REPUTATION_RISK': 'Develop communication strategy and stakeholder engagement plan'
    };
    return plans[type] || 'Develop appropriate mitigation strategy';
  }

  generateTransactionDescription() {
    const descriptions = [
      'Budget allocation for Q4 initiatives',
      'Operational expense payment',
      'Project funding transfer',
      'Regulatory compliance investment',
      'Technology infrastructure upgrade',
      'Risk management system enhancement',
      'Compliance training program funding',
      'Audit remediation costs'
    ];
    return descriptions[Math.floor(Math.random() * descriptions.length)];
  }

  generateMetricValue(type) {
    const ranges = {
      'CPU_USAGE': [10, 90],
      'MEMORY_USAGE': [20, 85],
      'DISK_USAGE': [15, 75],
      'NETWORK_LATENCY': [1, 100],
      'API_RESPONSE_TIME': [50, 2000],
      'DATABASE_CONNECTIONS': [10, 500]
    };
    
    const range = ranges[type] || [0, 100];
    return Math.round((Math.random() * (range[1] - range[0]) + range[0]) * 100) / 100;
  }

  getMetricUnit(type) {
    const units = {
      'CPU_USAGE': '%',
      'MEMORY_USAGE': '%',
      'DISK_USAGE': '%',
      'NETWORK_LATENCY': 'ms',
      'API_RESPONSE_TIME': 'ms',
      'DATABASE_CONNECTIONS': 'connections'
    };
    return units[type] || 'units';
  }

  getMetricThreshold(type) {
    const thresholds = {
      'CPU_USAGE': 80,
      'MEMORY_USAGE': 85,
      'DISK_USAGE': 90,
      'NETWORK_LATENCY': 100,
      'API_RESPONSE_TIME': 1000,
      'DATABASE_CONNECTIONS': 400
    };
    return thresholds[type] || 100;
  }

  getMetricStatus(value, threshold) {
    if (value >= threshold * 0.9) return 'CRITICAL';
    if (value >= threshold * 0.75) return 'WARNING';
    return 'NORMAL';
  }

  getImpactMultiplier(impact) {
    const multipliers = {
      'LOW': 0.25,
      'MEDIUM': 0.5,
      'HIGH': 0.75,
      'CRITICAL': 1.0
    };
    return multipliers[impact] || 0.5;
  }

  getRiskStatus() {
    const statuses = ['ACTIVE', 'MONITORING', 'MITIGATED', 'CLOSED'];
    const weights = [0.4, 0.3, 0.2, 0.1]; // 40% active, 30% monitoring, 20% mitigated, 10% closed
    
    const random = Math.random();
    let cumulative = 0;
    
    for (let i = 0; i < statuses.length; i++) {
      cumulative += weights[i];
      if (random <= cumulative) {
        return statuses[i];
      }
    }
    
    return 'ACTIVE';
  }

  getDetectionMethod() {
    const methods = ['AUTOMATED_MONITORING', 'MANUAL_REVIEW', 'CUSTOMER_REPORT', 'AUDIT_FINDING', 'SYSTEM_ALERT', 'THIRD_PARTY_NOTIFICATION'];
    return methods[Math.floor(Math.random() * methods.length)];
  }

  startHealthMonitoring() {
    const healthInterval = setInterval(() => {
      this.performHealthCheck();
    }, this.vpsConfig.healthCheckInterval);

    this.streamingIntervals.set('HEALTH_CHECK', healthInterval);
  }

  performHealthCheck() {
    const now = new Date();
    const uptime = this.streamingStats.startTime ? 
      Math.round((now - this.streamingStats.startTime) / 1000) : 0;

    const healthStatus = {
      timestamp: now.toISOString(),
      server: this.vpsConfig.serverName,
      region: this.vpsConfig.region,
      environment: this.vpsConfig.environment,
      isStreaming: this.isStreaming,
      activeStreams: this.streamingIntervals.size - 1, // Exclude health check interval
      totalMessagesSent: this.streamingStats.totalMessagesSent,
      errors: this.streamingStats.errors,
      uptime: uptime,
      lastActivity: this.streamingStats.lastActivity,
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage()
    };

    console.log(`🏥 [${now.toISOString()}] Health Check:`, {
      server: healthStatus.server,
      activeStreams: healthStatus.activeStreams,
      totalMessages: healthStatus.totalMessagesSent,
      errors: healthStatus.errors,
      uptime: `${uptime}s`
    });

    // Send health status as a system metric
    if (this.kafkaService && this.isStreaming) {
      this.kafkaService.sendToStream(
        this.kafkaService.topics.SYSTEM_METRICS,
        {
          metric_id: `HEALTH_${Date.now()}`,
          type: 'SYSTEM_HEALTH',
          value: this.isStreaming ? 1 : 0,
          unit: 'status',
          threshold: 1,
          status: this.isStreaming ? 'NORMAL' : 'CRITICAL',
          system: 'VPS_DATA_STREAMER',
          server: this.vpsConfig.serverName,
          region: this.vpsConfig.region,
          environment: this.vpsConfig.environment,
          collected_at: now.toISOString(),
          source: 'VPS_HEALTH_MONITOR',
          health_details: healthStatus
        },
        `HEALTH_${this.vpsConfig.serverName}`
      ).catch(error => {
        console.error('❌ Failed to send health status:', error.message);
      });
    }
  }

  getActiveStreamSummary() {
    const summary = {};
    for (const [streamName, config] of Object.entries(this.streamConfigs)) {
      if (config.enabled) {
        summary[streamName] = {
          interval: `${config.interval/1000}s`,
          batchSize: config.batchSize,
          priority: config.priority
        };
      }
    }
    return summary;
  }

  async stopProductionStreaming() {
    console.log('🛑 Stopping Production Data Streaming...');
    
    this.isStreaming = false;
    
    // Clear all intervals
    for (const [name, interval] of this.streamingIntervals) {
      clearInterval(interval);
      console.log(`✅ Stopped ${name} stream`);
    }
    
    this.streamingIntervals.clear();
    
    const duration = this.streamingStats.startTime ? 
      Math.round((Date.now() - this.streamingStats.startTime.getTime()) / 1000) : 0;
    
    console.log('✅ All production data streams stopped');
    console.log(`📊 Final Stats: ${this.streamingStats.totalMessagesSent} messages sent in ${duration}s`);
  }

  getStreamingStatus() {
    return {
      isStreaming: this.isStreaming,
      activeStreams: this.streamingIntervals.size,
      streamConfigs: this.streamConfigs,
      stats: this.streamingStats,
      vpsConfig: this.vpsConfig
    };
  }

  updateStreamConfig(streamName, config) {
    if (this.streamConfigs[streamName]) {
      this.streamConfigs[streamName] = { ...this.streamConfigs[streamName], ...config };
      console.log(`✅ Updated ${streamName} configuration:`, config);
      
      // If stream is currently running, restart it with new config
      if (this.isStreaming && this.streamingIntervals.has(streamName)) {
        console.log(`🔄 Restarting ${streamName} with new configuration...`);
        clearInterval(this.streamingIntervals.get(streamName));
        this.streamingIntervals.delete(streamName);
        
        // Restart the specific stream
        switch (streamName) {
          case 'BUDGET_UPDATES':
            this.startBudgetUpdateStream();
            break;
          case 'PROJECT_UPDATES':
            this.startProjectUpdateStream();
            break;
          case 'COMPLIANCE_ALERTS':
            this.startComplianceAlertStream();
            break;
          case 'TRANSACTION_STREAM':
            this.startTransactionStream();
            break;
          case 'RISK_EVENTS':
            this.startRiskEventStream();
            break;
          case 'SYSTEM_METRICS':
            this.startSystemMetricsStream();
            break;
        }
      }
    }
  }

  // Remote control methods for MacBook integration
  async triggerBurstGeneration(streamType, count = 10) {
    console.log(`🚀 Triggering burst generation: ${streamType} (${count} events)`);
    
    try {
      switch (streamType) {
        case 'BUDGET_UPDATES':
          const budgetUpdates = await this.generateBudgetUpdates(count);
          for (const update of budgetUpdates) {
            await this.kafkaService.sendToStream(
              this.kafkaService.topics.BUDGET_UPDATES,
              { ...update, burst_mode: true },
              update.svp_id
            );
          }
          break;
          
        case 'PROJECT_UPDATES':
          const projectUpdates = await this.generateProjectUpdates(count);
          for (const update of projectUpdates) {
            await this.kafkaService.sendToStream(
              this.kafkaService.topics.PROJECT_UPDATES,
              { ...update, burst_mode: true },
              update.project_id
            );
          }
          break;
          
        case 'COMPLIANCE_ALERTS':
          const alerts = await this.generateComplianceAlerts(count);
          for (const alert of alerts) {
            await this.kafkaService.sendToStream(
              this.kafkaService.topics.COMPLIANCE_ALERTS,
              { ...alert, burst_mode: true },
              alert.alert_id
            );
          }
          break;
          
        case 'TRANSACTION_STREAM':
          const transactions = await this.generateTransactions(count);
          for (const transaction of transactions) {
            await this.kafkaService.sendToStream(
              this.kafkaService.topics.TRANSACTION_STREAM,
              { ...transaction, burst_mode: true },
              transaction.transaction_id
            );
          }
          break;
          
        case 'RISK_EVENTS':
          const riskEvents = await this.generateRiskEvents(count);
          for (const event of riskEvents) {
            await this.kafkaService.sendToStream(
              this.kafkaService.topics.RISK_EVENTS,
              { ...event, burst_mode: true },
              event.event_id
            );
          }
          break;
      }
      
      this.updateStats(count);
      console.log(`✅ Burst generation completed: ${count} ${streamType} events sent`);
      
    } catch (error) {
      console.error(`❌ Burst generation failed for ${streamType}:`, error.message);
      this.streamingStats.errors++;
    }
  }

  async simulateBusinessScenario(scenario) {
    console.log(`🎭 Simulating business scenario: ${scenario}`);
    
    switch (scenario) {
      case 'BUDGET_CRISIS':
        await this.simulateBudgetCrisis();
        break;
      case 'PROJECT_DEADLINE':
        await this.simulateProjectDeadline();
        break;
      case 'COMPLIANCE_AUDIT':
        await this.simulateComplianceAudit();
        break;
      case 'MARKET_VOLATILITY':
        await this.simulateMarketVolatility();
        break;
      case 'SYSTEM_OUTAGE':
        await this.simulateSystemOutage();
        break;
      default:
        console.log(`❌ Unknown scenario: ${scenario}`);
    }
  }

  async simulateBudgetCrisis() {
    console.log('💥 Simulating budget crisis scenario...');
    
    // Generate multiple high-utilization budget alerts
    for (let i = 0; i < 5; i++) {
      const budgetUpdate = (await this.generateBudgetUpdates(1))[0];
      budgetUpdate.utilization_rate = 95 + Math.random() * 15; // 95-110%
      budgetUpdate.budget_status = 'Critical';
      budgetUpdate.change_reason = 'Budget crisis - immediate review required';
      budgetUpdate.scenario = 'BUDGET_CRISIS';
      
      await this.kafkaService.sendToStream(
        this.kafkaService.topics.BUDGET_UPDATES,
        budgetUpdate,
        budgetUpdate.svp_id
      );
      
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }

  async simulateProjectDeadline() {
    console.log('⏰ Simulating project deadline pressure...');
    
    // Generate multiple at-risk project updates
    for (let i = 0; i < 3; i++) {
      const projectUpdate = (await this.generateProjectUpdates(1))[0];
      projectUpdate.status = 'AT_RISK';
      projectUpdate.risk_score = 80 + Math.random() * 20; // 80-100
      projectUpdate.risk_level = 'CRITICAL';
      projectUpdate.scenario = 'PROJECT_DEADLINE';
      
      await this.kafkaService.sendToStream(
        this.kafkaService.topics.PROJECT_UPDATES,
        projectUpdate,
        projectUpdate.project_id
      );
      
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }

  async simulateComplianceAudit() {
    console.log('📋 Simulating compliance audit scenario...');
    
    // Generate multiple compliance alerts
    for (let i = 0; i < 4; i++) {
      const alert = (await this.generateComplianceAlerts(1))[0];
      alert.severity = 'HIGH';
      alert.type = 'AUDIT_FINDING';
      alert.description = 'Audit finding requires immediate attention';
      alert.scenario = 'COMPLIANCE_AUDIT';
      
      await this.kafkaService.sendToStream(
        this.kafkaService.topics.COMPLIANCE_ALERTS,
        alert,
        alert.alert_id
      );
      
      await new Promise(resolve => setTimeout(resolve, 250));
    }
  }

  async simulateMarketVolatility() {
    console.log('📈 Simulating market volatility scenario...');
    
    // Generate multiple risk events and transactions
    for (let i = 0; i < 6; i++) {
      const riskEvent = (await this.generateRiskEvents(1))[0];
      riskEvent.type = 'MARKET_RISK';
      riskEvent.impact_level = 'HIGH';
      riskEvent.description = 'Market volatility exceeding risk thresholds';
      riskEvent.scenario = 'MARKET_VOLATILITY';
      
      await this.kafkaService.sendToStream(
        this.kafkaService.topics.RISK_EVENTS,
        riskEvent,
        riskEvent.event_id
      );
      
      // Also generate related transactions
      const transaction = (await this.generateTransactions(1))[0];
      transaction.risk_score = 70 + Math.random() * 30; // 70-100
      transaction.type = 'INVESTMENT';
      transaction.scenario = 'MARKET_VOLATILITY';
      
      await this.kafkaService.sendToStream(
        this.kafkaService.topics.TRANSACTION_STREAM,
        transaction,
        transaction.transaction_id
      );
      
      await new Promise(resolve => setTimeout(resolve, 150));
    }
  }

  async simulateSystemOutage() {
    console.log('🚨 Simulating system outage scenario...');
    
    // Generate system metrics showing degraded performance
    for (let i = 0; i < 8; i++) {
      const metric = (await this.generateSystemMetrics(1))[0];
      
      // Simulate degraded performance
      if (metric.type === 'CPU_USAGE') metric.value = 85 + Math.random() * 15;
      if (metric.type === 'MEMORY_USAGE') metric.value = 90 + Math.random() * 10;
      if (metric.type === 'API_RESPONSE_TIME') metric.value = 2000 + Math.random() * 3000;
      
      metric.status = 'CRITICAL';
      metric.scenario = 'SYSTEM_OUTAGE';
      
      await this.kafkaService.sendToStream(
        this.kafkaService.topics.SYSTEM_METRICS,
        metric,
        metric.metric_id
      );
      
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
}

module.exports = ProductionDataStreamer;
