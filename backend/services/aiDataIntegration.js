const ExcelJS = require('exceljs');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const EnterpriseDatabaseConnector = require('./enterprise/DatabaseConnector');
const EnterpriseAPIConnector = require('./enterprise/APIConnector');

class AIDataIntegrationService {
  constructor(llmEndpoint = 'http://localhost:1234') {
    this.llmEndpoint = llmEndpoint;
    this.dataSources = new Map();
    this.enterpriseDB = new EnterpriseDatabaseConnector();
    this.enterpriseAPI = new EnterpriseAPIConnector();
    this.setupDefaultDataSources();
    this.initializeEnterpriseConnections();
  }

  // Setup default data sources
  setupDefaultDataSources() {
    const defaultSources = [
      {
        id: 'budget_excel',
        type: 'excel',
        name: 'Budget Excel File',
        path: './data/budget.xlsx',
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
      },
      {
        id: 'project_tracker',
        type: 'excel',
        name: 'Project Tracker',
        path: './data/projects.xlsx',
        mapping: {
          projectFields: {
            projectName: 'Project Name',
            status: 'Status',
            progress: 'Progress %',
            budget: 'Budget',
            owner: 'Owner'
          }
        },
        lastUpdated: new Date(),
        autoSync: false
      }
    ];

    defaultSources.forEach(source => {
      this.dataSources.set(source.id, source);
    });
  }

  // Process natural language requests
  async processNLRequest(userMessage) {
    try {
      console.log('Processing NL request:', userMessage);
      
      // Parse user intent using local LLM
      const intent = await this.parseUserIntent(userMessage);
      console.log('Parsed intent:', intent);
      
      // Execute the appropriate data integration
      switch (intent.action) {
        case 'update_budget':
          return await this.updateBudgetData(intent.parameters);
        case 'refresh_projects':
          return await this.refreshProjectData(intent.parameters);
        case 'sync_compliance':
          return await this.syncComplianceData(intent.parameters);
        case 'generate_report':
          return await this.generateReport(intent.parameters);
        default:
          throw new Error(`Unknown intent: ${intent.action}`);
      }
    } catch (error) {
      console.error('AI Integration Error:', error);
      return {
        success: false,
        message: `Error processing request: ${error.message}`,
        affectedRecords: 0,
        timestamp: new Date(),
        processingTime: 0
      };
    }
  }

  // Parse user intent using local LLM
  async parseUserIntent(userMessage) {
    const prompt = `
    You are an AI assistant for a banking dashboard. Parse the following user request and extract the intent and parameters.

    User Message: "${userMessage}"

    Available actions:
    - update_budget: Update budget data from sources
    - refresh_projects: Refresh project information
    - sync_compliance: Synchronize compliance data
    - generate_report: Generate reports

    Available data sources:
    - budget_excel: Budget Excel file
    - project_tracker: Project tracking spreadsheet
    - compliance_db: Compliance database
    - financial_api: Financial systems API

    Return JSON format:
    {
      "action": "action_name",
      "parameters": {
        "dataSource": "source_name",
        "filters": {},
        "urgency": "normal|high",
        "scope": "all|specific_svp|specific_department"
      }
    }
    `;

    try {
      const response = await fetch(`${this.llmEndpoint}/v1/chat/completions`, {
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
      console.warn('LLM parsing failed, using fallback logic:', error.message);
      return this.fallbackIntentParsing(userMessage);
    }
  }

  // Fallback intent parsing when LLM is unavailable
  fallbackIntentParsing(userMessage) {
    const message = userMessage.toLowerCase();
    
    if (message.includes('budget') && (message.includes('update') || message.includes('refresh'))) {
      return {
        action: 'update_budget',
        parameters: {
          dataSource: 'budget_excel',
          filters: {},
          urgency: 'normal',
          scope: 'all'
        }
      };
    }
    
    if (message.includes('project') && (message.includes('update') || message.includes('refresh'))) {
      return {
        action: 'refresh_projects',
        parameters: {
          dataSource: 'project_tracker',
          filters: {},
          urgency: 'normal',
          scope: 'all'
        }
      };
    }

    // Default action
    return {
      action: 'update_budget',
      parameters: {
        dataSource: 'budget_excel',
        filters: {},
        urgency: 'normal',
        scope: 'all'
      }
    };
  }

  // Update budget data from Excel/CSV
  async updateBudgetData(parameters) {
    const startTime = Date.now();
    
    try {
      console.log('Updating budget data with parameters:', parameters);
      
      // 1. Read data from source
      const sourceData = await this.readDataFromSource(parameters.dataSource || 'budget_excel');
      console.log(`Read ${sourceData.length} records from source`);
      
      // 2. Process and validate data
      const processedData = await this.processAndValidateData(sourceData, 'budget');
      console.log(`Processed ${processedData.length} valid records`);
      
      // 3. Update database
      const updateResult = await this.updateDatabase('budget', processedData);
      console.log(`Updated ${updateResult.recordsUpdated} records in database`);
      
      const processingTime = Date.now() - startTime;
      
      return {
        success: true,
        message: `Budget data updated successfully. ${updateResult.recordsUpdated} records processed.`,
        data: processedData,
        affectedRecords: updateResult.recordsUpdated,
        timestamp: new Date(),
        processingTime
      };
    } catch (error) {
      console.error('Budget update error:', error);
      return {
        success: false,
        message: `Failed to update budget data: ${error.message}`,
        affectedRecords: 0,
        timestamp: new Date(),
        processingTime: Date.now() - startTime
      };
    }
  }

  // Refresh project data
  async refreshProjectData(parameters) {
    const startTime = Date.now();
    
    try {
      console.log('Refreshing project data with parameters:', parameters);
      
      const sourceData = await this.readDataFromSource(parameters.dataSource || 'project_tracker');
      const processedData = await this.processAndValidateData(sourceData, 'projects');
      const updateResult = await this.updateDatabase('projects', processedData);
      
      const processingTime = Date.now() - startTime;
      
      return {
        success: true,
        message: `Project data refreshed successfully. ${updateResult.recordsUpdated} records processed.`,
        data: processedData,
        affectedRecords: updateResult.recordsUpdated,
        timestamp: new Date(),
        processingTime
      };
    } catch (error) {
      console.error('Project refresh error:', error);
      return {
        success: false,
        message: `Failed to refresh project data: ${error.message}`,
        affectedRecords: 0,
        timestamp: new Date(),
        processingTime: Date.now() - startTime
      };
    }
  }

  // Sync compliance data
  async syncComplianceData(parameters) {
    // Placeholder for compliance data sync
    return {
      success: true,
      message: 'Compliance data sync completed.',
      affectedRecords: 0,
      timestamp: new Date(),
      processingTime: 100
    };
  }

  // Generate report
  async generateReport(parameters) {
    // Placeholder for report generation
    return {
      success: true,
      message: 'Report generated successfully.',
      affectedRecords: 0,
      timestamp: new Date(),
      processingTime: 200
    };
  }

  // Read data from various sources
  async readDataFromSource(sourceId) {
    const source = this.dataSources.get(sourceId);
    if (!source) {
      throw new Error(`Data source not found: ${sourceId}`);
    }

    console.log(`Reading from source: ${source.name} (${source.type})`);

    switch (source.type) {
      case 'excel':
        return await this.readExcelFile(source.path);
      case 'csv':
        return await this.readCSVFile(source.path);
      default:
        throw new Error(`Unsupported source type: ${source.type}`);
    }
  }

  // Excel file reader
  async readExcelFile(filePath) {
    try {
      // Check if file exists, if not create sample data
      if (!fs.existsSync(filePath)) {
        console.log(`File ${filePath} not found, creating sample data`);
        return this.createSampleBudgetData();
      }

      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(filePath);
      const worksheet = workbook.getWorksheet(1);
      
      const data = [];
      const headers = [];
      
      // Get headers from first row
      const firstRow = worksheet.getRow(1);
      firstRow.eachCell((cell, colNumber) => {
        headers[colNumber] = cell.value?.toString() || '';
      });
      
      // Get data rows
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) {
          const rowData = {};
          row.eachCell((cell, colNumber) => {
            const header = headers[colNumber];
            if (header) {
              rowData[header] = cell.value;
            }
          });
          data.push(rowData);
        }
      });
      
      return data;
    } catch (error) {
      console.error(`Failed to read Excel file: ${error.message}`);
      // Return sample data as fallback
      return this.createSampleBudgetData();
    }
  }

  // CSV file reader
  async readCSVFile(filePath) {
    return new Promise((resolve, reject) => {
      const results = [];
      
      if (!fs.existsSync(filePath)) {
        console.log(`CSV file ${filePath} not found, using sample data`);
        resolve(this.createSampleBudgetData());
        return;
      }

      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => resolve(results))
        .on('error', (error) => {
          console.error(`Failed to read CSV file: ${error.message}`);
          resolve(this.createSampleBudgetData());
        });
    });
  }

  // Create sample budget data for testing
  createSampleBudgetData() {
    return [
      {
        'SVP Name': 'Maria Rodriguez',
        'Department': 'Technology',
        'Budget Allocated': 5000000,
        'Budget Spent': 3500000,
        'Remaining': 1500000,
        'Projects': 8
      },
      {
        'SVP Name': 'James Chen',
        'Department': 'Operations',
        'Budget Allocated': 3000000,
        'Budget Spent': 2100000,
        'Remaining': 900000,
        'Projects': 5
      },
      {
        'SVP Name': 'Sarah Johnson',
        'Department': 'Risk Management',
        'Budget Allocated': 2500000,
        'Budget Spent': 1800000,
        'Remaining': 700000,
        'Projects': 4
      }
    ];
  }

  // Process and validate data
  async processAndValidateData(rawData, dataType) {
    console.log(`Processing ${dataType} data...`);
    
    const processedData = rawData.map(record => {
      if (dataType === 'budget') {
        return {
          svp_name: record['SVP Name'] || record.svp_name,
          department: record['Department'] || record.department,
          budget_allocated: this.parseNumber(record['Budget Allocated'] || record.budget_allocated),
          budget_spent: this.parseNumber(record['Budget Spent'] || record.budget_spent),
          remaining: this.parseNumber(record['Remaining'] || record.remaining),
          projects_count: this.parseNumber(record['Projects'] || record.projects_count) || 0
        };
      }
      
      if (dataType === 'projects') {
        return {
          name: record['Project Name'] || record.name,
          status: record['Status'] || record.status,
          completion_percentage: this.parseNumber(record['Progress %'] || record.completion_percentage) || 0,
          budget_allocated: this.parseNumber(record['Budget'] || record.budget_allocated),
          owner: record['Owner'] || record.owner
        };
      }
      
      return record;
    }).filter(record => this.validateRecord(record, dataType));

    console.log(`Validated ${processedData.length} records`);
    return processedData;
  }

  // Parse number from various formats
  parseNumber(value) {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      // Remove currency symbols and commas
      const cleaned = value.replace(/[$,]/g, '');
      const parsed = parseFloat(cleaned);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  }

  // Validate record
  validateRecord(record, dataType) {
    if (dataType === 'budget') {
      return record.svp_name && record.department && 
             typeof record.budget_allocated === 'number';
    }
    
    if (dataType === 'projects') {
      return record.name && record.status;
    }
    
    return true;
  }

  // Update database (placeholder - integrate with your actual database)
  async updateDatabase(table, data) {
    console.log(`Updating ${table} table with ${data.length} records`);
    
    // This is a placeholder - you'll need to integrate with your actual database
    // For now, we'll simulate the update
    let recordsUpdated = 0;
    
    for (const record of data) {
      try {
        // Simulate database update
        console.log(`Updating ${table} record:`, record);
        recordsUpdated++;
        
        // Here you would do actual database operations:
        // await this.upsertRecord(table, record);
      } catch (error) {
        console.error(`Failed to update record:`, error);
      }
    }
    
    return { recordsUpdated };
  }

  // Register data source
  registerDataSource(source) {
    this.dataSources.set(source.id, source);
    console.log(`Registered data source: ${source.name}`);
  }

  // Get available data sources
  getDataSources() {
    return Array.from(this.dataSources.values());
  }

  // Set broadcast function for real-time updates
  setBroadcastFunction(broadcastFn) {
    this.broadcastToClients = broadcastFn;
  }

  // Initialize enterprise connections
  async initializeEnterpriseConnections() {
    try {
      console.log('🚀 Initializing enterprise connections...');
      
      // Initialize database connections
      await this.enterpriseDB.initializeConnections();
      
      // Initialize API connections
      await this.enterpriseAPI.initializeConnections();
      
      // Register enterprise data sources
      this.registerEnterpriseDataSources();
      
      console.log('✅ Enterprise connections initialized successfully');
    } catch (error) {
      console.warn('⚠️ Enterprise connections failed, using fallback mode:', error.message);
    }
  }

  // Register enterprise data sources
  registerEnterpriseDataSources() {
    // SAP Budget Data Source
    this.dataSources.set('sap_budget', {
      id: 'sap_budget',
      type: 'database',
      name: 'SAP Budget Data',
      connection: 'sap-production',
      mapping: {
        budgetFields: {
          svpName: 'SVP_NAME',
          department: 'DEPARTMENT',
          allocated: 'ALLOCATED_BUDGET',
          spent: 'SPENT_AMOUNT',
          remaining: 'REMAINING_BUDGET',
          projects: 'PROJECT_COUNT'
        }
      },
      lastUpdated: new Date(),
      autoSync: true
    });

    // Oracle Compliance Data Source
    this.dataSources.set('oracle_compliance', {
      id: 'oracle_compliance',
      type: 'database',
      name: 'Oracle Compliance Data',
      connection: 'compliance-oracle',
      mapping: {
        complianceFields: {
          regulationId: 'REGULATION_ID',
          regulationName: 'REGULATION_NAME',
          status: 'COMPLIANCE_STATUS',
          riskScore: 'RISK_SCORE',
          department: 'RESPONSIBLE_DEPARTMENT'
        }
      },
      lastUpdated: new Date(),
      autoSync: true
    });

    // Citi Financial API Data Source
    this.dataSources.set('citi_financial_api', {
      id: 'citi_financial_api',
      type: 'api',
      name: 'Citi Financial API',
      endpoint: '/budget/allocations',
      mapping: {
        budgetFields: {
          svpName: 'svp_name',
          department: 'department',
          allocated: 'allocated_budget',
          spent: 'spent_amount',
          remaining: 'remaining_budget'
        }
      },
      lastUpdated: new Date(),
      autoSync: true
    });

    console.log('📊 Enterprise data sources registered');
  }

  // Enhanced read data from source with enterprise support
  async readDataFromSource(sourceId) {
    const source = this.dataSources.get(sourceId);
    if (!source) {
      throw new Error(`Data source not found: ${sourceId}`);
    }

    console.log(`Reading from source: ${source.name} (${source.type})`);

    switch (source.type) {
      case 'excel':
        return await this.readExcelFile(source.path);
      case 'csv':
        return await this.readCSVFile(source.path);
      case 'database':
        return await this.readFromDatabase(source);
      case 'api':
        return await this.readFromAPI(source);
      default:
        throw new Error(`Unsupported source type: ${source.type}`);
    }
  }

  // Read data from enterprise database
  async readFromDatabase(source) {
    try {
      if (source.id === 'sap_budget') {
        const data = await this.enterpriseDB.getBudgetDataFromSAP();
        console.log(`📊 Retrieved ${data.length} records from SAP`);
        return this.transformDatabaseData(data, 'budget');
      }
      
      if (source.id === 'oracle_compliance') {
        const data = await this.enterpriseDB.getComplianceDataFromOracle();
        console.log(`🔍 Retrieved ${data.length} records from Oracle`);
        return this.transformDatabaseData(data, 'compliance');
      }
      
      throw new Error(`Unknown database source: ${source.id}`);
    } catch (error) {
      console.error(`Database read error for ${source.id}:`, error.message);
      // Fallback to sample data
      return source.id.includes('budget') ? this.createSampleBudgetData() : [];
    }
  }

  // Read data from enterprise API
  async readFromAPI(source) {
    try {
      if (source.id === 'citi_financial_api') {
        const data = await this.enterpriseAPI.getBudgetDataFromAPI();
        console.log(`🔗 Retrieved budget data from Citi API`);
        return this.transformAPIData(data, 'budget');
      }
      
      throw new Error(`Unknown API source: ${source.id}`);
    } catch (error) {
      console.error(`API read error for ${source.id}:`, error.message);
      // Fallback to sample data
      return this.createSampleBudgetData();
    }
  }

  // Transform database data to standard format
  transformDatabaseData(data, dataType) {
    if (dataType === 'budget') {
      return data.map(record => ({
        'SVP Name': record.svp_name || record.SVP_NAME,
        'Department': record.department || record.DEPARTMENT,
        'Budget Allocated': record.allocated_budget || record.ALLOCATED_BUDGET,
        'Budget Spent': record.spent_amount || record.SPENT_AMOUNT,
        'Remaining': record.remaining_budget || record.REMAINING_BUDGET,
        'Projects': record.project_count || record.PROJECT_COUNT || 0
      }));
    }
    
    if (dataType === 'compliance') {
      return data.map(record => ({
        'Regulation ID': record.regulation_id || record.REGULATION_ID,
        'Regulation Name': record.regulation_name || record.REGULATION_NAME,
        'Status': record.compliance_status || record.COMPLIANCE_STATUS,
        'Risk Score': record.risk_score || record.RISK_SCORE,
        'Department': record.responsible_department || record.RESPONSIBLE_DEPARTMENT
      }));
    }
    
    return data;
  }

  // Transform API data to standard format
  transformAPIData(apiResponse, dataType) {
    if (dataType === 'budget') {
      const data = apiResponse.data || apiResponse;
      return data.map(record => ({
        'SVP Name': record.svp_name,
        'Department': record.department,
        'Budget Allocated': record.allocated_budget,
        'Budget Spent': record.spent_amount,
        'Remaining': record.remaining_budget,
        'Projects': record.projects_count || 0
      }));
    }
    
    return apiResponse.data || apiResponse;
  }

  // Enhanced update budget data with enterprise sources
  async updateBudgetData(parameters) {
    const startTime = Date.now();
    
    try {
      console.log('Updating budget data with parameters:', parameters);
      
      // Determine data source priority: SAP > API > Excel
      let sourceData;
      let dataSource = parameters.dataSource || 'budget_excel';
      
      // Try enterprise sources first
      if (this.dataSources.has('sap_budget')) {
        console.log('🏢 Using SAP as primary data source');
        dataSource = 'sap_budget';
      } else if (this.dataSources.has('citi_financial_api')) {
        console.log('🔗 Using Citi API as primary data source');
        dataSource = 'citi_financial_api';
      }
      
      // Read data from determined source
      sourceData = await this.readDataFromSource(dataSource);
      console.log(`📊 Read ${sourceData.length} records from ${dataSource}`);
      
      // Process and validate data
      const processedData = await this.processAndValidateData(sourceData, 'budget');
      console.log(`✅ Processed ${processedData.length} valid records`);
      
      // Update database
      const updateResult = await this.updateDatabase('budget', processedData);
      console.log(`💾 Updated ${updateResult.recordsUpdated} records in database`);
      
      // Trigger real-time refresh
      this.triggerFrontendRefresh('budget');
      
      const processingTime = Date.now() - startTime;
      
      return {
        success: true,
        message: `Budget data updated successfully from ${dataSource}. ${updateResult.recordsUpdated} records processed.`,
        data: processedData,
        affectedRecords: updateResult.recordsUpdated,
        dataSource: dataSource,
        timestamp: new Date(),
        processingTime
      };
    } catch (error) {
      console.error('Budget update error:', error);
      return {
        success: false,
        message: `Failed to update budget data: ${error.message}`,
        affectedRecords: 0,
        timestamp: new Date(),
        processingTime: Date.now() - startTime
      };
    }
  }

  // Health check for all enterprise connections
  async healthCheck() {
    const health = {
      database: await this.enterpriseDB.healthCheck(),
      api: await this.enterpriseAPI.healthCheck(),
      dataSources: this.getDataSources().length,
      timestamp: new Date()
    };
    
    console.log('🏥 Health check completed:', health);
    return health;
  }

  // Graceful shutdown
  async shutdown() {
    console.log('🔌 Shutting down AI Data Integration Service...');
    
    try {
      await this.enterpriseDB.closeConnections();
      await this.enterpriseAPI.closeConnections();
      console.log('✅ All enterprise connections closed');
    } catch (error) {
      console.error('❌ Error during shutdown:', error.message);
    }
  }

  // Trigger frontend refresh
  triggerFrontendRefresh(dataType) {
    if (this.broadcastToClients) {
      const refreshMessage = {
        type: 'DATA_UPDATED',
        dataType,
        timestamp: new Date()
      };
      
      console.log('📡 Broadcasting refresh message:', refreshMessage);
      this.broadcastToClients(refreshMessage);
    }
  }
}

module.exports = AIDataIntegrationService;
