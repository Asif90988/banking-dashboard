const ETLScheduler = require('./ETLScheduler');
const ETLConfigManager = require('./ETLConfigManager');
const AIDataIntegrationService = require('../aiDataIntegration');

class AIETLController {
  constructor(llmEndpoint = 'http://localhost:1234') {
    this.configManager = new ETLConfigManager();
    this.scheduler = new ETLScheduler(this.configManager);
    this.aiService = new AIDataIntegrationService(llmEndpoint);
    
    this.initializeDefaultConfigs();
  }

  initializeDefaultConfigs() {
    console.log('🏗️ Initializing default ETL configurations...');
    
    // The config manager will create defaults if none exist
    const configs = this.configManager.getAllConfigs();
    console.log(`📊 Loaded ${configs.length} ETL configurations`);
  }

  async processAIRequest(userMessage) {
    try {
      console.log(`🤖 Processing ETL AI request: "${userMessage}"`);
      
      // Parse the user's intent
      const intent = await this.parseETLIntent(userMessage);
      console.log('🧠 Parsed intent:', intent);
      
      switch (intent.action) {
        case 'run_etl':
          return await this.runETLPipeline(intent.parameters);
        case 'schedule_etl':
          return await this.scheduleETLPipeline(intent.parameters);
        case 'check_status':
          return await this.checkETLStatus(intent.parameters);
        case 'update_config':
          return await this.updateETLConfig(intent.parameters);
        case 'list_pipelines':
          return await this.listPipelines(intent.parameters);
        case 'get_history':
          return await this.getETLHistory(intent.parameters);
        case 'generate_data':
          return await this.generateLargeDataset(intent.parameters);
        default:
          return { 
            success: false, 
            message: `Unknown ETL command: ${intent.action}. Available commands: run_etl, schedule_etl, check_status, update_config, list_pipelines, get_history, generate_data` 
          };
      }
    } catch (error) {
      console.error('❌ Error processing ETL request:', error.message);
      return { 
        success: false, 
        message: `Error processing ETL request: ${error.message}` 
      };
    }
  }

  async parseETLIntent(userMessage) {
    const prompt = `
    You are an ETL assistant for a banking dashboard. Parse the following user request and extract the intent and parameters.

    User Message: "${userMessage}"

    Available ETL actions:
    - run_etl: Run an ETL pipeline immediately
    - schedule_etl: Schedule an ETL pipeline
    - check_status: Check ETL pipeline status
    - update_config: Update ETL configuration
    - list_pipelines: List all available pipelines
    - get_history: Get ETL execution history
    - generate_data: Generate large-scale dummy data

    Available pipelines:
    - budget_etl: Budget data pipeline
    - project_etl: Project data pipeline
    - compliance_etl: Compliance data pipeline
    - large_data_etl: Large-scale data generation pipeline

    Return JSON format:
    {
      "action": "action_name",
      "parameters": {
        "pipeline": "pipeline_name",
        "urgency": "normal|high",
        "schedule": "cron_expression",
        "count": "number_for_data_generation",
        "options": {}
      }
    }
    `;

    try {
      const response = await fetch(`${this.aiService.llmEndpoint}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'local-model',
          messages: [
            { role: 'system', content: prompt },
            { role: 'user', content: userMessage }
          ],
          temperature: 0.1,
          max_tokens: 500
        })
      });

      if (!response.ok) {
        throw new Error(`LLM API error: ${response.status}`);
      }

      const result = await response.json();
      return JSON.parse(result.choices[0].message.content);
    } catch (error) {
      console.warn('⚠️ LLM parsing failed, using fallback logic:', error.message);
      return this.fallbackETLIntentParsing(userMessage);
    }
  }

  fallbackETLIntentParsing(userMessage) {
    const message = userMessage.toLowerCase();
    
    // Run ETL patterns
    if (message.includes('run') && (message.includes('etl') || message.includes('pipeline'))) {
      let pipeline = 'budget_etl'; // default
      if (message.includes('budget')) pipeline = 'budget_etl';
      if (message.includes('project')) pipeline = 'project_etl';
      if (message.includes('compliance')) pipeline = 'compliance_etl';
      
      return {
        action: 'run_etl',
        parameters: {
          pipeline: pipeline,
          urgency: message.includes('urgent') || message.includes('now') ? 'high' : 'normal'
        }
      };
    }
    
    // Schedule ETL patterns
    if (message.includes('schedule')) {
      return {
        action: 'schedule_etl',
        parameters: {
          pipeline: 'budget_etl',
          schedule: '0 */6 * * *' // default every 6 hours
        }
      };
    }
    
    // Status check patterns
    if (message.includes('status') || message.includes('check')) {
      return {
        action: 'check_status',
        parameters: {}
      };
    }
    
    // List pipelines patterns
    if (message.includes('list') || message.includes('show')) {
      return {
        action: 'list_pipelines',
        parameters: {}
      };
    }
    
    // Generate data patterns
    if (message.includes('generate') && message.includes('data')) {
      const countMatch = message.match(/(\d+)/);
      const count = countMatch ? parseInt(countMatch[1]) : 1000;
      
      return {
        action: 'generate_data',
        parameters: {
          count: count,
          type: 'budget'
        }
      };
    }
    
    // Default action
    return {
      action: 'check_status',
      parameters: {}
    };
  }

  async runETLPipeline(parameters) {
    const { pipeline, urgency } = parameters;
    
    try {
      console.log(`🚀 Running ETL pipeline: ${pipeline} with urgency: ${urgency}`);
      
      const startTime = Date.now();
      const result = await this.scheduler.runPipelineNow(pipeline);
      const executionTime = Date.now() - startTime;
      
      return {
        success: true,
        message: `ETL pipeline ${pipeline} executed successfully`,
        pipeline: pipeline,
        result: {
          recordsProcessed: result.recordsProcessed,
          recordsSuccessful: result.recordsSuccessful,
          recordsFailure: result.recordsFailure,
          executionTime: executionTime,
          dataHash: result.dataHash
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to run ETL pipeline ${pipeline}: ${error.message}`,
        error: error.message,
        pipeline: pipeline
      };
    }
  }

  async scheduleETLPipeline(parameters) {
    const { pipeline, schedule } = parameters;
    
    try {
      this.scheduler.updateJobSchedule(pipeline, schedule);
      
      return {
        success: true,
        message: `ETL pipeline ${pipeline} scheduled successfully`,
        pipeline: pipeline,
        schedule: schedule,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to schedule ETL pipeline ${pipeline}: ${error.message}`,
        error: error.message
      };
    }
  }

  async checkETLStatus(parameters) {
    const { pipeline } = parameters;
    
    try {
      if (pipeline) {
        // Get status for specific pipeline
        const config = this.configManager.getConfig(pipeline);
        if (!config) {
          throw new Error(`Pipeline configuration not found: ${pipeline}`);
        }
        
        const isRunning = this.scheduler.getRunningPipelines().includes(pipeline);
        const isScheduled = this.scheduler.getScheduledJobs().includes(pipeline);
        const lastRun = this.scheduler.getLastRunForPipeline(pipeline);
        
        return {
          success: true,
          pipeline: pipeline,
          status: {
            running: isRunning,
            scheduled: isScheduled,
            enabled: config.enabled,
            schedule: config.schedule,
            lastRun: lastRun,
            sourceType: config.source.type,
            destinationType: config.destination.type
          }
        };
      } else {
        // Get status for all pipelines
        const status = this.scheduler.getJobsStatus();
        const stats = this.scheduler.getStats();
        
        return {
          success: true,
          message: `ETL system status retrieved`,
          status: status,
          statistics: stats,
          timestamp: new Date().toISOString()
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `Failed to check ETL status: ${error.message}`,
        error: error.message
      };
    }
  }

  async updateETLConfig(parameters) {
    const { pipeline, config } = parameters;
    
    try {
      const existingConfig = this.configManager.getConfig(pipeline);
      if (!existingConfig) {
        throw new Error(`Pipeline configuration not found: ${pipeline}`);
      }
      
      // Update configuration
      const updatedConfig = { ...existingConfig, ...config };
      this.configManager.saveConfig(updatedConfig);
      
      // Restart scheduler to pick up changes
      this.scheduler.restart();
      
      return {
        success: true,
        message: `ETL configuration updated for ${pipeline}`,
        pipeline: pipeline,
        config: updatedConfig
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to update ETL configuration: ${error.message}`,
        error: error.message
      };
    }
  }

  async listPipelines(parameters) {
    try {
      const configs = this.configManager.getAllConfigs();
      const status = this.scheduler.getJobsStatus();
      
      const pipelines = configs.map(config => {
        const jobStatus = status.jobs.find(job => job.name === config.name);
        
        return {
          name: config.name,
          enabled: config.enabled,
          schedule: config.schedule,
          sourceType: config.source.type,
          destinationType: config.destination.type,
          isRunning: jobStatus?.isRunning || false,
          isScheduled: jobStatus?.isScheduled || false,
          lastRun: jobStatus?.lastRun
        };
      });
      
      return {
        success: true,
        message: `Found ${pipelines.length} ETL pipelines`,
        pipelines: pipelines,
        summary: {
          total: pipelines.length,
          enabled: pipelines.filter(p => p.enabled).length,
          running: pipelines.filter(p => p.isRunning).length,
          scheduled: pipelines.filter(p => p.isScheduled).length
        }
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to list pipelines: ${error.message}`,
        error: error.message
      };
    }
  }

  async getETLHistory(parameters) {
    const { pipeline, limit } = parameters;
    
    try {
      const history = this.scheduler.getJobHistory(pipeline, limit || 20);
      
      return {
        success: true,
        message: `Retrieved ETL history${pipeline ? ` for ${pipeline}` : ''}`,
        history: history,
        count: history.length
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to get ETL history: ${error.message}`,
        error: error.message
      };
    }
  }

  async generateLargeDataset(parameters) {
    const { count, type } = parameters;
    
    try {
      console.log(`🏭 Generating large dataset: ${count} records of type ${type}`);
      
      const dataGenerator = require('./DataGenerator');
      const generator = new dataGenerator();
      
      let data;
      switch (type) {
        case 'budget':
          data = generator.generateBudgetData(count || 1000);
          break;
        case 'project':
          data = generator.generateProjectData(count || 1000);
          break;
        case 'compliance':
          data = generator.generateComplianceData(count || 1000);
          break;
        default:
          data = generator.generateMixedData(count || 1000);
      }
      
      // Save to file
      const fs = require('fs');
      const path = require('path');
      
      const outputDir = './data/generated';
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      const filename = `${type}_data_${count}_${Date.now()}.json`;
      const filepath = path.join(outputDir, filename);
      
      fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
      
      return {
        success: true,
        message: `Generated ${data.length} ${type} records`,
        count: data.length,
        type: type,
        filepath: filepath,
        fileSize: fs.statSync(filepath).size,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to generate dataset: ${error.message}`,
        error: error.message
      };
    }
  }

  // Start the ETL controller
  start() {
    console.log('🚀 Starting AI ETL Controller...');
    this.scheduler.start();
    console.log('✅ AI ETL Controller started');
  }

  // Stop the ETL controller
  stop() {
    console.log('🛑 Stopping AI ETL Controller...');
    this.scheduler.stop();
    console.log('✅ AI ETL Controller stopped');
  }

  // Set WebSocket broadcast function
  setBroadcastFunction(broadcastFn) {
    this.scheduler.setBroadcastFunction(broadcastFn);
    console.log('📡 AI ETL Controller connected to WebSocket broadcasting');
  }

  // Get controller statistics
  getControllerStats() {
    const schedulerStats = this.scheduler.getStats();
    const configStats = this.configManager.getStats();
    
    return {
      scheduler: schedulerStats,
      configurations: configStats,
      controller: {
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        timestamp: new Date()
      }
    };
  }

  // Health check
  async healthCheck() {
    try {
      const stats = this.getControllerStats();
      const runningPipelines = this.scheduler.getRunningPipelines();
      const scheduledJobs = this.scheduler.getScheduledJobs();
      
      return {
        healthy: true,
        status: 'operational',
        runningPipelines: runningPipelines.length,
        scheduledJobs: scheduledJobs.length,
        totalConfigurations: stats.configurations.total,
        uptime: stats.controller.uptime,
        timestamp: new Date()
      };
    } catch (error) {
      return {
        healthy: false,
        status: 'error',
        error: error.message,
        timestamp: new Date()
      };
    }
  }
}

module.exports = AIETLController;
