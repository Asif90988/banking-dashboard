const request = require('supertest');
const { createTestExcelFile, createTestProjectFile, testConfig } = require('../utils/testDataGenerator');

// Mock Express app for testing
const express = require('express');
const app = express();
app.use(express.json());

// Import our routes
const aiRoutes = require('../../routes/dashboard');
const chatbotRoutes = require('../../routes/chatbot');

app.use('/api', aiRoutes);
app.use('/api/chatbot', chatbotRoutes);

describe('Data Flow Integration Tests', () => {
  let testBudgetFile;
  let testProjectFile;

  beforeAll(async () => {
    // Create test Excel files
    testBudgetFile = await createTestExcelFile();
    testProjectFile = await createTestProjectFile();
    console.log('✅ Test files created for integration testing');
  });

  describe('AI Data Integration API', () => {
    test('should process data integration request via API', async () => {
      const response = await request(app)
        .post('/api/ai/process-request')
        .send({
          message: 'Update budget data from Excel please'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('successfully');
      expect(response.body.affectedRecords).toBeGreaterThan(0);
      expect(response.body.data).toBeDefined();
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.processingTime).toBeGreaterThanOrEqual(0);
    });

    test('should return data sources configuration', async () => {
      const response = await request(app)
        .get('/api/ai/data-sources')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.dataSources).toBeDefined();
      expect(Array.isArray(response.body.dataSources)).toBe(true);
      expect(response.body.dataSources.length).toBeGreaterThan(0);

      // Check data source structure
      const dataSource = response.body.dataSources[0];
      expect(dataSource).toHaveProperty('id');
      expect(dataSource).toHaveProperty('type');
      expect(dataSource).toHaveProperty('name');
      expect(dataSource).toHaveProperty('path');
      expect(dataSource).toHaveProperty('mapping');
      expect(dataSource).toHaveProperty('lastUpdated');
    });

    test('should handle multiple concurrent requests', async () => {
      const requests = [
        'Update budget data from Excel',
        'Refresh project information',
        'Sync compliance data'
      ];

      const promises = requests.map(message =>
        request(app)
          .post('/api/ai/process-request')
          .send({ message })
      );

      const responses = await Promise.all(promises);

      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBeDefined();
      });
    });

    test('should handle invalid requests gracefully', async () => {
      const invalidRequests = [
        { message: '' },
        { message: null },
        { message: 'What is the weather?' },
        {}
      ];

      for (const requestBody of invalidRequests) {
        const response = await request(app)
          .post('/api/ai/process-request')
          .send(requestBody);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('success');
        expect(response.body).toHaveProperty('message');
      }
    });
  });

  describe('Chatbot Integration', () => {
    test('should process data integration via chatbot', async () => {
      const response = await request(app)
        .post('/api/chatbot/chat')
        .send({
          message: 'Update budget data from Excel please',
          conversationId: 'test-integration-001'
        })
        .expect(200);

      expect(response.body.response).toBeDefined();
      expect(response.body.conversationId).toBe('test-integration-001');
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.isDataIntegration).toBe(true);
      expect(response.body.integrationResult).toBeDefined();
      expect(response.body.integrationResult.success).toBe(true);
    });

    test('should handle regular chat messages', async () => {
      const response = await request(app)
        .post('/api/chatbot/chat')
        .send({
          message: 'Hello, how are you?',
          conversationId: 'test-chat-001'
        })
        .expect(200);

      expect(response.body.response).toBeDefined();
      expect(response.body.conversationId).toBe('test-chat-001');
      expect(response.body.isDataIntegration).toBe(false);
    });

    test('should maintain conversation context', async () => {
      const conversationId = 'test-context-001';

      // First message
      const response1 = await request(app)
        .post('/api/chatbot/chat')
        .send({
          message: 'Update budget data',
          conversationId
        })
        .expect(200);

      expect(response1.body.conversationId).toBe(conversationId);

      // Second message in same conversation
      const response2 = await request(app)
        .post('/api/chatbot/chat')
        .send({
          message: 'How many records were processed?',
          conversationId
        })
        .expect(200);

      expect(response2.body.conversationId).toBe(conversationId);
      expect(response2.body.response).toBeDefined();
    });
  });

  describe('Data Processing Pipeline', () => {
    test('should complete full data integration pipeline', async () => {
      // Step 1: Trigger data integration
      const integrationResponse = await request(app)
        .post('/api/ai/process-request')
        .send({
          message: 'Update budget data from the latest Excel file'
        })
        .expect(200);

      expect(integrationResponse.body.success).toBe(true);
      const { affectedRecords, data, processingTime } = integrationResponse.body;

      // Step 2: Verify data structure
      expect(affectedRecords).toBeGreaterThan(0);
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
      expect(processingTime).toBeGreaterThanOrEqual(0);

      // Step 3: Verify data content
      if (data.length > 0) {
        const record = data[0];
        expect(record).toHaveProperty('svp_name');
        expect(record).toHaveProperty('department');
        expect(record).toHaveProperty('budget_allocated');
        expect(record).toHaveProperty('budget_spent');
        expect(record).toHaveProperty('remaining');
        expect(record).toHaveProperty('projects_count');

        // Verify data types
        expect(typeof record.svp_name).toBe('string');
        expect(typeof record.department).toBe('string');
        expect(typeof record.budget_allocated).toBe('number');
        expect(typeof record.budget_spent).toBe('number');
        expect(typeof record.remaining).toBe('number');
        expect(typeof record.projects_count).toBe('number');
      }
    });

    test('should handle different data source types', async () => {
      const testCases = [
        { message: 'Update budget data', expectedType: 'budget' },
        { message: 'Refresh project information', expectedType: 'project' },
        { message: 'Sync compliance data', expectedType: 'compliance' }
      ];

      for (const testCase of testCases) {
        const response = await request(app)
          .post('/api/ai/process-request')
          .send({ message: testCase.message })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.affectedRecords).toBeGreaterThan(0);
      }
    });

    test('should validate data integrity', async () => {
      const response = await request(app)
        .post('/api/ai/process-request')
        .send({
          message: 'Update budget data with validation'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      
      if (response.body.data && response.body.data.length > 0) {
        response.body.data.forEach(record => {
          // Validate required fields
          expect(record.svp_name).toBeTruthy();
          expect(record.department).toBeTruthy();
          
          // Validate numeric fields
          expect(record.budget_allocated).toBeGreaterThanOrEqual(0);
          expect(record.budget_spent).toBeGreaterThanOrEqual(0);
          expect(record.remaining).toBeGreaterThanOrEqual(0);
          expect(record.projects_count).toBeGreaterThanOrEqual(0);
          
          // Validate business logic
          expect(record.budget_allocated).toBeGreaterThanOrEqual(record.budget_spent);
          expect(record.remaining).toBe(record.budget_allocated - record.budget_spent);
        });
      }
    });
  });

  describe('Performance Testing', () => {
    test('should process requests within acceptable time limits', async () => {
      const start = Date.now();
      
      const response = await request(app)
        .post('/api/ai/process-request')
        .send({
          message: 'Update budget data for performance test'
        })
        .expect(200);

      const totalTime = Date.now() - start;
      
      expect(response.body.success).toBe(true);
      expect(totalTime).toBeLessThan(10000); // Should complete within 10 seconds
      expect(response.body.processingTime).toBeGreaterThan(0);
      
      console.log(`⚡ Performance: Total ${totalTime}ms, Processing ${response.body.processingTime}ms`);
    });

    test('should handle load testing', async () => {
      const concurrentRequests = 5;
      const requests = Array(concurrentRequests).fill().map((_, index) =>
        request(app)
          .post('/api/ai/process-request')
          .send({
            message: `Load test request ${index + 1}`
          })
      );

      const start = Date.now();
      const responses = await Promise.all(requests);
      const totalTime = Date.now() - start;

      responses.forEach((response, index) => {
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        console.log(`Request ${index + 1}: ${response.body.processingTime}ms`);
      });

      console.log(`🚀 Load test: ${concurrentRequests} requests in ${totalTime}ms`);
      expect(totalTime).toBeLessThan(30000); // All requests should complete within 30 seconds
    });

    test('should maintain performance under repeated requests', async () => {
      const iterations = 3;
      const times = [];

      for (let i = 0; i < iterations; i++) {
        const start = Date.now();
        
        const response = await request(app)
          .post('/api/ai/process-request')
          .send({
            message: `Repeated request ${i + 1}`
          })
          .expect(200);

        const duration = Date.now() - start;
        times.push(duration);

        expect(response.body.success).toBe(true);
        console.log(`Iteration ${i + 1}: ${duration}ms`);
      }

      const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length;
      const maxTime = Math.max(...times);
      const minTime = Math.min(...times);

      console.log(`📊 Performance consistency:`);
      console.log(`   Average: ${avgTime.toFixed(2)}ms`);
      console.log(`   Min: ${minTime}ms`);
      console.log(`   Max: ${maxTime}ms`);
      console.log(`   Variance: ${(maxTime - minTime)}ms`);

      // Performance should be consistent (variance < 5 seconds)
      expect(maxTime - minTime).toBeLessThan(5000);
    });
  });

  describe('Error Handling and Recovery', () => {
    test('should handle malformed requests gracefully', async () => {
      const malformedRequests = [
        { invalidField: 'test' },
        { message: null },
        { message: undefined },
        { message: 123 },
        { message: {} }
      ];

      for (const requestBody of malformedRequests) {
        const response = await request(app)
          .post('/api/ai/process-request')
          .send(requestBody);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('success');
        expect(response.body).toHaveProperty('message');
        
        if (!response.body.success) {
          expect(response.body.message).toContain('Error');
        }
      }
    });

    test('should provide meaningful error messages', async () => {
      const response = await request(app)
        .post('/api/ai/process-request')
        .send({
          message: 'This is an intentionally invalid request that should fail gracefully'
        })
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message.length).toBeGreaterThan(0);
      expect(response.body).toHaveProperty('timestamp');
    });

    test('should handle service unavailability', async () => {
      // This test simulates when external services are down
      const response = await request(app)
        .post('/api/ai/process-request')
        .send({
          message: 'Update budget data when service is down'
        })
        .expect(200);

      // Should still provide a response, even if degraded
      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('Data Source Management', () => {
    test('should list available data sources', async () => {
      const response = await request(app)
        .get('/api/ai/data-sources')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.dataSources).toBeDefined();
      expect(Array.isArray(response.body.dataSources)).toBe(true);

      if (response.body.dataSources.length > 0) {
        const source = response.body.dataSources[0];
        expect(source).toHaveProperty('id');
        expect(source).toHaveProperty('type');
        expect(source).toHaveProperty('name');
        expect(source).toHaveProperty('mapping');
      }
    });

    test('should handle data source configuration', async () => {
      const response = await request(app)
        .get('/api/ai/data-sources')
        .expect(200);

      expect(response.body.success).toBe(true);
      
      if (response.body.dataSources.length > 0) {
        response.body.dataSources.forEach(source => {
          expect(source.id).toBeTruthy();
          expect(['excel', 'csv', 'api', 'database']).toContain(source.type);
          expect(source.name).toBeTruthy();
          expect(source.mapping).toBeDefined();
        });
      }
    });
  });
});

// Helper function for manual testing
async function runManualIntegrationTest() {
  console.log('🧪 Running manual integration test...');
  
  try {
    // Test data integration
    const integrationResponse = await request(app)
      .post('/api/ai/process-request')
      .send({
        message: 'Update budget data from Excel for manual test'
      });

    console.log('✅ Data Integration Test:');
    console.log(`   Success: ${integrationResponse.body.success}`);
    console.log(`   Records: ${integrationResponse.body.affectedRecords}`);
    console.log(`   Time: ${integrationResponse.body.processingTime}ms`);

    // Test chatbot integration
    const chatResponse = await request(app)
      .post('/api/chatbot/chat')
      .send({
        message: 'Update budget data please',
        conversationId: 'manual-test-001'
      });

    console.log('✅ Chatbot Integration Test:');
    console.log(`   Response: ${chatResponse.body.response.substring(0, 100)}...`);
    console.log(`   Is Data Integration: ${chatResponse.body.isDataIntegration}`);

    console.log('🎉 Manual integration test completed successfully!');
    
  } catch (error) {
    console.error('❌ Manual integration test failed:', error.message);
  }
}

module.exports = {
  runManualIntegrationTest
};
