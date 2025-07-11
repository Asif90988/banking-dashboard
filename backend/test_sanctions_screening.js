// test_sanctions_screening.js
require('dotenv').config({ path: './backend/.env' });
const KafkaStreamingService = require('./services/streaming/KafkaStreamingService');
const SanctionsDataProducer = require('./services/streaming/SanctionsDataProducer');
const SanctionsMatcher = require('./services/streaming/SanctionsMatcher');
const logger = require('./utils/logger'); // Assuming a logger utility exists

async function runSanctionsScreeningTest() {
  console.log('🚀 Starting Sanctions Screening Test...');
  
  // Initialize Kafka Streaming Service
  const streamingService = new KafkaStreamingService();
  await streamingService.initialize();
  
  // Wait for initialization to complete
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  if (!streamingService.isConnected) {
    console.error('❌ Kafka Streaming Service failed to initialize');
    return;
  }
  
  console.log('✅ Kafka Streaming Service initialized');
  
  // Simulate test transactions
  console.log('📤 Simulating test transactions...');
  const testTransactions = [
    {
      id: 'TX_TEST_001',
      customerName: 'John Doe', // Should match a common name in sanctions data if present
      amount: 10000,
      currency: 'USD',
      type: 'TRANSFER',
      date: new Date().toISOString()
    },
    {
      id: 'TX_TEST_002',
      customerName: 'Jane Smith', // Unlikely to match
      amount: 5000,
      currency: 'USD',
      type: 'PAYMENT',
      date: new Date().toISOString()
    },
    {
      id: 'TX_TEST_003',
      customerName: 'Test Entity', // Another test case
      amount: 25000,
      currency: 'EUR',
      type: 'TRANSFER',
      date: new Date().toISOString()
    }
  ];
  
  // Send test transactions to the transaction stream
  for (const transaction of testTransactions) {
    await streamingService.sendToStream(streamingService.topics.TRANSACTION_STREAM, transaction);
    console.log(`✅ Sent transaction ${transaction.id} to stream`);
    // Small delay to simulate real-time processing
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Wait for processing
  console.log('⏳ Waiting for sanctions matching results...');
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Check results
  console.log('📊 Test Results:');
  console.log('----------------');
  
  // Get sanctions data
  const sanctionsData = streamingService.getSanctionsData(10);
  console.log(`Sanctions Data Loaded: ${sanctionsData.length} entries`);
  if (sanctionsData.length > 0) {
    console.log('Sample Sanctions Entries:');
    sanctionsData.forEach((entry, index) => {
      console.log(`  ${index + 1}. ${entry.name} (${entry.sanctions?.join(', ') || 'N/A'})`);
    });
  } else {
    console.warn('⚠️ No sanctions data available - API fetch may have failed or rate limits exceeded');
  }
  
  // Get flagged transactions
  const flaggedTransactions = streamingService.getFlaggedTransactions(10);
  console.log(`Flagged Transactions: ${flaggedTransactions.length} matches found`);
  if (flaggedTransactions.length > 0) {
    console.log('Flagged Transaction Details:');
    flaggedTransactions.forEach((tx, index) => {
      console.log(`  ${index + 1}. Transaction ID: ${tx.transactionId}`);
      console.log(`     Matched Entity: ${tx.matchedEntity.name} (${tx.matchedEntity.sanctions.join(', ')})`);
      console.log(`     Match Confidence: ${tx.matchScore}%`);
      console.log(`     Transaction Amount: ${tx.transactionDetails.amount} ${tx.transactionDetails.currency}`);
      console.log(`     Status: ${tx.status}`);
    });
  } else {
    console.warn('⚠️ No transactions were flagged. Possible issues:');
    console.warn('  - Test transaction names may not match any sanctioned entities');
    console.warn('  - Sanctions data may not be loaded (check API connectivity)');
    console.warn('  - Matching threshold may be too high (currently 90%)');
  }
  
  // Summary
  console.log('----------------');
  console.log('📈 Test Summary:');
  console.log(`Transactions Sent: ${testTransactions.length}`);
  console.log(`Sanctions Entries: ${sanctionsData.length}`);
  console.log(`Matches Found: ${flaggedTransactions.length}`);
  console.log('----------------');
  
  // Check if the test passed basic criteria
  if (sanctionsData.length > 0 && flaggedTransactions.length > 0) {
    console.log('✅ TEST PASSED: Sanctions screening system is operational and detected matches');
  } else if (sanctionsData.length > 0) {
    console.log('🟨 TEST PARTIALLY SUCCESSFUL: Sanctions data loaded but no matches found');
  } else {
    console.log('❌ TEST FAILED: No sanctions data loaded - system cannot perform screening');
  }
  
  // Cleanup
  console.log('🧹 Cleaning up...');
  await streamingService.disconnect();
  console.log('✅ Test completed and resources released');
}

// Run the test
runSanctionsScreeningTest().catch(error => {
  console.error('❌ Fatal error during test:', error);
  process.exit(1);
});
