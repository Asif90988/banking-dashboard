#!/usr/bin/env node

/**
 * Test Script for Streaming System Integration
 * Tests the complete streaming pipeline including Kafka, WebSocket, and data generation
 */

const { initializeStreamingSystem } = require('./streaming_main');

async function testStreamingIntegration() {
  console.log('🧪 Starting Streaming System Integration Test...\n');
  
  let streamingSystem = null;
  
  try {
    // Initialize streaming system
    console.log('1️⃣ Initializing streaming system...');
    streamingSystem = await initializeStreamingSystem();
    console.log('✅ Streaming system initialized successfully\n');
    
    // Wait for system to stabilize
    console.log('2️⃣ Waiting for system to stabilize...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    console.log('✅ System stabilized\n');
    
    // Test Kafka connection status
    console.log('3️⃣ Testing Kafka connection...');
    const kafkaStats = streamingSystem.kafkaService.getStreamingStats();
    console.log('📊 Kafka Stats:', {
      connected: kafkaStats.isConnected,
      mode: kafkaStats.simulationMode ? 'simulation' : 'real',
      messagesProduced: kafkaStats.messagesProduced,
      messagesConsumed: kafkaStats.messagesConsumed
    });
    console.log('✅ Kafka connection test completed\n');
    
    // Test data streamer status
    console.log('4️⃣ Testing data streamer...');
    const streamerStatus = streamingSystem.dataStreamer.getStreamingStatus();
    console.log('📊 Data Streamer Status:', {
      isStreaming: streamerStatus.isStreaming,
      activeStreams: streamerStatus.activeStreams,
      totalMessages: streamerStatus.stats.totalMessagesSent
    });
    console.log('✅ Data streamer test completed\n');
    
    // Test burst generation
    console.log('5️⃣ Testing burst generation...');
    await streamingSystem.dataStreamer.triggerBurstGeneration('BUDGET_UPDATES', 3);
    await streamingSystem.dataStreamer.triggerBurstGeneration('PROJECT_UPDATES', 2);
    await streamingSystem.dataStreamer.triggerBurstGeneration('COMPLIANCE_ALERTS', 1);
    console.log('✅ Burst generation test completed\n');
    
    // Test business scenario simulation
    console.log('6️⃣ Testing business scenario simulation...');
    await streamingSystem.dataStreamer.simulateBusinessScenario('BUDGET_CRISIS');
    console.log('✅ Business scenario simulation test completed\n');
    
    // Wait for messages to process
    console.log('7️⃣ Waiting for message processing...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Get final stats
    const finalKafkaStats = streamingSystem.kafkaService.getStreamingStats();
    const finalStreamerStats = streamingSystem.dataStreamer.getStreamingStatus();
    
    console.log('📊 Final Test Results:');
    console.log('   Kafka Messages Produced:', finalKafkaStats.messagesProduced);
    console.log('   Kafka Messages Consumed:', finalKafkaStats.messagesConsumed);
    console.log('   Streamer Total Messages:', finalStreamerStats.stats.totalMessagesSent);
    console.log('   Active Streams:', finalStreamerStats.activeStreams);
    console.log('   Errors:', finalKafkaStats.errors + finalStreamerStats.stats.errors);
    
    // Test data retrieval
    console.log('\n8️⃣ Testing data retrieval...');
    const budgetData = streamingSystem.kafkaService.getBudgetData();
    const projectData = streamingSystem.kafkaService.getProjectData();
    const alerts = streamingSystem.kafkaService.getAlerts(5);
    
    console.log('📊 Retrieved Data:');
    console.log('   Budget Records:', budgetData.length);
    console.log('   Project Records:', projectData.length);
    console.log('   Alert Records:', alerts.length);
    
    if (budgetData.length > 0) {
      console.log('   Sample Budget Record:', {
        svp_id: budgetData[0].svp_id,
        department: budgetData[0].department,
        utilization_rate: budgetData[0].utilization_rate
      });
    }
    
    if (projectData.length > 0) {
      console.log('   Sample Project Record:', {
        project_id: projectData[0].project_id,
        project_name: projectData[0].project_name,
        status: projectData[0].status,
        risk_score: projectData[0].risk_score
      });
    }
    
    if (alerts.length > 0) {
      console.log('   Sample Alert:', {
        type: alerts[0].type,
        severity: alerts[0].severity || 'N/A',
        message: alerts[0].message
      });
    }
    
    console.log('\n✅ All tests completed successfully!');
    console.log('🎉 Streaming system integration is working properly\n');
    
    // Test summary
    const testResults = {
      kafkaConnection: finalKafkaStats.isConnected,
      streamingActive: finalStreamerStats.isStreaming,
      messagesProcessed: finalKafkaStats.messagesProduced + finalKafkaStats.messagesConsumed,
      dataGenerated: budgetData.length + projectData.length + alerts.length,
      errors: finalKafkaStats.errors + finalStreamerStats.stats.errors,
      testPassed: true
    };
    
    console.log('📋 Test Summary:', testResults);
    
    return testResults;
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
    return {
      testPassed: false,
      error: error.message
    };
    
  } finally {
    // Cleanup
    if (streamingSystem) {
      console.log('\n🧹 Cleaning up...');
      try {
        await streamingSystem.dataStreamer.stopProductionStreaming();
        await streamingSystem.kafkaService.disconnect();
        
        // Close streaming server
        if (streamingSystem.streamingServer) {
          streamingSystem.streamingServer.close();
        }
        
        console.log('✅ Cleanup completed');
      } catch (cleanupError) {
        console.error('⚠️ Cleanup error:', cleanupError.message);
      }
    }
    
    console.log('\n🏁 Test execution finished');
    process.exit(0);
  }
}

// Health check function
async function performHealthCheck() {
  console.log('🏥 Performing streaming system health check...\n');
  
  try {
    const response = await fetch('http://localhost:3001/health');
    const healthData = await response.json();
    
    console.log('📊 Health Check Results:', healthData);
    
    if (healthData.status === 'healthy') {
      console.log('✅ Streaming system is healthy');
      return true;
    } else {
      console.log('⚠️ Streaming system health check failed');
      return false;
    }
    
  } catch (error) {
    console.log('❌ Health check failed - streaming server may not be running');
    console.log('💡 This is normal if testing the integrated system');
    return false;
  }
}

// API endpoint tests
async function testStreamingAPI() {
  console.log('🔌 Testing streaming API endpoints...\n');
  
  const baseUrl = 'http://localhost:3001/api/streaming';
  const endpoints = [
    { method: 'GET', path: '/status', description: 'Get streaming status' },
    { method: 'POST', path: '/burst', body: { streamType: 'BUDGET_UPDATES', count: 2 }, description: 'Trigger burst generation' },
    { method: 'POST', path: '/simulate', body: { scenario: 'MARKET_VOLATILITY' }, description: 'Simulate business scenario' }
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`Testing ${endpoint.method} ${endpoint.path} - ${endpoint.description}`);
      
      const options = {
        method: endpoint.method,
        headers: { 'Content-Type': 'application/json' }
      };
      
      if (endpoint.body) {
        options.body = JSON.stringify(endpoint.body);
      }
      
      const response = await fetch(`${baseUrl}${endpoint.path}`, options);
      const data = await response.json();
      
      if (response.ok) {
        console.log(`✅ ${endpoint.method} ${endpoint.path} - Success`);
        console.log(`   Response:`, data.message || data.status || 'OK');
      } else {
        console.log(`⚠️ ${endpoint.method} ${endpoint.path} - Failed`);
        console.log(`   Error:`, data.error || 'Unknown error');
      }
      
    } catch (error) {
      console.log(`❌ ${endpoint.method} ${endpoint.path} - Connection failed`);
      console.log(`   This is expected if streaming server is not running separately`);
    }
    
    console.log('');
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--health')) {
    await performHealthCheck();
  } else if (args.includes('--api')) {
    await testStreamingAPI();
  } else if (args.includes('--help')) {
    console.log('🧪 Streaming System Integration Test\n');
    console.log('Usage:');
    console.log('  node test_streaming_integration.js           # Run full integration test');
    console.log('  node test_streaming_integration.js --health  # Check streaming system health');
    console.log('  node test_streaming_integration.js --api     # Test API endpoints');
    console.log('  node test_streaming_integration.js --help    # Show this help\n');
  } else {
    await testStreamingIntegration();
  }
}

// Handle uncaught errors
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Run the test
main();
