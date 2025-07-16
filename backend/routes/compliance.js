const express = require('express');
const DataService = require('../services/DataService');
const router = express.Router();

// Initialize data service
const dataService = new DataService();

// Get all compliance data
router.get('/', async (req, res) => {
  try {
    const pool = req.app.get('pool');
    const compliance = await dataService.getCompliance(pool);
    res.json(compliance);
  } catch (error) {
    console.error('Error fetching compliance data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
