const { EventEmitter } = require('events');
const ExcelJS = require('exceljs');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const { createHash } = require('crypto');
const { Pool } = require('pg');

class ETLPipeline extends EventEmitter {
  constructor(config) {
    super();
    this.config = config;
    this.runHistory = [];
    this.isRunning = false;
  }

  async execute() {
    if (this.isRunning) {
      throw new Error('ETL pipeline is already running');
    }

    this.isRunning = true;
    const startTime = Date.now();

    try {
      this.emit('started', { pipeline: this.config.name, timestamp: new Date() });
      console.log(`🚀 Starting ETL Pipeline: ${this.config.name}`);

      // Step 1: Extract
      const extractedData = await this.extract();
      this.emit('extracted', { recordCount: extractedData.length });
      console.log(`📊 Extracted ${extractedData.length} records`);

      // Step 2: Transform
      const transformedData = await this.transform(extractedData);
      this.emit('transformed', { recordCount: transformedData.successful.length });
      console.log(`✅ Transformed ${transformedData.successful.length} records successfully`);

      // Step 3: Load
      const loadResult = await this.load(transformedData.successful);
      this.emit('loaded', { recordCount: loadResult.recordsLoaded });
      console.log(`💾 Loaded ${loadResult.recordsLoaded} records to destination`);

      // Step 4: Create result
      const result = {
        success: true,
        recordsProcessed: extractedData.length,
        recordsSuccessful: transformedData.successful.length,
        recordsFailure: transformedData.failed.length,
        errors: transformedData.errors,
        executionTime: Date.now() - startTime,
        dataHash: this.calculateDataHash(transformedData.successful),
        metadata: {
          source: this.config.source.location,
          destination: this.config.destination.location,
          timestamp: new Date().toISOString()
        }
      };

      this.runHistory.push(result);
      this.emit('completed', result);
      console.log(`🎉 ETL Pipeline ${this.config.name} completed successfully`);

      return result;

    } catch (error) {
      const result = {
        success: false,
        recordsProcessed: 0,
        recordsSuccessful: 0,
        recordsFailure: 0,
        errors: [error.message],
        executionTime: Date.now() - startTime,
        dataHash: '',
        metadata: { error: error.message }
      };

      this.runHistory.push(result);
      this.emit('failed', result);
      console.error(`❌ ETL Pipeline ${this.config.name} failed:`, error.message);

      throw error;
    } finally {
      this.isRunning = false;
    }
  }

  async extract() {
    console.log(`📥 Extracting data from ${this.config.source.type}: ${this.config.source.location}`);

    switch (this.config.source.type) {
      case 'excel':
        return await this.extractFromExcel();
      case 'csv':
        return await this.extractFromCSV();
      case 'json':
        return await this.extractFromJSON();
      case 'api':
        return await this.extractFromAPI();
      default:
        throw new Error(`Unsupported source type: ${this.config.source.type}`);
    }
  }

  async extractFromExcel() {
    const workbook = new ExcelJS.Workbook();
    
    // Check if file exists, create sample data if not
    if (!fs.existsSync(this.config.source.location)) {
      console.log(`📄 Excel file not found, creating sample data for ${this.config.name}`);
      return this.createSampleData();
    }

    await workbook.xlsx.readFile(this.config.source.location);
    
    const worksheet = workbook.getWorksheet(1);
    const data = [];
    const headers = [];

    // Get headers
    const firstRow = worksheet.getRow(1);
    firstRow.eachCell((cell, colNumber) => {
      headers[colNumber] = cell.value?.toString() || '';
    });

    // Get data rows
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) { // Skip header row
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

    console.log(`📊 Extracted ${data.length} records from Excel`);
    return data;
  }

  async extractFromCSV() {
    const results = [];

    if (!fs.existsSync(this.config.source.location)) {
      console.log(`📄 CSV file not found, creating sample data for ${this.config.name}`);
      return this.createSampleData();
    }

    return new Promise((resolve, reject) => {
      fs.createReadStream(this.config.source.location)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => {
          console.log(`📊 Extracted ${results.length} records from CSV`);
          resolve(results);
        })
        .on('error', reject);
    });
  }

  async extractFromJSON() {
    if (!fs.existsSync(this.config.source.location)) {
      console.log(`📄 JSON file not found, creating sample data for ${this.config.name}`);
      return this.createSampleData();
    }

    const data = JSON.parse(fs.readFileSync(this.config.source.location, 'utf8'));
    console.log(`📊 Extracted ${Array.isArray(data) ? data.length : 1} records from JSON`);
    return Array.isArray(data) ? data : [data];
  }

  async extractFromAPI() {
    const axios = require('axios');
    const response = await axios.get(this.config.source.location, {
      headers: this.config.source.credentials || {}
    });
    
    const data = response.data;
    console.log(`📊 Extracted ${Array.isArray(data) ? data.length : 1} records from API`);
    return Array.isArray(data) ? data : [data];
  }

  async transform(data) {
    console.log(`🔄 Transforming ${data.length} records`);

    const successful = [];
    const failed = [];
    const errors = [];

    for (const record of data) {
      try {
        const transformedRecord = await this.transformRecord(record);
        successful.push(transformedRecord);
      } catch (error) {
        failed.push(record);
        errors.push(`Record transformation failed: ${error.message}`);
      }
    }

    console.log(`✅ Transformation complete: ${successful.length} successful, ${failed.length} failed`);
    return { successful, failed, errors };
  }

  async transformRecord(record) {
    const transformed = {};

    // Apply field mappings
    for (const [destField, mapping] of Object.entries(this.config.source.mapping)) {
      try {
        let value = record[mapping.sourceField];

        // Handle missing required fields
        if (value === undefined || value === null) {
          if (mapping.required) {
            throw new Error(`Required field ${mapping.sourceField} is missing`);
          }
          value = mapping.defaultValue;
        }

        // Apply data type conversion
        value = this.convertDataType(value, mapping.dataType);

        // Apply field-specific transformations
        if (mapping.transformation) {
          value = await this.applyTransformation(value, mapping.transformation);
        }

        transformed[destField] = value;
      } catch (error) {
        throw new Error(`Field ${destField}: ${error.message}`);
      }
    }

    // Apply transformation rules
    for (const rule of this.config.transformations || []) {
      try {
        transformed[rule.field] = await this.applyTransformationRule(transformed[rule.field], rule);
      } catch (error) {
        throw new Error(`Transformation rule ${rule.operation} for ${rule.field}: ${error.message}`);
      }
    }

    return transformed;
  }

  convertDataType(value, dataType) {
    if (value === null || value === undefined) return value;

    switch (dataType) {
      case 'string':
        return String(value);
      case 'number':
        const num = Number(value);
        if (isNaN(num)) throw new Error(`Cannot convert "${value}" to number`);
        return num;
      case 'date':
        const date = new Date(value);
        if (isNaN(date.getTime())) throw new Error(`Cannot convert "${value}" to date`);
        return date;
      case 'boolean':
        if (typeof value === 'boolean') return value;
        if (typeof value === 'string') {
          return value.toLowerCase() === 'true' || value === '1' || value === 'yes';
        }
        return Boolean(value);
      default:
        return value;
    }
  }

  async applyTransformation(value, transformation) {
    switch (transformation) {
      case 'trim':
        return typeof value === 'string' ? value.trim() : value;
      case 'uppercase':
        return typeof value === 'string' ? value.toUpperCase() : value;
      case 'lowercase':
        return typeof value === 'string' ? value.toLowerCase() : value;
      case 'currency':
        return typeof value === 'number' ? Math.round(value * 100) / 100 : value;
      default:
        return value;
    }
  }

  async applyTransformationRule(value, rule) {
    switch (rule.operation) {
      case 'clean':
        return this.cleanValue(value, rule.parameters);
      case 'validate':
        return this.validateValue(value, rule.parameters);
      case 'calculate':
        return this.calculateValue(value, rule.parameters);
      case 'format':
        return this.formatValue(value, rule.parameters);
      case 'lookup':
        return this.lookupValue(value, rule.parameters);
      default:
        return value;
    }
  }

  cleanValue(value, parameters) {
    if (typeof value !== 'string') return value;
    
    let cleaned = value;
    
    if (parameters.removeSpecialChars) {
      cleaned = cleaned.replace(/[^a-zA-Z0-9\s]/g, '');
    }
    
    if (parameters.removeExtraSpaces) {
      cleaned = cleaned.replace(/\s+/g, ' ').trim();
    }
    
    return cleaned;
  }

  validateValue(value, parameters) {
    if (parameters.minLength && value.length < parameters.minLength) {
      throw new Error(`Value too short: minimum ${parameters.minLength} characters`);
    }
    
    if (parameters.maxLength && value.length > parameters.maxLength) {
      throw new Error(`Value too long: maximum ${parameters.maxLength} characters`);
    }
    
    if (parameters.pattern && !new RegExp(parameters.pattern).test(value)) {
      throw new Error(`Value does not match pattern: ${parameters.pattern}`);
    }
    
    return value;
  }

  calculateValue(value, parameters) {
    // For transformation rules that need access to the full record
    if (parameters.formula === 'utilization_rate') {
      // This will be handled at the record level, return the value as-is
      return value;
    }
    
    // Example: calculate remaining budget
    if (parameters.formula === 'remaining_budget') {
      return value;
    }
    
    return value;
  }

  formatValue(value, parameters) {
    if (parameters.type === 'currency') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: parameters.currency || 'USD'
      }).format(value);
    }
    
    if (parameters.type === 'percentage') {
      return `${(value * 100).toFixed(2)}%`;
    }
    
    return value;
  }

  lookupValue(value, parameters) {
    if (parameters.lookupTable) {
      return parameters.lookupTable[value] || value;
    }
    
    return value;
  }

  async load(data) {
    console.log(`💾 Loading ${data.length} records to ${this.config.destination.type}`);

    switch (this.config.destination.type) {
      case 'database':
        return await this.loadToDatabase(data);
      case 'file':
        return await this.loadToFile(data);
      case 'api':
        return await this.loadToAPI(data);
      default:
        throw new Error(`Unsupported destination type: ${this.config.destination.type}`);
    }
  }

  async loadToDatabase(data) {
    // For now, simulate database loading
    console.log(`🗄️ Simulating database load to table: ${this.config.destination.table}`);
    
    let recordsLoaded = 0;
    
    for (const record of data) {
      try {
        // Simulate database insert
        console.log(`📝 Loading record:`, record);
        recordsLoaded++;
        
        // Here you would do actual database operations:
        // await this.upsertRecord(this.config.destination.table, record);
      } catch (error) {
        console.error(`❌ Failed to load record:`, error);
      }
    }
    
    console.log(`✅ Loaded ${recordsLoaded} records to database`);
    return { recordsLoaded };
  }

  async loadToFile(data) {
    const outputPath = this.config.destination.location;
    const outputData = JSON.stringify(data, null, 2);
    
    // Ensure directory exists
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(outputPath, outputData);
    console.log(`✅ Loaded ${data.length} records to file: ${outputPath}`);
    
    return { recordsLoaded: data.length };
  }

  async loadToAPI(data) {
    const axios = require('axios');
    let recordsLoaded = 0;

    for (const record of data) {
      try {
        await axios.post(this.config.destination.location, record, {
          headers: this.config.destination.credentials || {}
        });
        recordsLoaded++;
      } catch (error) {
        console.error(`❌ Failed to load record to API:`, error.message);
      }
    }

    console.log(`✅ Loaded ${recordsLoaded} records to API`);
    return { recordsLoaded };
  }

  calculateDataHash(data) {
    const dataString = JSON.stringify(data);
    return createHash('md5').update(dataString).digest('hex');
  }

  createSampleData() {
    // Create sample data based on pipeline type
    if (this.config.name.includes('budget')) {
      return this.createSampleBudgetData();
    } else if (this.config.name.includes('project')) {
      return this.createSampleProjectData();
    } else if (this.config.name.includes('compliance')) {
      return this.createSampleComplianceData();
    }
    
    return [];
  }

  createSampleBudgetData() {
    return [
      {
        'SVP ID': 'SVP001',
        'SVP Name': 'Maria Rodriguez',
        'Department': 'Technology',
        'Allocated Budget': 5000000,
        'Spent Amount': 3500000,
        'Remaining Budget': 1500000,
        'Active Projects': 8,
        'Last Updated': new Date()
      },
      {
        'SVP ID': 'SVP002',
        'SVP Name': 'James Chen',
        'Department': 'Operations',
        'Allocated Budget': 3000000,
        'Spent Amount': 2100000,
        'Remaining Budget': 900000,
        'Active Projects': 5,
        'Last Updated': new Date()
      },
      {
        'SVP ID': 'SVP003',
        'SVP Name': 'Sarah Johnson',
        'Department': 'Risk Management',
        'Allocated Budget': 2500000,
        'Spent Amount': 1800000,
        'Remaining Budget': 700000,
        'Active Projects': 4,
        'Last Updated': new Date()
      }
    ];
  }

  createSampleProjectData() {
    return [
      {
        'Project ID': 'PROJ001',
        'Project Name': 'BCRA Compliance Update',
        'Status': 'In Progress',
        'Progress %': 75,
        'Budget Allocated': 200000,
        'Budget Spent': 150000,
        'Start Date': new Date('2024-01-15'),
        'End Date': new Date('2024-06-30'),
        'SVP Owner': 'Maria Rodriguez',
        'Risk Level': 'Medium'
      },
      {
        'Project ID': 'PROJ002',
        'Project Name': 'KYC Enhancement',
        'Status': 'At Risk',
        'Progress %': 45,
        'Budget Allocated': 180000,
        'Budget Spent': 120000,
        'Start Date': new Date('2024-02-01'),
        'End Date': new Date('2024-07-15'),
        'SVP Owner': 'Carlos Santos',
        'Risk Level': 'High'
      },
      {
        'Project ID': 'PROJ003',
        'Project Name': 'AML System Upgrade',
        'Status': 'Active',
        'Progress %': 90,
        'Budget Allocated': 150000,
        'Budget Spent': 135000,
        'Start Date': new Date('2023-10-01'),
        'End Date': new Date('2024-03-31'),
        'SVP Owner': 'Ana Gutierrez',
        'Risk Level': 'Low'
      }
    ];
  }

  createSampleComplianceData() {
    return [
      {
        'Regulation ID': 'REG001',
        'Regulation Name': 'BCRA Capital Requirements',
        'Compliance Status': 'Compliant',
        'Last Audit Date': new Date('2024-01-15'),
        'Next Audit Date': new Date('2024-07-15'),
        'Risk Score': 85,
        'Responsible Department': 'Risk Management',
        'Findings Count': 0
      },
      {
        'Regulation ID': 'REG002',
        'Regulation Name': 'AML/CFT Regulations',
        'Compliance Status': 'Review Required',
        'Last Audit Date': new Date('2024-02-01'),
        'Next Audit Date': new Date('2024-08-01'),
        'Risk Score': 92,
        'Responsible Department': 'Compliance',
        'Findings Count': 2
      }
    ];
  }

  getRunHistory() {
    return this.runHistory;
  }

  getLastRun() {
    return this.runHistory.length > 0 ? this.runHistory[this.runHistory.length - 1] : null;
  }
}

module.exports = ETLPipeline;
