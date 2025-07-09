// backend/routes/compliance.js
const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const pool = req.app.get('pool');
    
    const query = `
      SELECT 
        metric_type as metric,
        status as value
      FROM compliance_metrics
      ORDER BY created_at DESC
    `;
    
    const result = await pool.query(query);
    res.json({ data: result.rows });
  } catch (err) {
    console.error("Error in /api/compliance:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
