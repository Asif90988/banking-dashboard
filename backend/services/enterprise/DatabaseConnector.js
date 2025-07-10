const { Pool } = require('pg');

// Optional Oracle dependency - gracefully handle if not installed
let oracledb;
try {
  oracledb = require('oracledb');
} catch (error) {
  console.warn('⚠️ Oracle driver not installed - Oracle features will be disabled');
  oracledb = null;
}

class EnterpriseDatabaseConnector {
  constructor() {
    this.connections = new Map();
    this.queryCache = new Map();
    this.connectionPools = new Map();
  }

  // Connect to SAP HANA (using PostgreSQL driver)
  async connectToSAP(config) {
    try {
      const pool = new Pool({
        host: config.host,
        port: config.port,
        user: config.username,
        password: config.password,
        database: config.database,
        ssl: config.ssl || false,
        max: 20, // Maximum number of clients in the pool
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: config.connectionTimeout || 30000,
      });

      // Test the connection
      const client = await pool.connect();
      console.log(`✅ Connected to SAP HANA: ${config.host}:${config.port}`);
      client.release();

      this.connectionPools.set(config.id, pool);
      return pool;
    } catch (error) {
      console.error(`❌ Failed to connect to SAP: ${error.message}`);
      throw error;
    }
  }

  // Connect to Oracle Database
  async connectToOracle(config) {
    if (!oracledb) {
      console.warn('⚠️ Oracle driver not available - skipping Oracle connection');
      return null;
    }

    try {
      const pool = await oracledb.createPool({
        user: config.username,
        password: config.password,
        connectString: `${config.host}:${config.port}/${config.database}`,
        poolMin: 5,
        poolMax: 20,
        poolIncrement: 2,
        poolTimeout: 60,
        stmtCacheSize: 30
      });

      console.log(`✅ Connected to Oracle: ${config.host}:${config.port}`);
      this.connectionPools.set(config.id, pool);
      return pool;
    } catch (error) {
      console.error(`❌ Failed to connect to Oracle: ${error.message}`);
      throw error;
    }
  }

  // Get real-time budget data from SAP
  async getBudgetDataFromSAP(filters = {}) {
    const pool = this.connectionPools.get('sap-production');
    if (!pool) {
      console.warn('SAP connection not available, using sample data');
      return this.createSampleBudgetData();
    }

    try {
      const client = await pool.connect();
      
      const query = `
        SELECT 
          b.COST_CENTER,
          b.SVP_NAME,
          b.DEPARTMENT,
          b.ALLOCATED_BUDGET,
          b.SPENT_AMOUNT,
          b.REMAINING_BUDGET,
          b.LAST_UPDATED,
          COALESCE(p.PROJECT_COUNT, 0) as PROJECT_COUNT
        FROM BUDGET_ALLOCATIONS b
        LEFT JOIN (
          SELECT COST_CENTER, COUNT(*) as PROJECT_COUNT
          FROM PROJECTS 
          WHERE STATUS = 'ACTIVE'
          GROUP BY COST_CENTER
        ) p ON b.COST_CENTER = p.COST_CENTER
        WHERE b.FISCAL_YEAR = $1
        AND b.QUARTER = $2
        ORDER BY b.ALLOCATED_BUDGET DESC
      `;

      const result = await client.query(query, [
        filters.fiscalYear || new Date().getFullYear(),
        filters.quarter || Math.ceil((new Date().getMonth() + 1) / 3)
      ]);

      client.release();
      
      console.log(`📊 Retrieved ${result.rows.length} budget records from SAP`);
      return result.rows;
    } catch (error) {
      console.error('Error querying SAP:', error.message);
      // Fallback to sample data
      return this.createSampleBudgetData();
    }
  }

  // Get real-time project data from SAP
  async getProjectDataFromSAP(filters = {}) {
    const pool = this.connectionPools.get('sap-production');
    if (!pool) {
      console.warn('SAP connection not available, using sample data');
      return this.createSampleProjectData();
    }

    try {
      const client = await pool.connect();
      
      const query = `
        SELECT 
          p.PROJECT_ID,
          p.PROJECT_NAME,
          p.STATUS,
          p.PROGRESS_PERCENT,
          p.BUDGET_ALLOCATED,
          p.BUDGET_SPENT,
          p.START_DATE,
          p.END_DATE,
          p.SVP_OWNER,
          p.RISK_LEVEL,
          p.COMPLIANCE_STATUS,
          p.LAST_MILESTONE,
          p.NEXT_MILESTONE_DATE
        FROM PROJECTS p
        WHERE p.STATUS IN ('ACTIVE', 'IN_PROGRESS', 'AT_RISK')
        ${filters.department ? 'AND p.DEPARTMENT = $1' : ''}
        ORDER BY p.RISK_LEVEL DESC, p.END_DATE ASC
      `;

      const params = filters.department ? [filters.department] : [];
      const result = await client.query(query, params);

      client.release();
      
      console.log(`📋 Retrieved ${result.rows.length} project records from SAP`);
      return result.rows;
    } catch (error) {
      console.error('Error querying SAP projects:', error.message);
      return this.createSampleProjectData();
    }
  }

  // Get compliance data from Oracle
  async getComplianceDataFromOracle(filters = {}) {
    const pool = this.connectionPools.get('compliance-oracle');
    if (!pool) {
      console.warn('Oracle connection not available, using sample data');
      return this.createSampleComplianceData();
    }

    try {
      const connection = await pool.getConnection();
      
      const query = `
        SELECT 
          c.REGULATION_ID,
          c.REGULATION_NAME,
          c.COMPLIANCE_STATUS,
          c.LAST_AUDIT_DATE,
          c.NEXT_AUDIT_DATE,
          c.RISK_SCORE,
          c.RESPONSIBLE_DEPARTMENT,
          c.FINDINGS_COUNT,
          c.REMEDIATION_STATUS
        FROM COMPLIANCE_TRACKING c
        WHERE c.REGION = 'LATAM'
        AND c.STATUS = 'ACTIVE'
        ORDER BY c.RISK_SCORE DESC, c.NEXT_AUDIT_DATE ASC
      `;

      const result = await connection.execute(query);
      await connection.close();
      
      console.log(`🔍 Retrieved ${result.rows.length} compliance records from Oracle`);
      return result.rows;
    } catch (error) {
      console.error('Error querying Oracle compliance:', error.message);
      return this.createSampleComplianceData();
    }
  }

  // Initialize enterprise database connections
  async initializeConnections() {
    console.log('🔌 Initializing enterprise database connections...');
    
    try {
      // SAP HANA Connection
      if (process.env.SAP_HOST) {
        await this.connectToSAP({
          id: 'sap-production',
          host: process.env.SAP_HOST,
          port: parseInt(process.env.SAP_PORT) || 30015,
          username: process.env.SAP_USER,
          password: process.env.SAP_PASSWORD,
          database: process.env.SAP_DATABASE,
          ssl: process.env.SAP_SSL === 'true',
          connectionTimeout: 30000
        });
      }

      // Oracle Connection
      if (process.env.ORACLE_HOST) {
        await this.connectToOracle({
          id: 'compliance-oracle',
          host: process.env.ORACLE_HOST,
          port: parseInt(process.env.ORACLE_PORT) || 1521,
          username: process.env.ORACLE_USER,
          password: process.env.ORACLE_PASSWORD,
          database: process.env.ORACLE_SID
        });
      }

      console.log('✅ Enterprise database connections initialized');
    } catch (error) {
      console.warn('⚠️ Some database connections failed, will use fallback data');
    }
  }

  // Create sample budget data (fallback)
  createSampleBudgetData() {
    return [
      {
        cost_center: 'CC001',
        svp_name: 'Maria Rodriguez',
        department: 'Technology',
        allocated_budget: 5000000,
        spent_amount: 3500000,
        remaining_budget: 1500000,
        project_count: 8,
        last_updated: new Date()
      },
      {
        cost_center: 'CC002',
        svp_name: 'James Chen',
        department: 'Operations',
        allocated_budget: 3000000,
        spent_amount: 2100000,
        remaining_budget: 900000,
        project_count: 5,
        last_updated: new Date()
      },
      {
        cost_center: 'CC003',
        svp_name: 'Sarah Johnson',
        department: 'Risk Management',
        allocated_budget: 2500000,
        spent_amount: 1800000,
        remaining_budget: 700000,
        project_count: 4,
        last_updated: new Date()
      }
    ];
  }

  // Create sample project data (fallback)
  createSampleProjectData() {
    return [
      {
        project_id: 'PROJ001',
        project_name: 'BCRA Compliance Update',
        status: 'IN_PROGRESS',
        progress_percent: 75,
        budget_allocated: 200000,
        budget_spent: 150000,
        svp_owner: 'Maria Rodriguez',
        risk_level: 'MEDIUM',
        compliance_status: 'COMPLIANT'
      },
      {
        project_id: 'PROJ002',
        project_name: 'KYC Enhancement',
        status: 'AT_RISK',
        progress_percent: 45,
        budget_allocated: 180000,
        budget_spent: 120000,
        svp_owner: 'Carlos Santos',
        risk_level: 'HIGH',
        compliance_status: 'REVIEW_REQUIRED'
      },
      {
        project_id: 'PROJ003',
        project_name: 'AML System Upgrade',
        status: 'ACTIVE',
        progress_percent: 90,
        budget_allocated: 150000,
        budget_spent: 135000,
        svp_owner: 'Ana Gutierrez',
        risk_level: 'LOW',
        compliance_status: 'COMPLIANT'
      }
    ];
  }

  // Create sample compliance data (fallback)
  createSampleComplianceData() {
    return [
      {
        regulation_id: 'REG001',
        regulation_name: 'BCRA Capital Requirements',
        compliance_status: 'COMPLIANT',
        last_audit_date: new Date('2024-01-15'),
        next_audit_date: new Date('2024-07-15'),
        risk_score: 85,
        responsible_department: 'Risk Management',
        findings_count: 0,
        remediation_status: 'N/A'
      },
      {
        regulation_id: 'REG002',
        regulation_name: 'AML/CFT Regulations',
        compliance_status: 'REVIEW_REQUIRED',
        last_audit_date: new Date('2024-02-01'),
        next_audit_date: new Date('2024-08-01'),
        risk_score: 92,
        responsible_department: 'Compliance',
        findings_count: 2,
        remediation_status: 'IN_PROGRESS'
      }
    ];
  }

  // Close all connections
  async closeConnections() {
    console.log('🔌 Closing enterprise database connections...');
    
    for (const [id, pool] of this.connectionPools) {
      try {
        if (id.includes('oracle')) {
          await pool.close();
        } else {
          await pool.end();
        }
        console.log(`✅ Closed connection: ${id}`);
      } catch (error) {
        console.error(`❌ Error closing connection ${id}:`, error.message);
      }
    }
    
    this.connectionPools.clear();
  }

  // Health check for all connections
  async healthCheck() {
    const health = {
      sap: false,
      oracle: false,
      timestamp: new Date()
    };

    // Check SAP connection
    try {
      const sapPool = this.connectionPools.get('sap-production');
      if (sapPool) {
        const client = await sapPool.connect();
        await client.query('SELECT 1');
        client.release();
        health.sap = true;
      }
    } catch (error) {
      console.warn('SAP health check failed:', error.message);
    }

    // Check Oracle connection
    try {
      const oraclePool = this.connectionPools.get('compliance-oracle');
      if (oraclePool) {
        const connection = await oraclePool.getConnection();
        await connection.execute('SELECT 1 FROM DUAL');
        await connection.close();
        health.oracle = true;
      }
    } catch (error) {
      console.warn('Oracle health check failed:', error.message);
    }

    return health;
  }
}

module.exports = EnterpriseDatabaseConnector;
