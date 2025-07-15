const express = require('express');
const DataService = require('../services/DataService');
const router = express.Router();

// Initialize data service
const dataService = new DataService();

// Budget overview endpoint
router.get('/overview', async (req, res) => {
  try {
    const pool = req.app.get('pool');
    const budgetOverview = await dataService.getBudgetOverview(pool);
    res.json(budgetOverview);
  } catch (error) {
    console.error('Error fetching budget overview:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Budget by SVP endpoint
router.get('/by-svp', async (req, res) => {
  try {
    const pool = req.app.get('pool');
    const svpData = await dataService.getBudgetBySVP(pool);
    res.json(svpData);
  } catch (error) {
    console.error('Error fetching SVP budget data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
