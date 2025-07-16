const express = require('express');
const DataService = require('../services/DataService');
const router = express.Router();

// Initialize data service
const dataService = new DataService();

// Get all activities
router.get('/', async (req, res) => {
  try {
    const pool = req.app.get('pool');
    const activities = await dataService.getActivities(pool);
    res.json(activities);
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
