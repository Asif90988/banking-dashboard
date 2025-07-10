const cron = require('node-cron');
const ETLPipeline = require('./ETLPipeline');
const ETLConfigManager = require('./ETLConfigManager');

class ETLScheduler {
  constructor(configManager) {
    this.configManager = configManager || new ETLConfigManager();
    this.scheduledJobs = new Map();
    this.runningPipelines = new Set();
    this.jobHistory = [];
  }

  start() {
    console.log('🚀 Starting ETL Scheduler...');
    
    const configs = this.configManager.getEnabledConfigs();
    
    for (const config of configs) {
      if (config.enabled && config.schedule) {
        this.scheduleJob(config);
      }
    }

    console.log(`✅ ETL Scheduler started with ${this.scheduledJobs.size} scheduled jobs`);
  }

  stop() {
    console.log('🛑 Stopping ETL Scheduler...');
    
    for (const [jobName, job] of this.scheduledJobs) {
      if (job.destroy) {
        job.destroy();
      }
      console.log(`⏹️ Stopped job: ${jobName}`);
    }
    
    this.scheduledJobs.clear();
    console.log('✅ ETL Scheduler stopped');
  }

  scheduleJob(config) {
    try {
      // Validate cron expression
      if (!cron.validate(config.schedule)) {
        console.error(`❌ Invalid cron expression for ${config.name}: ${config.schedule}`);
        return;
      }

      const job = cron.schedule(config.schedule, async () => {
        await this.runPipeline(config);
      }, {
        scheduled: true,
        timezone: 'America/New_York'
      });

      this.scheduledJobs.set(config.name, job);
      console.log(`⏰ Scheduled job: ${config.name} with schedule: ${config.schedule}`);
    } catch (error) {
      console.error(`❌ Failed to schedule job ${config.name}:`, error.message);
    }
  }

  async runPipeline(config) {
    if (this.runningPipelines.has(config.name)) {
      console.log(`⚠️ Pipeline ${config.name} is already running, skipping...`);
      return;
    }

    this.runningPipelines.add(config.name);
    const startTime = Date.now();
    
    try {
      console.log(`🚀 Starting pipeline: ${config.name}`);
      
      const pipeline = new ETLPipeline(config);
      
      // Set up event listeners
      pipeline.on('started', (data) => {
        console.log(`📊 Pipeline ${config.name} started:`, data);
        this.broadcastEvent('pipeline_started', { pipeline: config.name, ...data });
      });

      pipeline.on('extracted', (data) => {
        console.log(`📥 Pipeline ${config.name} extracted:`, data);
        this.broadcastEvent('pipeline_extracted', { pipeline: config.name, ...data });
      });

      pipeline.on('transformed', (data) => {
        console.log(`🔄 Pipeline ${config.name} transformed:`, data);
        this.broadcastEvent('pipeline_transformed', { pipeline: config.name, ...data });
      });

      pipeline.on('loaded', (data) => {
        console.log(`💾 Pipeline ${config.name} loaded:`, data);
        this.broadcastEvent('pipeline_loaded', { pipeline: config.name, ...data });
      });

      pipeline.on('completed', (result) => {
        console.log(`✅ Pipeline ${config.name} completed:`, result);
        this.recordJobHistory(config.name, result, 'completed');
        this.notifyCompletion(config.name, result);
        this.broadcastEvent('pipeline_completed', { pipeline: config.name, ...result });
      });

      pipeline.on('failed', (result) => {
        console.error(`❌ Pipeline ${config.name} failed:`, result);
        this.recordJobHistory(config.name, result, 'failed');
        this.notifyFailure(config.name, result);
        this.broadcastEvent('pipeline_failed', { pipeline: config.name, ...result });
      });

      // Execute the pipeline
      const result = await pipeline.execute();
      
      console.log(`🎉 Pipeline ${config.name} finished:`, {
        success: result.success,
        recordsProcessed: result.recordsProcessed,
        executionTime: result.executionTime
      });

      return result;

    } catch (error) {
      console.error(`💥 Error running pipeline ${config.name}:`, error.message);
      
      const errorResult = {
        success: false,
        error: error.message,
        executionTime: Date.now() - startTime
      };
      
      this.recordJobHistory(config.name, errorResult, 'error');
      this.notifyFailure(config.name, errorResult);
      
      throw error;
    } finally {
      this.runningPipelines.delete(config.name);
    }
  }

  async runPipelineNow(pipelineName) {
    const config = this.configManager.getConfig(pipelineName);
    if (!config) {
      throw new Error(`Pipeline configuration not found: ${pipelineName}`);
    }

    console.log(`🏃‍♂️ Running pipeline immediately: ${pipelineName}`);
    return await this.runPipeline(config);
  }

  recordJobHistory(pipelineName, result, status) {
    const historyEntry = {
      pipeline: pipelineName,
      status: status,
      timestamp: new Date(),
      result: result
    };

    this.jobHistory.push(historyEntry);

    // Keep only last 100 entries
    if (this.jobHistory.length > 100) {
      this.jobHistory = this.jobHistory.slice(-100);
    }
  }

  async notifyCompletion(pipelineName, result) {
    try {
      // Send notification to frontend via API
      const axios = require('axios');
      await axios.post('http://localhost:3001/api/etl/completion', {
        pipeline: pipelineName,
        result: result,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('⚠️ Error sending completion notification:', error.message);
    }
  }

  async notifyFailure(pipelineName, result) {
    try {
      // Send failure notification
      const axios = require('axios');
      await axios.post('http://localhost:3001/api/etl/failure', {
        pipeline: pipelineName,
        result: result,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('⚠️ Error sending failure notification:', error.message);
    }
  }

  broadcastEvent(eventType, data) {
    // This will be connected to WebSocket broadcasting
    if (this.broadcastFunction) {
      this.broadcastFunction({
        type: 'ETL_EVENT',
        eventType: eventType,
        data: data,
        timestamp: new Date()
      });
    }
  }

  setBroadcastFunction(broadcastFn) {
    this.broadcastFunction = broadcastFn;
    console.log('📡 ETL Scheduler connected to WebSocket broadcasting');
  }

  // Add a new scheduled job
  addScheduledJob(config) {
    // Validate configuration
    const validation = this.configManager.validateConfig(config);
    if (!validation.isValid) {
      throw new Error(`Invalid configuration: ${validation.errors.join(', ')}`);
    }

    // Save configuration
    this.configManager.saveConfig(config);

    // Schedule the job if it has a schedule
    if (config.schedule && config.enabled) {
      this.scheduleJob(config);
    }

    console.log(`➕ Added new ETL job: ${config.name}`);
  }

  // Remove a scheduled job
  removeScheduledJob(pipelineName) {
    // Stop the scheduled job
    const job = this.scheduledJobs.get(pipelineName);
    if (job) {
      if (job.destroy) {
        job.destroy();
      }
      this.scheduledJobs.delete(pipelineName);
    }

    // Remove from configuration
    this.configManager.deleteConfig(pipelineName);

    console.log(`➖ Removed ETL job: ${pipelineName}`);
  }

  // Update job schedule
  updateJobSchedule(pipelineName, newSchedule) {
    // Validate cron expression
    if (!cron.validate(newSchedule)) {
      throw new Error(`Invalid cron expression: ${newSchedule}`);
    }

    // Stop existing job
    const existingJob = this.scheduledJobs.get(pipelineName);
    if (existingJob) {
      if (existingJob.destroy) {
        existingJob.destroy();
      }
      this.scheduledJobs.delete(pipelineName);
    }

    // Update configuration
    this.configManager.updateSchedule(pipelineName, newSchedule);

    // Reschedule with new schedule
    const config = this.configManager.getConfig(pipelineName);
    if (config && config.enabled) {
      this.scheduleJob(config);
    }

    console.log(`🔄 Updated schedule for ${pipelineName}: ${newSchedule}`);
  }

  // Enable/disable job
  toggleJob(pipelineName, enabled) {
    const config = this.configManager.getConfig(pipelineName);
    if (!config) {
      throw new Error(`Pipeline configuration not found: ${pipelineName}`);
    }

    if (enabled) {
      this.configManager.enableConfig(pipelineName);
      if (config.schedule) {
        this.scheduleJob(config);
      }
    } else {
      this.configManager.disableConfig(pipelineName);
      const job = this.scheduledJobs.get(pipelineName);
      if (job) {
        if (job.destroy) {
          job.destroy();
        }
        this.scheduledJobs.delete(pipelineName);
      }
    }

    console.log(`🔄 ${enabled ? 'Enabled' : 'Disabled'} ETL job: ${pipelineName}`);
  }

  // Get status of all jobs
  getJobsStatus() {
    const configs = this.configManager.getAllConfigs();
    const status = configs.map(config => {
      const isRunning = this.runningPipelines.has(config.name);
      const isScheduled = this.scheduledJobs.has(config.name);
      const lastRun = this.getLastRunForPipeline(config.name);

      return {
        name: config.name,
        enabled: config.enabled,
        schedule: config.schedule,
        isRunning: isRunning,
        isScheduled: isScheduled,
        lastRun: lastRun,
        sourceType: config.source.type,
        destinationType: config.destination.type
      };
    });

    return {
      jobs: status,
      totalJobs: configs.length,
      enabledJobs: configs.filter(c => c.enabled).length,
      runningJobs: this.runningPipelines.size,
      scheduledJobs: this.scheduledJobs.size,
      timestamp: new Date()
    };
  }

  getLastRunForPipeline(pipelineName) {
    const pipelineHistory = this.jobHistory
      .filter(entry => entry.pipeline === pipelineName)
      .sort((a, b) => b.timestamp - a.timestamp);

    return pipelineHistory.length > 0 ? pipelineHistory[0] : null;
  }

  // Get job history
  getJobHistory(pipelineName = null, limit = 50) {
    let history = this.jobHistory;

    if (pipelineName) {
      history = history.filter(entry => entry.pipeline === pipelineName);
    }

    return history
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  // Get running pipelines
  getRunningPipelines() {
    return Array.from(this.runningPipelines);
  }

  // Get scheduled jobs
  getScheduledJobs() {
    return Array.from(this.scheduledJobs.keys());
  }

  // Get scheduler statistics
  getStats() {
    const configs = this.configManager.getAllConfigs();
    const recentHistory = this.jobHistory.filter(
      entry => Date.now() - entry.timestamp.getTime() < 24 * 60 * 60 * 1000 // Last 24 hours
    );

    const successfulRuns = recentHistory.filter(entry => entry.status === 'completed').length;
    const failedRuns = recentHistory.filter(entry => entry.status === 'failed').length;
    const errorRuns = recentHistory.filter(entry => entry.status === 'error').length;

    return {
      totalConfigurations: configs.length,
      enabledConfigurations: configs.filter(c => c.enabled).length,
      scheduledJobs: this.scheduledJobs.size,
      runningPipelines: this.runningPipelines.size,
      last24Hours: {
        totalRuns: recentHistory.length,
        successful: successfulRuns,
        failed: failedRuns,
        errors: errorRuns,
        successRate: recentHistory.length > 0 ? (successfulRuns / recentHistory.length * 100).toFixed(2) : 0
      },
      uptime: process.uptime(),
      timestamp: new Date()
    };
  }

  // Restart scheduler (useful for configuration changes)
  restart() {
    console.log('🔄 Restarting ETL Scheduler...');
    this.stop();
    
    // Reload configurations
    this.configManager.loadConfigurations();
    
    // Restart with new configurations
    this.start();
    console.log('✅ ETL Scheduler restarted');
  }
}

module.exports = ETLScheduler;
