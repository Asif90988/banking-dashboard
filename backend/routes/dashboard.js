const express = require('express');
const CachedDataGenerator = require('../services/CachedDataGenerator');
const router = express.Router();

// Initialize cached data generator
const cachedData = new CachedDataGenerator();

// Dashboard summary endpoint
router.get('/', async (req, res) => {
  try {
    const data = cachedData.getData();
    const budget = data.budget || [];
    const projects = data.projects || [];
    const compliance = data.compliance || [];
    
    // Calculate summary metrics
    const totalBudget = budget.reduce((sum, item) => sum + (item['Allocated Budget'] || 0), 0);
    const totalSpent = budget.reduce((sum, item) => sum + (item['Spent Amount'] || 0), 0);
    const budgetUtilization = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
    
    const activeProjects = projects.filter(p => p.Status === 'Active' || p.Status === 'In Progress').length;
    const completedProjects = projects.filter(p => p.Status === 'Completed').length;
    const totalProjects = projects.length;
    
    const complianceRate = compliance.length > 0 ? 
      (compliance.filter(c => c.Status === 'Compliant').length / compliance.length) * 100 : 0;
    
    const highRisks = projects.filter(p => p['Risk Level'] === 'High' || p['Risk Level'] === 'Critical').length;
    const totalRisks = projects.length;
    
    const summary = {
      totalBudget,
      totalSpent,
      budgetUtilization: Math.round(budgetUtilization * 100) / 100,
      activeProjects,
      completedProjects,
      totalProjects,
      avgProjectProgress: projects.length > 0 ? 
        Math.round((projects.reduce((sum, p) => sum + (p['Progress %'] || 0), 0) / projects.length) * 100) / 100 : 0,
      criticalRisks: projects.filter(p => p['Risk Level'] === 'Critical').length,
      highRisks,
      totalRisks,
      complianceRate: Math.round(complianceRate * 100) / 100,
      workforceCount: budget.length * 6, // Estimate workforce
      cacheStatus: cachedData.getCacheStatus(),
      simulation: true,
      environment: 'VPS'
    };
    
    res.json(summary);
  } catch (error) {
    console.error('Error generating dashboard summary:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Budget endpoint
router.get('/budget', async (req, res) => {
  try {
    const budgetData = cachedData.getBudgetData();
    res.json(budgetData);
  } catch (error) {
    console.error('Error fetching budget:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// SVP performance endpoint
router.get('/svp-performance', async (req, res) => {
  try {
    const budgetData = cachedData.getBudgetData();
    const projectData = cachedData.getProjectData();
    
    // Group by SVP and calculate performance
    const svpPerformance = {};
    
    budgetData.forEach(item => {
      const svpName = item['SVP Name'];
      if (!svpPerformance[svpName]) {
        svpPerformance[svpName] = {
          name: svpName,
          department: item.Department,
          totalBudget: 0,
          totalSpent: 0,
          projects: [],
          region: item.Region,
          currency: item.Currency
        };
      }
      svpPerformance[svpName].totalBudget += item['Allocated Budget'] || 0;
      svpPerformance[svpName].totalSpent += item['Spent Amount'] || 0;
    });
    
    projectData.forEach(project => {
      const svpName = project['SVP Name'];
      if (svpPerformance[svpName]) {
        svpPerformance[svpName].projects.push(project);
      }
    });
    
    // Convert to array and add calculated metrics
    const svpArray = Object.values(svpPerformance).map(svp => ({
      ...svp,
      budgetUtilization: svp.totalBudget > 0 ? (svp.totalSpent / svp.totalBudget) * 100 : 0,
      projectCount: svp.projects.length,
      avgProgress: svp.projects.length > 0 ? 
        svp.projects.reduce((sum, p) => sum + (p['Progress %'] || 0), 0) / svp.projects.length : 0,
      performance: Math.random() * 15 + 85 // Random performance between 85-100%
    }));
    
    res.json(svpArray);
  } catch (error) {
    console.error('Error fetching SVP performance:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Risk endpoint
router.get('/risk', async (req, res) => {
  try {
    const projectData = cachedData.getProjectData();
    const riskItems = projectData
      .filter(p => p['Risk Level'] === 'High' || p['Risk Level'] === 'Critical')
      .map(p => ({
        id: p['Project ID'],
        title: p['Project Name'],
        department: p.Department,
        riskLevel: p['Risk Level'],
        status: p.Status,
        svpName: p['SVP Name'],
        budget: p.Budget,
        progress: p['Progress %']
      }));
    
    res.json(riskItems);
  } catch (error) {
    console.error('Error fetching risk data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Cache status endpoint
router.get('/cache-status', async (req, res) => {
  try {
    const status = cachedData.getCacheStatus();
    res.json(status);
  } catch (error) {
    console.error('Error fetching cache status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Force refresh endpoint (for manual refresh)
router.post('/refresh', async (req, res) => {
  try {
    const freshData = cachedData.forceRefresh();
    res.json({ 
      message: 'Data refreshed successfully',
      status: cachedData.getCacheStatus(),
      recordCounts: {
        budget: freshData.budget?.length || 0,
        projects: freshData.projects?.length || 0,
        compliance: freshData.compliance?.length || 0
      }
    });
  } catch (error) {
    console.error('Error refreshing data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
