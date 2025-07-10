const fs = require('fs');
const path = require('path');

class ETLConfigManager {
  constructor(configPath = './backend/etl-configs') {
    this.configs = new Map();
    this.configPath = configPath;
    this.loadConfigurations();
  }

  // Budget ETL Configuration
  createBudgetETLConfig() {
    return {
      name: 'budget_etl',
      source: {
        type: 'excel',
        location: './data/budget/Q4_Budget_2024.xlsx',
        mapping: {
          svp_id: {
            sourceField: 'SVP ID',
            dataType: 'string',
            required: true
          },
          svp_name: {
            sourceField: 'SVP Name',
            dataType: 'string',
            required: true,
            transformation: 'trim'
          },
          department: {
            sourceField: 'Department',
            dataType: 'string',
            required: true,
            transformation: 'trim'
          },
          allocated_budget: {
            sourceField: 'Allocated Budget',
            dataType: 'number',
            required: true
          },
          spent_amount: {
            sourceField: 'Spent Amount',
            dataType: 'number',
            required: true
          },
          remaining_budget: {
            sourceField: 'Remaining Budget',
            dataType: 'number',
            required: false,
            defaultValue: 0
          },
          active_projects: {
            sourceField: 'Active Projects',
            dataType: 'number',
            required: false,
            defaultValue: 0
          },
          last_updated: {
            sourceField: 'Last Updated',
            dataType: 'date',
            required: false,
            defaultValue: new Date()
          }
        }
      },
      destination: {
        type: 'database',
        location: process.env.DATABASE_URL || 'postgresql://localhost:5432/citi_dashboard',
        table: 'budget_data'
      },
      transformations: [
        {
          field: 'utilization_rate',
          operation: 'calculate',
          parameters: {
            formula: 'utilization_rate'
          }
        },
        {
          field: 'budget_status',
          operation: 'calculate',
          parameters: {
            formula: 'budget_status'
          }
        },
        {
          field: 'svp_name',
          operation: 'clean',
          parameters: {
            removeSpecialChars: false,
            removeExtraSpaces: true
          }
        }
      ],
      schedule: '0 */6 * * *', // Every 6 hours
      enabled: true
    };
  }

  // Project ETL Configuration
  createProjectETLConfig() {
    return {
      name: 'project_etl',
      source: {
        type: 'excel',
        location: './data/projects/Project_Tracker_2024.xlsx',
        mapping: {
          project_id: {
            sourceField: 'Project ID',
            dataType: 'string',
            required: true
          },
          project_name: {
            sourceField: 'Project Name',
            dataType: 'string',
            required: true,
            transformation: 'trim'
          },
          status: {
            sourceField: 'Status',
            dataType: 'string',
            required: true,
            transformation: 'lowercase'
          },
          progress_percent: {
            sourceField: 'Progress %',
            dataType: 'number',
            required: true
          },
          budget_allocated: {
            sourceField: 'Budget Allocated',
            dataType: 'number',
            required: true
          },
          budget_spent: {
            sourceField: 'Budget Spent',
            dataType: 'number',
            required: true
          },
          start_date: {
            sourceField: 'Start Date',
            dataType: 'date',
            required: true
          },
          end_date: {
            sourceField: 'End Date',
            dataType: 'date',
            required: true
          },
          svp_owner: {
            sourceField: 'SVP Owner',
            dataType: 'string',
            required: true,
            transformation: 'trim'
          },
          risk_level: {
            sourceField: 'Risk Level',
            dataType: 'string',
            required: false,
            defaultValue: 'Low'
          }
        }
      },
      destination: {
        type: 'database',
        location: process.env.DATABASE_URL || 'postgresql://localhost:5432/citi_dashboard',
        table: 'project_data'
      },
      transformations: [
        {
          field: 'budget_utilization',
          operation: 'calculate',
          parameters: {
            formula: 'utilization_rate'
          }
        },
        {
          field: 'days_remaining',
          operation: 'calculate',
          parameters: {
            formula: 'days_remaining'
          }
        },
        {
          field: 'project_health',
          operation: 'calculate',
          parameters: {
            formula: 'project_health'
          }
        }
      ],
      schedule: '0 */4 * * *', // Every 4 hours
      enabled: true
    };
  }

  // Compliance ETL Configuration
  createComplianceETLConfig() {
    return {
      name: 'compliance_etl',
      source: {
        type: 'excel',
        location: './data/compliance/Compliance_Tracker_2024.xlsx',
        mapping: {
          regulation_id: {
            sourceField: 'Regulation ID',
            dataType: 'string',
            required: true
          },
          regulation_name: {
            sourceField: 'Regulation Name',
            dataType: 'string',
            required: true,
            transformation: 'trim'
          },
          compliance_status: {
            sourceField: 'Compliance Status',
            dataType: 'string',
            required: true,
            transformation: 'lowercase'
          },
          last_audit_date: {
            sourceField: 'Last Audit Date',
            dataType: 'date',
            required: false
          },
          next_audit_date: {
            sourceField: 'Next Audit Date',
            dataType: 'date',
            required: true
          },
          risk_score: {
            sourceField: 'Risk Score',
            dataType: 'number',
            required: true
          },
          responsible_department: {
            sourceField: 'Responsible Department',
            dataType: 'string',
            required: true,
            transformation: 'trim'
          },
          findings_count: {
            sourceField: 'Findings Count',
            dataType: 'number',
            required: false,
            defaultValue: 0
          }
        }
      },
      destination: {
        type: 'database',
        location: process.env.DATABASE_URL || 'postgresql://localhost:5432/citi_dashboard',
        table: 'compliance_data'
      },
      transformations: [
        {
          field: 'days_to_audit',
          operation: 'calculate',
          parameters: {
            formula: 'days_to_audit'
          }
        },
        {
          field: 'compliance_health',
          operation: 'calculate',
          parameters: {
            formula: 'compliance_health'
          }
        }
      ],
      schedule: '0 8 * * *', // Daily at 8 AM
      enabled: true
    };
  }

  // Large-scale dummy data ETL configuration
  createLargeDataETLConfig() {
    return {
      name: 'large_data_etl',
      source: {
        type: 'json',
        location: './data/generated/large_dataset.json',
        mapping: {
          id: {
            sourceField: 'id',
            dataType: 'string',
            required: true
          },
          name: {
            sourceField: 'name',
            dataType: 'string',
            required: true,
            transformation: 'trim'
          },
          value: {
            sourceField: 'value',
            dataType: 'number',
            required: true
          },
          category: {
            sourceField: 'category',
            dataType: 'string',
            required: true,
            transformation: 'lowercase'
          },
          created_at: {
            sourceField: 'created_at',
            dataType: 'date',
            required: false,
            defaultValue: new Date()
          }
        }
      },
      destination: {
        type: 'file',
        location: './data/processed/large_dataset_processed.json'
      },
      transformations: [
        {
          field: 'name',
          operation: 'clean',
          parameters: {
            removeSpecialChars: false,
            removeExtraSpaces: true
          }
        },
        {
          field: 'value',
          operation: 'validate',
          parameters: {
            minValue: 0,
            maxValue: 1000000
          }
        }
      ],
      schedule: '0 2 * * *', // Daily at 2 AM
      enabled: false // Disabled by default
    };
  }

  saveConfig(config) {
    this.configs.set(config.name, config);
    this.saveConfigurations();
    console.log(`💾 Saved ETL configuration: ${config.name}`);
  }

  getConfig(name) {
    return this.configs.get(name);
  }

  getAllConfigs() {
    return Array.from(this.configs.values());
  }

  getEnabledConfigs() {
    return Array.from(this.configs.values()).filter(config => config.enabled);
  }

  enableConfig(name) {
    const config = this.configs.get(name);
    if (config) {
      config.enabled = true;
      this.saveConfig(config);
      console.log(`✅ Enabled ETL configuration: ${name}`);
    }
  }

  disableConfig(name) {
    const config = this.configs.get(name);
    if (config) {
      config.enabled = false;
      this.saveConfig(config);
      console.log(`⏸️ Disabled ETL configuration: ${name}`);
    }
  }

  updateSchedule(name, schedule) {
    const config = this.configs.get(name);
    if (config) {
      config.schedule = schedule;
      this.saveConfig(config);
      console.log(`⏰ Updated schedule for ${name}: ${schedule}`);
    }
  }

  deleteConfig(name) {
    if (this.configs.delete(name)) {
      this.saveConfigurations();
      console.log(`🗑️ Deleted ETL configuration: ${name}`);
      return true;
    }
    return false;
  }

  loadConfigurations() {
    try {
      const configFile = path.join(this.configPath, 'etl-configs.json');
      if (fs.existsSync(configFile)) {
        const configData = fs.readFileSync(configFile, 'utf8');
        const configs = JSON.parse(configData);
        
        for (const config of configs) {
          this.configs.set(config.name, config);
        }
        console.log(`📂 Loaded ${configs.length} ETL configurations`);
      } else {
        console.log('📂 No existing ETL configurations found, will create defaults');
        this.createDefaultConfigurations();
      }
    } catch (error) {
      console.error('❌ Error loading ETL configurations:', error.message);
      this.createDefaultConfigurations();
    }
  }

  saveConfigurations() {
    try {
      if (!fs.existsSync(this.configPath)) {
        fs.mkdirSync(this.configPath, { recursive: true });
      }
      
      const configs = Array.from(this.configs.values());
      const configFile = path.join(this.configPath, 'etl-configs.json');
      fs.writeFileSync(configFile, JSON.stringify(configs, null, 2));
      console.log(`💾 Saved ${configs.length} ETL configurations to ${configFile}`);
    } catch (error) {
      console.error('❌ Error saving ETL configurations:', error.message);
    }
  }

  createDefaultConfigurations() {
    console.log('🏗️ Creating default ETL configurations...');
    
    // Create default configurations
    const budgetConfig = this.createBudgetETLConfig();
    const projectConfig = this.createProjectETLConfig();
    const complianceConfig = this.createComplianceETLConfig();
    const largeDataConfig = this.createLargeDataETLConfig();

    this.saveConfig(budgetConfig);
    this.saveConfig(projectConfig);
    this.saveConfig(complianceConfig);
    this.saveConfig(largeDataConfig);

    console.log('✅ Default ETL configurations created');
  }

  // Validate configuration
  validateConfig(config) {
    const errors = [];

    // Required fields
    if (!config.name) errors.push('Configuration name is required');
    if (!config.source) errors.push('Source configuration is required');
    if (!config.destination) errors.push('Destination configuration is required');

    // Source validation
    if (config.source) {
      if (!config.source.type) errors.push('Source type is required');
      if (!config.source.location) errors.push('Source location is required');
      if (!config.source.mapping) errors.push('Source mapping is required');
    }

    // Destination validation
    if (config.destination) {
      if (!config.destination.type) errors.push('Destination type is required');
      if (!config.destination.location) errors.push('Destination location is required');
    }

    // Schedule validation (if provided)
    if (config.schedule) {
      // Basic cron validation - you might want to use a proper cron validator
      const cronParts = config.schedule.split(' ');
      if (cronParts.length !== 5) {
        errors.push('Schedule must be a valid cron expression (5 parts)');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Get configuration statistics
  getStats() {
    const configs = this.getAllConfigs();
    const enabled = configs.filter(c => c.enabled);
    const scheduled = configs.filter(c => c.schedule);
    
    const sourceTypes = {};
    const destinationTypes = {};
    
    configs.forEach(config => {
      sourceTypes[config.source.type] = (sourceTypes[config.source.type] || 0) + 1;
      destinationTypes[config.destination.type] = (destinationTypes[config.destination.type] || 0) + 1;
    });

    return {
      total: configs.length,
      enabled: enabled.length,
      disabled: configs.length - enabled.length,
      scheduled: scheduled.length,
      sourceTypes,
      destinationTypes,
      lastUpdated: new Date()
    };
  }

  // Export configuration for backup
  exportConfigurations(filePath) {
    try {
      const configs = Array.from(this.configs.values());
      const exportData = {
        exportDate: new Date().toISOString(),
        version: '1.0',
        configurations: configs
      };
      
      fs.writeFileSync(filePath, JSON.stringify(exportData, null, 2));
      console.log(`📤 Exported ${configs.length} configurations to ${filePath}`);
      return true;
    } catch (error) {
      console.error('❌ Error exporting configurations:', error.message);
      return false;
    }
  }

  // Import configuration from backup
  importConfigurations(filePath) {
    try {
      const importData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      if (importData.configurations) {
        for (const config of importData.configurations) {
          const validation = this.validateConfig(config);
          if (validation.isValid) {
            this.saveConfig(config);
          } else {
            console.warn(`⚠️ Skipping invalid configuration ${config.name}:`, validation.errors);
          }
        }
        console.log(`📥 Imported configurations from ${filePath}`);
        return true;
      } else {
        console.error('❌ Invalid import file format');
        return false;
      }
    } catch (error) {
      console.error('❌ Error importing configurations:', error.message);
      return false;
    }
  }
}

module.exports = ETLConfigManager;
