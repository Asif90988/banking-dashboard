const CachedDataGenerator = require('./CachedDataGenerator');

class DataService {
  constructor() {
    this.useDatabase = process.env.USE_DATABASE === 'true';
    this.environment = process.env.ENVIRONMENT || 'development';
    this.cachedDataGenerator = new CachedDataGenerator();
    
    console.log(`🔧 DataService initialized for ${this.environment}`);
    console.log(`📊 Data source: ${this.useDatabase ? 'DATABASE' : 'CACHED_GENERATOR'}`);
  }

  async getBudgetOverview(pool = null) {
    if (this.useDatabase && pool) {
      return this.getBudgetOverviewFromDB(pool);
    } else {
      return this.getBudgetOverviewFromCache();
    }
  }

  async getBudgetBySVP(pool = null) {
    if (this.useDatabase && pool) {
      return this.getBudgetBySVPFromDB(pool);
    } else {
      return this.getBudgetBySVPFromCache();
    }
  }

  async getProjects(pool = null) {
    if (this.useDatabase && pool) {
      return this.getProjectsFromDB(pool);
    } else {
      return this.getProjectsFromCache();
    }
  }

  async getActivities(pool = null) {
    if (this.useDatabase && pool) {
      return this.getActivitiesFromDB(pool);
    } else {
      return this.getActivitiesFromCache();
    }
  }

  async getCompliance(pool = null) {
    if (this.useDatabase && pool) {
      return this.getComplianceFromDB(pool);
    } else {
      return this.getComplianceFromCache();
    }
  }

  async getRisk(pool = null) {
    if (this.useDatabase && pool) {
      return this.getRiskFromDB(pool);
    } else {
      return this.getRiskFromCache();
    }
  }

  // DATABASE METHODS (for production)
  async getBudgetOverviewFromDB(pool) {
    const query = `
      SELECT 
        SUM(budget_allocated) as total_allocated,
        SUM(budget_spent) as total_spent,
        SUM(budget_allocated - budget_spent) as remaining,
        ROUND(AVG(budget_spent::decimal / budget_allocated::decimal * 100), 2) as avg_utilization
      FROM svps
    `;
    const result = await pool.query(query);
    return result.rows[0];
  }

  async getBudgetBySVPFromDB(pool) {
    const query = `SELECT * FROM svps ORDER BY svp_name`;
    const result = await pool.query(query);
    return result.rows;
  }

  async getProjectsFromDB(pool) {
    const query = `SELECT * FROM projects ORDER BY created_at DESC`;
    const result = await pool.query(query);
    return result.rows;
  }

  async getActivitiesFromDB(pool) {
    const query = `SELECT * FROM activities ORDER BY created_at DESC LIMIT 50`;
    const result = await pool.query(query);
    return result.rows;
  }

  async getComplianceFromDB(pool) {
    const query = `SELECT * FROM compliance ORDER BY assessment_date DESC`;
    const result = await pool.query(query);
    return { data: result.rows };
  }

  async getRiskFromDB(pool) {
    const query = `SELECT * FROM risk_issues WHERE status IN ('Open', 'In Progress')`;
    const result = await pool.query(query);
    return result.rows;
  }

  // CACHED METHODS (for development/VPS)
  getBudgetOverviewFromCache() {
    const budgetData = this.cachedDataGenerator.getBudgetData();
    
    const totalAllocated = budgetData.reduce((sum, item) => sum + (item['Allocated Budget'] || 0), 0);
    const totalSpent = budgetData.reduce((sum, item) => sum + (item['Spent Amount'] || 0), 0);
    const remaining = totalAllocated - totalSpent;
    const avgUtilization = budgetData.length > 0 ? 
      budgetData.reduce((sum, item) => sum + (item['Utilization Rate'] || 0), 0) / budgetData.length : 0;
    
    return {
      total_allocated: totalAllocated,
      total_spent: totalSpent,
      remaining: remaining,
      avg_utilization: Math.round(avgUtilization * 100) / 100
    };
  }

  getBudgetBySVPFromCache() {
    const budgetData = this.cachedDataGenerator.getBudgetData();
    
    const svpGroups = {};
    budgetData.forEach(item => {
      const svpName = item['SVP Name'];
      if (!svpGroups[svpName]) {
        svpGroups[svpName] = {
          svp_name: svpName,
          department: item.Department,
          total_allocated: 0,
          total_spent: 0,
          region: item.Region,
          currency: item.Currency
        };
      }
      svpGroups[svpName].total_allocated += item['Allocated Budget'] || 0;
      svpGroups[svpName].total_spent += item['Spent Amount'] || 0;
    });
    
    return Object.values(svpGroups).map(svp => ({
      ...svp,
      utilization_rate: svp.total_allocated > 0 ? 
        Math.round((svp.total_spent / svp.total_allocated) * 10000) / 100 : 0
    }));
  }

  getProjectsFromCache() {
    return this.cachedDataGenerator.getProjectData();
  }

  getActivitiesFromCache() {
    // Generate mock activities from project and budget data
    const projects = this.cachedDataGenerator.getProjectData();
    const budget = this.cachedDataGenerator.getBudgetData();
    
    const activities = [];
    
    // Add project activities
    projects.slice(0, 20).forEach((project, index) => {
      activities.push({
        id: `PROJ_ACT_${index}`,
        type: 'project_update',
        title: `${project['Project Name']} - Progress Update`,
        description: `Project progress updated to ${project['Progress %']}%`,
        user: project['SVP Name'],
        department: project.Department,
        timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
        priority: project['Risk Level']
      });
    });
    
    // Add budget activities
    budget.slice(0, 15).forEach((item, index) => {
      activities.push({
        id: `BUDGET_ACT_${index}`,
        type: 'budget_update',
        title: `Budget allocation updated for ${item.Department}`,
        description: `Budget utilization: ${item['Utilization Rate']}%`,
        user: item['SVP Name'],
        department: item.Department,
        timestamp: new Date(Date.now() - Math.random() * 12 * 60 * 60 * 1000),
        priority: item['Utilization Rate'] > 90 ? 'High' : 'Medium'
      });
    });
    
    return activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  getComplianceFromCache() {
    return { data: this.cachedDataGenerator.getComplianceData() };
  }

  getRiskFromCache() {
    const projectData = this.cachedDataGenerator.getProjectData();
    return projectData
      .filter(p => p['Risk Level'] === 'High' || p['Risk Level'] === 'Critical')
      .map(p => ({
        id: p['Project ID'],
        title: p['Project Name'],
        department: p.Department,
        risk_level: p['Risk Level'],
        status: p.Status,
        svp_name: p['SVP Name'],
        budget: p.Budget,
        progress: p['Progress %'],
        description: `${p['Risk Level']} risk project in ${p.Department}`
      }));
  }
}

module.exports = DataService;
