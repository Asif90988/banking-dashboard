const DataGenerator = require('../etl/DataGenerator');

class StreamingDataGenerator extends DataGenerator {
  constructor(kafkaService) {
    super();
    this.kafkaService = kafkaService;
    this.isStreaming = false;
    this.streamingIntervals = new Map();
    this.streamingStats = {
      budgetUpdates: 0,
      projectUpdates: 0,
      complianceAlerts: 0,
      transactionEvents: 0,
      riskEvents: 0,
      startTime: null
    };
  }

  // Start streaming realistic data
  startStreaming(options = {}) {
    if (this.isStreaming) {
      console.log('⚠️ Streaming already active');
      return;
    }

    console.log('🚀 Starting real-time data streaming...');
    this.isStreaming = true;
    this.streamingStats.startTime = new Date();

    const config = {
      budgetInterval: options.budgetInterval || 30000, // 30 seconds
      projectInterval: options.projectInterval || 20000, // 20 seconds
      complianceInterval: options.complianceInterval || 60000, // 1 minute
      transactionInterval: options.transactionInterval || 5000, // 5 seconds
      riskInterval: options.riskInterval || 45000, // 45 seconds
      ...options
    };

    // Start budget updates stream
    this.streamingIntervals.set('budget', setInterval(() => {
      this.generateBudgetUpdate();
    }, config.budgetInterval));

    // Start project updates stream
    this.streamingIntervals.set('project', setInterval(() => {
      this.generateProjectUpdate();
    }, config.projectInterval));

    // Start compliance alerts stream
    this.streamingIntervals.set('compliance', setInterval(() => {
      this.generateComplianceAlert();
    }, config.complianceInterval));

    // Start transaction stream
    this.streamingIntervals.set('transaction', setInterval(() => {
      this.generateTransactionEvent();
    }, config.transactionInterval));

    // Start risk events stream
    this.streamingIntervals.set('risk', setInterval(() => {
      this.generateRiskEvent();
    }, config.riskInterval));

    console.log('✅ Real-time data streaming started with intervals:', config);
  }

  stopStreaming() {
    if (!this.isStreaming) {
      console.log('⚠️ Streaming not active');
      return;
    }

    console.log('🛑 Stopping real-time data streaming...');
    
    // Clear all intervals
    for (const [name, interval] of this.streamingIntervals) {
      clearInterval(interval);
      console.log(`⏹️ Stopped ${name} stream`);
    }
    
    this.streamingIntervals.clear();
    this.isStreaming = false;
    
    const duration = Date.now() - this.streamingStats.startTime.getTime();
    console.log('✅ Streaming stopped. Duration:', Math.round(duration / 1000), 'seconds');
    console.log('📊 Streaming stats:', this.streamingStats);
  }

  async generateBudgetUpdate() {
    try {
      const budgetData = this.createRealisticBudgetUpdate();
      await this.kafkaService.sendToStream(
        this.kafkaService.topics.BUDGET_UPDATES,
        budgetData,
        budgetData.svp_id
      );
      this.streamingStats.budgetUpdates++;
      console.log('💰 Budget update streamed:', budgetData.svp_name);
    } catch (error) {
      console.error('❌ Error generating budget update:', error.message);
    }
  }

  async generateProjectUpdate() {
    try {
      const projectData = this.createRealisticProjectUpdate();
      await this.kafkaService.sendToStream(
        this.kafkaService.topics.PROJECT_UPDATES,
        projectData,
        projectData.project_id
      );
      this.streamingStats.projectUpdates++;
      console.log('📊 Project update streamed:', projectData.project_name);
    } catch (error) {
      console.error('❌ Error generating project update:', error.message);
    }
  }

  async generateComplianceAlert() {
    try {
      const complianceData = this.createRealisticComplianceAlert();
      await this.kafkaService.sendToStream(
        this.kafkaService.topics.COMPLIANCE_ALERTS,
        complianceData,
        complianceData.regulation_id
      );
      this.streamingStats.complianceAlerts++;
      console.log('⚠️ Compliance alert streamed:', complianceData.regulation_name);
    } catch (error) {
      console.error('❌ Error generating compliance alert:', error.message);
    }
  }

  async generateTransactionEvent() {
    try {
      const transactionData = this.createRealisticTransaction();
      await this.kafkaService.sendToStream(
        this.kafkaService.topics.TRANSACTION_STREAM,
        transactionData,
        transactionData.transaction_id
      );
      this.streamingStats.transactionEvents++;
    } catch (error) {
      console.error('❌ Error generating transaction event:', error.message);
    }
  }

  async generateRiskEvent() {
    try {
      const riskData = this.createRealisticRiskEvent();
      await this.kafkaService.sendToStream(
        this.kafkaService.topics.RISK_EVENTS,
        riskData,
        riskData.event_id
      );
      this.streamingStats.riskEvents++;
      console.log('🚨 Risk event streamed:', riskData.risk_type);
    } catch (error) {
      console.error('❌ Error generating risk event:', error.message);
    }
  }

  createRealisticBudgetUpdate() {
    const svpId = `SVP${String(this.getRandomNumber(1, 25)).padStart(3, '0')}`;
    const department = this.getRandomElement(this.departments);
    const svpName = this.getRandomElement(this.svpNames);
    
    // Create realistic budget progression
    const allocatedBudget = this.getRandomBudget(500000, 8000000);
    const utilizationRate = this.getRandomNumber(45, 95);
    const spentAmount = Math.round(allocatedBudget * (utilizationRate / 100));
    const remainingBudget = allocatedBudget - spentAmount;
    
    return {
      svp_id: svpId,
      svp_name: svpName,
      department: department,
      allocated_budget: allocatedBudget,
      spent_amount: spentAmount,
      remaining_budget: remainingBudget,
      utilization_rate: utilizationRate,
      active_projects: this.getRandomNumber(3, 12),
      budget_status: utilizationRate > 90 ? 'Over Budget' : utilizationRate > 75 ? 'High Utilization' : 'Normal',
      last_updated: new Date(),
      fiscal_year: 2024,
      quarter: Math.ceil((new Date().getMonth() + 1) / 3),
      region: 'LATAM',
      cost_center: `CC${String(this.getRandomNumber(1, 100)).padStart(3, '0')}`,
      change_reason: this.getRandomElement([
        'Monthly budget review',
        'Project completion',
        'New project allocation',
        'Budget reallocation',
        'Emergency funding',
        'Cost optimization'
      ])
    };
  }

  createRealisticProjectUpdate() {
    const projectId = `PROJ${String(this.getRandomNumber(1, 500)).padStart(4, '0')}`;
    const projectName = this.getRandomElement(this.projectNames);
    const status = this.getRandomElement(['Active', 'In Progress', 'At Risk', 'Completed']);
    
    // Create realistic project progression
    const budgetAllocated = this.getRandomBudget(50000, 1500000);
    const progressPercent = status === 'Completed' ? 100 : 
                           status === 'At Risk' ? this.getRandomNumber(20, 70) :
                           this.getRandomNumber(10, 90);
    const budgetUtilization = this.getRandomNumber(progressPercent * 0.8, progressPercent * 1.2);
    const budgetSpent = Math.round(budgetAllocated * (budgetUtilization / 100));
    
    return {
      project_id: projectId,
      project_name: `${projectName} Phase ${this.getRandomNumber(1, 3)}`,
      status: status,
      progress_percent: progressPercent,
      budget_allocated: budgetAllocated,
      budget_spent: budgetSpent,
      budget_utilization: budgetUtilization,
      budget_remaining: budgetAllocated - budgetSpent,
      svp_owner: this.getRandomElement(this.svpNames),
      department: this.getRandomElement(this.departments),
      risk_score: this.getRandomNumber(10, 95),
      risk_level: this.getRandomElement(['Low', 'Medium', 'High']),
      team_size: this.getRandomNumber(5, 20),
      start_date: this.getRandomDate(new Date(2024, 0, 1), new Date()),
      estimated_completion: this.getRandomDate(new Date(), new Date(2024, 11, 31)),
      last_milestone: this.getRandomElement([
        'Requirements Gathering',
        'Design Phase',
        'Development',
        'Testing',
        'User Acceptance',
        'Deployment'
      ]),
      update_reason: this.getRandomElement([
        'Weekly status update',
        'Milestone completion',
        'Risk assessment',
        'Budget revision',
        'Resource allocation',
        'Scope change'
      ])
    };
  }

  createRealisticComplianceAlert() {
    const regulationId = `REG${String(this.getRandomNumber(1, 100)).padStart(3, '0')}`;
    const regulationName = this.getRandomElement(this.regulations);
    const riskScore = this.getRandomNumber(60, 95);
    const severity = riskScore > 85 ? 'CRITICAL' : riskScore > 75 ? 'HIGH' : 'MEDIUM';
    
    return {
      regulation_id: regulationId,
      regulation_name: regulationName,
      severity: severity,
      compliance_status: this.getRandomElement(['Non-Compliant', 'Review Required', 'Action Needed']),
      risk_score: riskScore,
      responsible_department: this.getRandomElement(this.departments),
      findings_count: this.getRandomNumber(1, 8),
      due_date: this.getRandomDate(new Date(), new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)),
      alert_type: this.getRandomElement([
        'Audit Finding',
        'Regulatory Change',
        'Deadline Approaching',
        'Risk Threshold Exceeded',
        'Documentation Missing',
        'Training Required'
      ]),
      description: this.getRandomElement([
        'Regulatory compliance threshold exceeded',
        'Audit deadline approaching',
        'Documentation update required',
        'Risk assessment needed',
        'Training certification expired',
        'Policy review overdue'
      ])
    };
  }

  createRealisticTransaction() {
    const transactionTypes = ['Transfer', 'Payment', 'Deposit', 'Withdrawal', 'Investment', 'Loan'];
    const currencies = ['USD', 'ARS', 'BRL', 'CLP', 'COP', 'MXN'];
    
    return {
      transaction_id: `TXN${Date.now()}${this.getRandomNumber(100, 999)}`,
      type: this.getRandomElement(transactionTypes),
      amount: this.getRandomNumber(1000, 5000000),
      currency: this.getRandomElement(currencies),
      from_account: `ACC${this.getRandomNumber(100000, 999999)}`,
      to_account: `ACC${this.getRandomNumber(100000, 999999)}`,
      status: this.getRandomElement(['Pending', 'Completed', 'Failed', 'Processing']),
      risk_score: this.getRandomNumber(1, 100),
      country: this.getRandomElement(['Argentina', 'Brazil', 'Chile', 'Colombia', 'Mexico', 'Peru']),
      channel: this.getRandomElement(['Online', 'Mobile', 'ATM', 'Branch', 'Phone']),
      timestamp: new Date(),
      processing_time_ms: this.getRandomNumber(100, 5000)
    };
  }

  createRealisticRiskEvent() {
    const riskTypes = [
      'Credit Risk', 'Market Risk', 'Operational Risk', 'Liquidity Risk',
      'Compliance Risk', 'Cybersecurity Risk', 'Reputation Risk'
    ];
    
    const eventId = `RISK${Date.now()}${this.getRandomNumber(10, 99)}`;
    const riskType = this.getRandomElement(riskTypes);
    const severity = this.getRandomElement(['Low', 'Medium', 'High', 'Critical']);
    
    return {
      event_id: eventId,
      risk_type: riskType,
      severity: severity,
      risk_score: this.getRandomNumber(30, 95),
      affected_department: this.getRandomElement(this.departments),
      description: this.generateRiskDescription(riskType),
      impact_assessment: this.getRandomElement(['Low', 'Medium', 'High']),
      mitigation_status: this.getRandomElement(['Identified', 'In Progress', 'Mitigated', 'Monitoring']),
      responsible_officer: this.getRandomElement(this.svpNames),
      estimated_loss: this.getRandomBudget(10000, 1000000),
      probability: this.getRandomNumber(10, 80),
      detection_method: this.getRandomElement([
        'Automated Monitoring',
        'Manual Review',
        'Customer Report',
        'Audit Finding',
        'System Alert'
      ])
    };
  }

  generateRiskDescription(riskType) {
    const descriptions = {
      'Credit Risk': [
        'Increased default rates in consumer lending',
        'Corporate client credit rating downgrade',
        'Portfolio concentration risk identified'
      ],
      'Market Risk': [
        'Currency volatility exceeding limits',
        'Interest rate exposure increased',
        'Equity portfolio value at risk'
      ],
      'Operational Risk': [
        'System downtime affecting operations',
        'Process failure in transaction processing',
        'Human error in trade execution'
      ],
      'Liquidity Risk': [
        'Funding gap identified in short-term liquidity',
        'Large withdrawal requests affecting reserves',
        'Market liquidity constraints'
      ],
      'Compliance Risk': [
        'Regulatory requirement not met',
        'AML monitoring alert triggered',
        'Data privacy violation detected'
      ],
      'Cybersecurity Risk': [
        'Suspicious network activity detected',
        'Potential data breach attempt',
        'Malware detected in system'
      ],
      'Reputation Risk': [
        'Negative media coverage impact',
        'Customer complaint escalation',
        'Social media sentiment decline'
      ]
    };
    
    return this.getRandomElement(descriptions[riskType] || ['Risk event detected']);
  }

  // Burst mode - generate multiple events quickly for testing
  async generateBurst(eventType = 'all', count = 10) {
    console.log(`🚀 Generating burst of ${count} ${eventType} events...`);
    
    const promises = [];
    
    for (let i = 0; i < count; i++) {
      if (eventType === 'all' || eventType === 'budget') {
        promises.push(this.generateBudgetUpdate());
      }
      if (eventType === 'all' || eventType === 'project') {
        promises.push(this.generateProjectUpdate());
      }
      if (eventType === 'all' || eventType === 'compliance') {
        promises.push(this.generateComplianceAlert());
      }
      if (eventType === 'all' || eventType === 'transaction') {
        promises.push(this.generateTransactionEvent());
      }
      if (eventType === 'all' || eventType === 'risk') {
        promises.push(this.generateRiskEvent());
      }
      
      // Small delay between events
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    await Promise.all(promises);
    console.log(`✅ Burst generation completed: ${count} events`);
  }

  getStreamingStats() {
    return {
      ...this.streamingStats,
      isStreaming: this.isStreaming,
      activeStreams: this.streamingIntervals.size,
      uptime: this.streamingStats.startTime ? 
        Date.now() - this.streamingStats.startTime.getTime() : 0
    };
  }

  // Simulate realistic business scenarios
  async simulateBusinessScenario(scenario) {
    console.log(`🎭 Simulating business scenario: ${scenario}`);
    
    switch (scenario) {
      case 'budget_crisis':
        await this.simulateBudgetCrisis();
        break;
      case 'project_deadline':
        await this.simulateProjectDeadline();
        break;
      case 'compliance_audit':
        await this.simulateComplianceAudit();
        break;
      case 'market_volatility':
        await this.simulateMarketVolatility();
        break;
      default:
        console.log('Unknown scenario');
    }
  }

  async simulateBudgetCrisis() {
    console.log('💥 Simulating budget crisis scenario...');
    
    // Generate multiple high-utilization budget alerts
    for (let i = 0; i < 5; i++) {
      const budgetData = this.createRealisticBudgetUpdate();
      budgetData.utilization_rate = this.getRandomNumber(95, 110);
      budgetData.budget_status = 'Critical';
      budgetData.change_reason = 'Budget crisis - immediate review required';
      
      await this.kafkaService.sendToStream(
        this.kafkaService.topics.BUDGET_UPDATES,
        budgetData,
        budgetData.svp_id
      );
      
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }

  async simulateProjectDeadline() {
    console.log('⏰ Simulating project deadline pressure...');
    
    // Generate multiple at-risk project updates
    for (let i = 0; i < 3; i++) {
      const projectData = this.createRealisticProjectUpdate();
      projectData.status = 'At Risk';
      projectData.risk_score = this.getRandomNumber(80, 95);
      projectData.update_reason = 'Deadline approaching - urgent action needed';
      
      await this.kafkaService.sendToStream(
        this.kafkaService.topics.PROJECT_UPDATES,
        projectData,
        projectData.project_id
      );
      
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }

  async simulateComplianceAudit() {
    console.log('📋 Simulating compliance audit scenario...');
    
    // Generate multiple compliance alerts
    for (let i = 0; i < 4; i++) {
      const complianceData = this.createRealisticComplianceAlert();
      complianceData.severity = 'HIGH';
      complianceData.alert_type = 'Audit Finding';
      complianceData.description = 'Audit finding requires immediate attention';
      
      await this.kafkaService.sendToStream(
        this.kafkaService.topics.COMPLIANCE_ALERTS,
        complianceData,
        complianceData.regulation_id
      );
      
      await new Promise(resolve => setTimeout(resolve, 250));
    }
  }

  async simulateMarketVolatility() {
    console.log('📈 Simulating market volatility scenario...');
    
    // Generate multiple risk events and transactions
    for (let i = 0; i < 6; i++) {
      const riskData = this.createRealisticRiskEvent();
      riskData.risk_type = 'Market Risk';
      riskData.severity = 'High';
      riskData.description = 'Market volatility exceeding risk thresholds';
      
      await this.kafkaService.sendToStream(
        this.kafkaService.topics.RISK_EVENTS,
        riskData,
        riskData.event_id
      );
      
      // Also generate related transactions
      const transactionData = this.createRealisticTransaction();
      transactionData.risk_score = this.getRandomNumber(70, 95);
      transactionData.type = 'Investment';
      
      await this.kafkaService.sendToStream(
        this.kafkaService.topics.TRANSACTION_STREAM,
        transactionData,
        transactionData.transaction_id
      );
      
      await new Promise(resolve => setTimeout(resolve, 150));
    }
  }
}

module.exports = StreamingDataGenerator;
