const KafkaStreamingService = require('./services/streaming/KafkaStreamingService');
const StreamingDataGenerator = require('./services/streaming/StreamingDataGenerator');

async function testStreamingSystem() {
  console.log('🧪 Testing Kafka Streaming System...\n');

  try {
    // Initialize Kafka streaming service
    console.log('1. Initializing Kafka Streaming Service...');
    const kafkaService = new KafkaStreamingService();
    await kafkaService.initialize();
    
    // Initialize streaming data generator
    console.log('\n2. Initializing Streaming Data Generator...');
    const dataGenerator = new StreamingDataGenerator(kafkaService);
    
    // Test individual event generation
    console.log('\n3. Testing Individual Event Generation...');
    
    console.log('💰 Generating budget update...');
    await dataGenerator.generateBudgetUpdate();
    
    console.log('📊 Generating project update...');
    await dataGenerator.generateProjectUpdate();
    
    console.log('⚠️ Generating compliance alert...');
    await dataGenerator.generateComplianceAlert();
    
    console.log('💳 Generating transaction event...');
    await dataGenerator.generateTransactionEvent();
    
    console.log('🚨 Generating risk event...');
    await dataGenerator.generateRiskEvent();
    
    // Wait for events to process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test burst generation
    console.log('\n4. Testing Burst Generation...');
    await dataGenerator.generateBurst('budget', 5);
    
    // Wait for burst to process
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Test business scenarios
    console.log('\n5. Testing Business Scenarios...');
    
    console.log('💥 Testing budget crisis scenario...');
    await dataGenerator.simulateBusinessScenario('budget_crisis');
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('⏰ Testing project deadline scenario...');
    await dataGenerator.simulateBusinessScenario('project_deadline');
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Test streaming mode (brief)
    console.log('\n6. Testing Real-time Streaming Mode...');
    dataGenerator.startStreaming({
      budgetInterval: 5000,    // 5 seconds
      projectInterval: 7000,   // 7 seconds
      complianceInterval: 10000, // 10 seconds
      transactionInterval: 2000, // 2 seconds
      riskInterval: 8000       // 8 seconds
    });
    
    console.log('⏰ Streaming for 15 seconds...');
    await new Promise(resolve => setTimeout(resolve, 15000));
    
    dataGenerator.stopStreaming();
    
    // Get statistics
    console.log('\n7. System Statistics...');
    
    const streamingStats = kafkaService.getStreamingStats();
    console.log('📊 Kafka Streaming Stats:', streamingStats);
    
    const generatorStats = dataGenerator.getStreamingStats();
    console.log('📈 Data Generator Stats:', generatorStats);
    
    // Test data retrieval
    console.log('\n8. Testing Data Retrieval...');
    
    const budgetData = kafkaService.getBudgetData();
    console.log(`💰 Budget data stored: ${budgetData.length} records`);
    
    const projectData = kafkaService.getProjectData();
    console.log(`📊 Project data stored: ${projectData.length} records`);
    
    const alerts = kafkaService.getAlerts(5);
    console.log(`🚨 Recent alerts: ${alerts.length} alerts`);
    
    // Display sample data
    if (budgetData.length > 0) {
      console.log('\n📋 Sample Budget Data:');
      console.log(budgetData[0]);
    }
    
    if (projectData.length > 0) {
      console.log('\n📋 Sample Project Data:');
      console.log(projectData[0]);
    }
    
    if (alerts.length > 0) {
      console.log('\n📋 Sample Alert:');
      console.log(alerts[0]);
    }
    
    // Test WebSocket simulation
    console.log('\n9. Testing WebSocket Integration...');
    
    // Simulate WebSocket server
    const mockWebSocketServer = {
      emit: (event, data) => {
        console.log(`📡 WebSocket Event: ${event}`, {
          topic: data.topic,
          timestamp: data.timestamp,
          dataKeys: Object.keys(data.data)
        });
      }
    };
    
    kafkaService.setWebSocketServer(mockWebSocketServer);
    
    // Generate some events to test WebSocket broadcasting
    await dataGenerator.generateBudgetUpdate();
    await dataGenerator.generateProjectUpdate();
    
    // Wait for WebSocket events
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('\n✅ Kafka Streaming System Test Completed Successfully!');
    
    // Performance summary
    console.log('\n📊 Performance Summary:');
    console.log(`   Messages Produced: ${streamingStats.messagesProduced}`);
    console.log(`   Messages Consumed: ${streamingStats.messagesConsumed}`);
    console.log(`   Errors: ${streamingStats.errors}`);
    console.log(`   Simulation Mode: ${streamingStats.simulationMode}`);
    console.log(`   Data Store - Budget: ${streamingStats.dataStore.budget}`);
    console.log(`   Data Store - Projects: ${streamingStats.dataStore.projects}`);
    console.log(`   Data Store - Alerts: ${streamingStats.dataStore.alerts}`);
    
    // Clean up
    await kafkaService.disconnect();
    
  } catch (error) {
    console.error('❌ Streaming System Test Failed:', error.message);
    console.error(error.stack);
  }
}

// Advanced test scenarios
async function testAdvancedScenarios() {
  console.log('\n🚀 Testing Advanced Streaming Scenarios...\n');
  
  try {
    const kafkaService = new KafkaStreamingService();
    await kafkaService.initialize();
    
    const dataGenerator = new StreamingDataGenerator(kafkaService);
    
    // Test all business scenarios
    const scenarios = ['budget_crisis', 'project_deadline', 'compliance_audit', 'market_volatility'];
    
    for (const scenario of scenarios) {
      console.log(`🎭 Testing scenario: ${scenario}`);
      await dataGenerator.simulateBusinessScenario(scenario);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    // Test high-volume burst
    console.log('\n⚡ Testing high-volume data burst...');
    await dataGenerator.generateBurst('all', 20);
    
    // Test different event types
    console.log('\n🔄 Testing different event types...');
    await dataGenerator.generateBurst('budget', 5);
    await dataGenerator.generateBurst('project', 5);
    await dataGenerator.generateBurst('compliance', 3);
    await dataGenerator.generateBurst('transaction', 10);
    await dataGenerator.generateBurst('risk', 4);
    
    const finalStats = kafkaService.getStreamingStats();
    console.log('\n📊 Final Statistics:', finalStats);
    
    await kafkaService.disconnect();
    
    console.log('\n✅ Advanced Scenarios Test Completed!');
    
  } catch (error) {
    console.error('❌ Advanced Scenarios Test Failed:', error.message);
  }
}

// Performance test
async function testPerformance() {
  console.log('\n⚡ Testing Streaming Performance...\n');
  
  try {
    const kafkaService = new KafkaStreamingService();
    await kafkaService.initialize();
    
    const dataGenerator = new StreamingDataGenerator(kafkaService);
    
    const startTime = Date.now();
    
    // Generate 100 events as fast as possible
    console.log('🚀 Generating 100 events for performance test...');
    await dataGenerator.generateBurst('all', 100);
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    const eventsPerSecond = Math.round(100 / (duration / 1000));
    
    console.log(`⚡ Performance Results:`);
    console.log(`   Duration: ${duration}ms`);
    console.log(`   Events per second: ${eventsPerSecond}`);
    console.log(`   Average time per event: ${duration / 100}ms`);
    
    const stats = kafkaService.getStreamingStats();
    console.log(`   Total messages: ${stats.messagesProduced + stats.messagesConsumed}`);
    console.log(`   Errors: ${stats.errors}`);
    
    await kafkaService.disconnect();
    
    console.log('\n✅ Performance Test Completed!');
    
  } catch (error) {
    console.error('❌ Performance Test Failed:', error.message);
  }
}

// Run tests based on command line arguments
async function runTests() {
  const args = process.argv.slice(2);
  
  if (args.includes('--advanced')) {
    await testAdvancedScenarios();
  } else if (args.includes('--performance')) {
    await testPerformance();
  } else if (args.includes('--all')) {
    await testStreamingSystem();
    await testAdvancedScenarios();
    await testPerformance();
  } else {
    await testStreamingSystem();
  }
}

// Run the tests
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  testStreamingSystem,
  testAdvancedScenarios,
  testPerformance
};
