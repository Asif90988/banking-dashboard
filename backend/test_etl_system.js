const AIETLController = require('./services/etl/AIETLController');
const DataGenerator = require('./services/etl/DataGenerator');

async function testETLSystem() {
  console.log('🧪 Testing ETL System...\n');

  try {
    // Initialize the ETL controller
    const etlController = new AIETLController();
    
    console.log('1. Testing Data Generator...');
    const dataGenerator = new DataGenerator();
    
    // Generate sample data
    const budgetData = dataGenerator.generateBudgetData(10);
    console.log(`✅ Generated ${budgetData.length} budget records`);
    
    const projectData = dataGenerator.generateProjectData(5);
    console.log(`✅ Generated ${projectData.length} project records`);
    
    console.log('\n2. Testing AI ETL Commands...');
    
    // Test various AI commands
    const commands = [
      'List all ETL pipelines',
      'Check ETL status',
      'Run budget ETL pipeline',
      'Generate 100 budget records',
      'Show ETL history'
    ];
    
    for (const command of commands) {
      console.log(`\n🤖 Command: "${command}"`);
      const result = await etlController.processAIRequest(command);
      console.log(`📊 Result:`, {
        success: result.success,
        message: result.message,
        ...(result.count && { count: result.count }),
        ...(result.pipeline && { pipeline: result.pipeline })
      });
    }
    
    console.log('\n3. Testing ETL Pipeline Execution...');
    
    // Test running a specific pipeline
    try {
      const pipelineResult = await etlController.processAIRequest('Run budget ETL now');
      console.log('✅ Pipeline execution result:', pipelineResult);
    } catch (error) {
      console.log('⚠️ Pipeline execution (expected - no real data sources):', error.message);
    }
    
    console.log('\n4. Testing Configuration Management...');
    
    // Test configuration stats
    const stats = etlController.getControllerStats();
    console.log('📊 ETL Controller Stats:', {
      totalConfigurations: stats.configurations.total,
      enabledConfigurations: stats.configurations.enabled,
      schedulerUptime: Math.round(stats.scheduler.uptime),
      memoryUsage: Math.round(stats.controller.memoryUsage.heapUsed / 1024 / 1024) + 'MB'
    });
    
    console.log('\n5. Testing Health Check...');
    
    const health = await etlController.healthCheck();
    console.log('🏥 Health Check:', health);
    
    console.log('\n6. Testing Large Data Generation...');
    
    const largeDataResult = await etlController.processAIRequest('Generate 1000 budget records for testing');
    console.log('🏭 Large Data Generation:', largeDataResult);
    
    console.log('\n✅ ETL System Test Completed Successfully!');
    
    // Clean up
    etlController.stop();
    
  } catch (error) {
    console.error('❌ ETL System Test Failed:', error.message);
    console.error(error.stack);
  }
}

// Run the test
if (require.main === module) {
  testETLSystem();
}

module.exports = testETLSystem;
