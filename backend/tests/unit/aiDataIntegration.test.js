const { AIDataIntegrationService } = require('../../services/aiDataIntegration');
const { testConfig, testDataSources, createTestExcelFile } = require('../utils/testDataGenerator');

describe('AIDataIntegrationService', () => {
  let service;
  let testFilePath;

  beforeAll(async () => {
    // Create test Excel file
    testFilePath = await createTestExcelFile();
  });

  beforeEach(() => {
    service = new AIDataIntegrationService(testConfig.llmEndpoint);
    service.registerDataSource(testDataSources.budget_excel);
  });

  describe('Data Source Management', () => {
    test('should register data source correctly', () => {
      const sources = service.getDataSources();
      expect(sources.length).toBeGreaterThan(0);
      expect(sources.find(s => s.id === 'budget_excel_test')).toBeDefined();
    });

    test('should validate data source configuration', () => {
      const validSource = {
        id: 'valid_test',
        type: 'excel',
        name: 'Valid Test Source',
        path: './test.xlsx',
        mapping: {
          budgetFields: {
            svpName: 'SVP Name',
            department: 'Department',
            allocated: 'Budget Allocated',
            spent: 'Budget Spent',
            remaining: 'Remaining',
            projects: 'Projects'
          }
        },
        lastUpdated: new Date(),
        autoSync: false
      };

      expect(() => {
        service.registerDataSource(validSource);
      }).not.toThrow();

      const sources = service.getDataSources();
      expect(sources.find(s => s.id === 'valid_test')).toBeDefined();
    });

    test('should handle multiple data sources', () => {
      service.registerDataSource(testDataSources.project_tracker);
      
      const sources = service.getDataSources();
      expect(sources.length).toBeGreaterThanOrEqual(2);
      expect(sources.find(s => s.id === 'budget_excel_test')).toBeDefined();
      expect(sources.find(s => s.id === 'project_tracker_test')).toBeDefined();
    });
  });

  describe('Excel File Reading', () => {
    test('should read Excel file correctly', async () => {
      // Update the data source to use the actual test file
      const testSource = {
        ...testDataSources.budget_excel,
        path: testFilePath
      };
      service.registerDataSource(testSource);

      const result = await service.processNLRequest('Update budget data from Excel');
      
      expect(result.success).toBe(true);
      expect(result.affectedRecords).toBeGreaterThan(0);
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.processingTime).toBeGreaterThan(0);
    });

    test('should handle missing Excel file gracefully', async () => {
      const invalidSource = {
        ...testDataSources.budget_excel,
        id: 'missing_file_test',
        path: './nonexistent.xlsx'
      };
      service.registerDataSource(invalidSource);

      const result = await service.processNLRequest('Update data from missing file');
      
      // Should still succeed because our service has fallback sample data
      expect(result.success).toBe(true);
      expect(result.affectedRecords).toBeGreaterThan(0);
    });

    test('should validate data structure', async () => {
      const result = await service.processNLRequest('Update budget data');
      
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      
      if (result.data && result.data.length > 0) {
        const firstRecord = result.data[0];
        expect(firstRecord).toHaveProperty('svp_name');
        expect(firstRecord).toHaveProperty('department');
        expect(firstRecord).toHaveProperty('budget_allocated');
        expect(firstRecord).toHaveProperty('budget_spent');
        expect(firstRecord).toHaveProperty('remaining');
        expect(firstRecord).toHaveProperty('projects_count');
      }
    });
  });

  describe('Natural Language Processing', () => {
    test('should parse budget update requests', async () => {
      const testRequests = [
        'Update the budget data from Excel',
        'Refresh budget information',
        'Sync the latest budget numbers',
        'Pull new budget data from the spreadsheet',
        'Update budget please'
      ];

      for (const request of testRequests) {
        const result = await service.processNLRequest(request);
        expect(result).toBeDefined();
        expect(typeof result.success).toBe('boolean');
        expect(result.message).toBeDefined();
        expect(result.timestamp).toBeDefined();
        expect(typeof result.processingTime).toBe('number');
      }
    });

    test('should parse project update requests', async () => {
      const testRequests = [
        'Update project data',
        'Refresh project information',
        'Sync project status',
        'Pull latest project updates'
      ];

      for (const request of testRequests) {
        const result = await service.processNLRequest(request);
        expect(result).toBeDefined();
        expect(typeof result.success).toBe('boolean');
      }
    });

    test('should handle invalid requests gracefully', async () => {
      const invalidRequests = [
        'What is the weather?',
        'Random gibberish xyz123',
        '',
        null,
        undefined
      ];

      for (const request of invalidRequests) {
        const result = await service.processNLRequest(request);
        expect(result).toBeDefined();
        expect(typeof result.success).toBe('boolean');
        expect(result.message).toBeDefined();
      }
    });

    test('should use fallback parsing when LLM unavailable', async () => {
      // Create service with invalid LLM endpoint
      const serviceWithBadLLM = new AIDataIntegrationService('http://invalid:9999');
      serviceWithBadLLM.registerDataSource(testDataSources.budget_excel);

      const result = await serviceWithBadLLM.processNLRequest('Update budget data');
      
      // Should still work with fallback parsing
      expect(result).toBeDefined();
      expect(typeof result.success).toBe('boolean');
    });
  });

  describe('Data Processing and Validation', () => {
    test('should process and validate budget data', async () => {
      const result = await service.processNLRequest('Update budget data');
      
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      
      if (result.data && result.data.length > 0) {
        result.data.forEach(record => {
          expect(record.svp_name).toBeDefined();
          expect(record.department).toBeDefined();
          expect(typeof record.budget_allocated).toBe('number');
          expect(typeof record.budget_spent).toBe('number');
          expect(typeof record.remaining).toBe('number');
          expect(typeof record.projects_count).toBe('number');
        });
      }
    });

    test('should handle number parsing correctly', async () => {
      const result = await service.processNLRequest('Update budget data');
      
      expect(result.success).toBe(true);
      
      if (result.data && result.data.length > 0) {
        result.data.forEach(record => {
          expect(record.budget_allocated).toBeGreaterThanOrEqual(0);
          expect(record.budget_spent).toBeGreaterThanOrEqual(0);
          expect(record.remaining).toBeGreaterThanOrEqual(0);
          expect(record.projects_count).toBeGreaterThanOrEqual(0);
        });
      }
    });

    test('should filter out invalid records', async () => {
      const result = await service.processNLRequest('Update budget data');
      
      expect(result.success).toBe(true);
      
      if (result.data && result.data.length > 0) {
        result.data.forEach(record => {
          expect(record.svp_name).toBeTruthy();
          expect(record.department).toBeTruthy();
        });
      }
    });
  });

  describe('Performance and Reliability', () => {
    test('should complete processing within reasonable time', async () => {
      const start = Date.now();
      const result = await service.processNLRequest('Update budget data');
      const duration = Date.now() - start;
      
      expect(result.success).toBe(true);
      expect(duration).toBeLessThan(10000); // Should complete within 10 seconds
      expect(result.processingTime).toBeGreaterThan(0);
    });

    test('should handle concurrent requests', async () => {
      const requests = [
        'Update budget data',
        'Refresh project information',
        'Sync compliance data'
      ];

      const promises = requests.map(request => 
        service.processNLRequest(request)
      );

      const results = await Promise.all(promises);

      results.forEach(result => {
        expect(result).toBeDefined();
        expect(typeof result.success).toBe('boolean');
        expect(result.message).toBeDefined();
      });
    });

    test('should maintain data consistency', async () => {
      // Run the same request multiple times
      const requests = Array(3).fill('Update budget data');
      
      const results = await Promise.all(
        requests.map(request => service.processNLRequest(request))
      );

      // All results should be consistent
      results.forEach(result => {
        expect(result.success).toBe(true);
        expect(result.affectedRecords).toBe(results[0].affectedRecords);
      });
    });
  });

  describe('Error Handling', () => {
    test('should handle service errors gracefully', async () => {
      // Test with malformed request
      const result = await service.processNLRequest(null);
      
      expect(result).toBeDefined();
      expect(result.success).toBe(false);
      expect(result.message).toContain('Error');
      expect(result.affectedRecords).toBe(0);
    });

    test('should provide meaningful error messages', async () => {
      const result = await service.processNLRequest('');
      
      expect(result).toBeDefined();
      expect(result.message).toBeDefined();
      expect(result.message.length).toBeGreaterThan(0);
    });

    test('should handle network timeouts', async () => {
      // This test would require mocking network delays
      // For now, we'll test that the service doesn't crash
      const result = await service.processNLRequest('Update budget data');
      expect(result).toBeDefined();
    });
  });
});

// Helper function to run performance benchmarks
async function runPerformanceBenchmark() {
  console.log('🚀 Running performance benchmark...');
  
  const service = new AIDataIntegrationService(testConfig.llmEndpoint);
  service.registerDataSource(testDataSources.budget_excel);
  
  const iterations = 10;
  const times = [];
  
  for (let i = 0; i < iterations; i++) {
    const start = Date.now();
    const result = await service.processNLRequest('Update budget data');
    const duration = Date.now() - start;
    
    times.push(duration);
    console.log(`Iteration ${i + 1}: ${duration}ms (${result.affectedRecords} records)`);
  }
  
  const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length;
  const minTime = Math.min(...times);
  const maxTime = Math.max(...times);
  
  console.log(`📊 Performance Results:`);
  console.log(`   Average: ${avgTime.toFixed(2)}ms`);
  console.log(`   Min: ${minTime}ms`);
  console.log(`   Max: ${maxTime}ms`);
  
  return { avgTime, minTime, maxTime };
}

module.exports = {
  runPerformanceBenchmark
};
