const express = require('express');
const DataService = require('../services/DataService');
const router = express.Router();

// Initialize data service
const dataService = new DataService();

// Get all risk data
router.get('/', async (req, res) => {
  try {
    const pool = req.app.get('pool');
    const risks = await dataService.getRisk(pool);
    res.json(risks);
  } catch (error) {
    console.error('Error fetching risk data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
