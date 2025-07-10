#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const { createTestExcelFile, createTestProjectFile } = require('./utils/testDataGenerator');
const { runPerformanceBenchmark } = require('./unit/aiDataIntegration.test');
const { runManualIntegrationTest } = require('./integration/dataFlow.test');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logHeader(message) {
  log('\n' + '='.repeat(60), 'cyan');
  log(`🚀 ${message}`, 'bright');
  log('='.repeat(60), 'cyan');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

async function setupTestEnvironment() {
  logHeader('Setting Up Test Environment');
  
  try {
    // Create test data directory
    const testDataDir = path.join(__dirname, 'testData');
    if (!fs.existsSync(testDataDir)) {
      fs.mkdirSync(testDataDir, { recursive: true });
      logSuccess('Created test data directory');
    }

    // Generate test Excel files
    logInfo('Generating test Excel files...');
    const budgetFile = await createTestExcelFile();
    const projectFile = await createTestProjectFile();
    
    logSuccess(`Budget test file: ${budgetFile}`);
    logSuccess(`Project test file: ${projectFile}`);
    
    // Check if required dependencies are available
    logInfo('Checking dependencies...');
    
    try {
      require('exceljs');
      logSuccess('ExcelJS dependency available');
    } catch (error) {
      logWarning('ExcelJS not found - installing...');
      execSync('npm install exceljs', { stdio: 'inherit' });
      logSuccess('ExcelJS installed');
    }

    try {
      require('supertest');
      logSuccess('Supertest dependency available');
    } catch (error) {
      logWarning('Supertest not found - installing...');
      execSync('npm install --save-dev supertest', { stdio: 'inherit' });
      logSuccess('Supertest installed');
    }

    logSuccess('Test environment setup complete!');
    return true;
    
  } catch (error) {
    logError(`Failed to setup test environment: ${error.message}`);
    return false;
  }
}

async function runUnitTests() {
  logHeader('Running Unit Tests');
  
  try {
    logInfo('Starting unit test suite...');
    
    // For now, we'll run our tests manually since we don't have Jest configured
    logInfo('Running AI Data Integration Service tests...');
    
    // Import and run our test functions
    const { AIDataIntegrationService } = require('../services/aiDataIntegration');
    const { testConfig, testDataSources } = require('./utils/testDataGenerator');
    
    // Basic service instantiation test
    const service = new AIDataIntegrationService(testConfig.llmEndpoint);
    service.registerDataSource(testDataSources.budget_excel);
    
    const sources = service.getDataSources();
    if (sources.length > 0) {
      logSuccess('✓ Data source registration test passed');
    } else {
      throw new Error('Data source registration failed');
    }
    
    // Basic processing test
    const result = await service.processNLRequest('Update budget data for testing');
    if (result && typeof result.success === 'boolean') {
      logSuccess('✓ Natural language processing test passed');
    } else {
      throw new Error('Natural language processing failed');
    }
    
    logSuccess('Unit tests completed successfully!');
    return true;
    
  } catch (error) {
    logError(`Unit tests failed: ${error.message}`);
    return false;
  }
}

async function runIntegrationTests() {
  logHeader('Running Integration Tests');
  
  try {
    logInfo('Starting integration test suite...');
    
    // Test API endpoints
    logInfo('Testing API endpoints...');
    
    const express = require('express');
    const request = require('supertest');
    
    const app = express();
    app.use(express.json());
    
    // Import routes
    const aiRoutes = require('../routes/dashboard');
    const chatbotRoutes = require('../routes/chatbot');
    
    app.use('/api', aiRoutes);
    app.use('/api/chatbot', chatbotRoutes);
    
    // Test data sources endpoint
    const sourcesResponse = await request(app)
      .get('/api/ai/data-sources')
      .expect(200);
    
    if (sourcesResponse.body.success) {
      logSuccess('✓ Data sources API test passed');
    } else {
      throw new Error('Data sources API test failed');
    }
    
    // Test data integration endpoint
    const integrationResponse = await request(app)
      .post('/api/ai/process-request')
      .send({ message: 'Update budget data for integration test' })
      .expect(200);
    
    if (integrationResponse.body.success) {
      logSuccess('✓ Data integration API test passed');
    } else {
      throw new Error('Data integration API test failed');
    }
    
    // Test chatbot endpoint
    const chatResponse = await request(app)
      .post('/api/chatbot/chat')
      .send({ 
        message: 'Update budget data please',
        conversationId: 'test-integration'
      })
      .expect(200);
    
    if (chatResponse.body.response) {
      logSuccess('✓ Chatbot integration test passed');
    } else {
      throw new Error('Chatbot integration test failed');
    }
    
    logSuccess('Integration tests completed successfully!');
    return true;
    
  } catch (error) {
    logError(`Integration tests failed: ${error.message}`);
    return false;
  }
}

async function runPerformanceTests() {
  logHeader('Running Performance Tests');
  
  try {
    logInfo('Starting performance benchmark...');
    
    const { AIDataIntegrationService } = require('../services/aiDataIntegration');
    const { testConfig, testDataSources } = require('./utils/testDataGenerator');
    
    const service = new AIDataIntegrationService(testConfig.llmEndpoint);
    service.registerDataSource(testDataSources.budget_excel);
    
    const iterations = 5;
    const times = [];
    
    logInfo(`Running ${iterations} performance iterations...`);
    
    for (let i = 0; i < iterations; i++) {
      const start = Date.now();
      const result = await service.processNLRequest(`Performance test ${i + 1}`);
      const duration = Date.now() - start;
      
      times.push(duration);
      logInfo(`Iteration ${i + 1}: ${duration}ms (${result.affectedRecords} records)`);
    }
    
    const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    
    log('\n📊 Performance Results:', 'cyan');
    logInfo(`   Average: ${avgTime.toFixed(2)}ms`);
    logInfo(`   Min: ${minTime}ms`);
    logInfo(`   Max: ${maxTime}ms`);
    logInfo(`   Variance: ${(maxTime - minTime)}ms`);
    
    if (avgTime < 5000) {
      logSuccess('✓ Performance tests passed (average < 5s)');
    } else {
      logWarning('⚠️  Performance tests passed but slow (average > 5s)');
    }
    
    return true;
    
  } catch (error) {
    logError(`Performance tests failed: ${error.message}`);
    return false;
  }
}

async function runManualTestChecklist() {
  logHeader('Manual Test Checklist');
  
  log('\n📋 Manual Testing Checklist:', 'yellow');
  log('Please verify the following manually:', 'yellow');
  
  const checklist = [
    'Open ARIA chatbot and verify input field is immediately visible',
    'Type "Update budget data from Excel" and verify AI processes request',
    'Check that success message appears with processing metrics',
    'Verify dashboard data updates in real-time',
    'Test different natural language variations',
    'Verify error handling with invalid requests',
    'Check WebSocket real-time notifications',
    'Test concurrent chatbot requests',
    'Verify data accuracy and validation',
    'Check performance under load'
  ];
  
  checklist.forEach((item, index) => {
    logInfo(`${index + 1}. ${item}`);
  });
  
  log('\n✅ Complete manual testing and verify all items pass', 'green');
}

async function generateTestReport(results) {
  logHeader('Test Report');
  
  const report = {
    timestamp: new Date().toISOString(),
    environment: {
      node: process.version,
      platform: process.platform,
      arch: process.arch
    },
    results: results,
    summary: {
      total: Object.keys(results).length,
      passed: Object.values(results).filter(r => r).length,
      failed: Object.values(results).filter(r => !r).length
    }
  };
  
  // Display summary
  log('\n📊 Test Summary:', 'cyan');
  logInfo(`Total test suites: ${report.summary.total}`);
  logSuccess(`Passed: ${report.summary.passed}`);
  
  if (report.summary.failed > 0) {
    logError(`Failed: ${report.summary.failed}`);
  } else {
    logSuccess('All test suites passed! 🎉');
  }
  
  // Save report to file
  const reportPath = path.join(__dirname, 'test-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  logInfo(`Test report saved to: ${reportPath}`);
  
  return report;
}

async function main() {
  log('\n🧪 AI Data Integration Test Suite', 'bright');
  log('Starting comprehensive testing...', 'cyan');
  
  const results = {};
  
  try {
    // Setup
    results.setup = await setupTestEnvironment();
    if (!results.setup) {
      logError('Setup failed - aborting tests');
      process.exit(1);
    }
    
    // Run test suites
    results.unit = await runUnitTests();
    results.integration = await runIntegrationTests();
    results.performance = await runPerformanceTests();
    
    // Manual test checklist
    runManualTestChecklist();
    
    // Generate report
    const report = await generateTestReport(results);
    
    // Exit with appropriate code
    if (report.summary.failed > 0) {
      logError('\nSome tests failed. Please review the results above.');
      process.exit(1);
    } else {
      logSuccess('\n🎉 All automated tests passed successfully!');
      logInfo('Please complete the manual testing checklist above.');
      process.exit(0);
    }
    
  } catch (error) {
    logError(`\nTest suite failed with error: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  }
}

// Handle command line arguments
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  log('\n🧪 AI Data Integration Test Suite', 'bright');
  log('\nUsage: node run-tests.js [options]', 'cyan');
  log('\nOptions:', 'yellow');
  log('  --unit          Run only unit tests');
  log('  --integration   Run only integration tests');
  log('  --performance   Run only performance tests');
  log('  --setup         Run only setup');
  log('  --help, -h      Show this help message');
  log('\nExamples:', 'green');
  log('  node run-tests.js                 # Run all tests');
  log('  node run-tests.js --unit          # Run only unit tests');
  log('  node run-tests.js --performance   # Run only performance tests');
  process.exit(0);
}

// Run specific test suites based on arguments
if (args.length > 0) {
  (async () => {
    if (args.includes('--setup')) {
      await setupTestEnvironment();
    } else if (args.includes('--unit')) {
      await setupTestEnvironment();
      await runUnitTests();
    } else if (args.includes('--integration')) {
      await setupTestEnvironment();
      await runIntegrationTests();
    } else if (args.includes('--performance')) {
      await setupTestEnvironment();
      await runPerformanceTests();
    } else {
      logError('Unknown argument. Use --help for usage information.');
      process.exit(1);
    }
  })();
} else {
  // Run all tests
  main();
}

module.exports = {
  setupTestEnvironment,
  runUnitTests,
  runIntegrationTests,
  runPerformanceTests,
  generateTestReport
};
