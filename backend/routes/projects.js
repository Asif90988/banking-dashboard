const express = require('express');
const DataService = require('../services/DataService');
const router = express.Router();

// Initialize data service
const dataService = new DataService();

// Get all projects
router.get('/', async (req, res) => {
  try {
    const pool = req.app.get('pool');
    const projects = await dataService.getProjects(pool);
    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
