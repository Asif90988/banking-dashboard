// backend/routes/risk.js
const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const pool = req.app.get('pool');
    
    const query = `
      SELECT 
        title as risk_area,
        description
      FROM risk_issues
      ORDER BY created_at DESC
    `;
    
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error("Error in /api/risk:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
