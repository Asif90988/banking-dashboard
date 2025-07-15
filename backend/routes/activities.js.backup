const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const pool = req.app.get('pool');
    const { svpId, priority, limit = 20 } = req.query;

    let query = `
      SELECT 
        a.id,
        a.type,
        a.description,
        a.priority,
        a.status,
        a.created_at,
        s.name as svp_name,
        s.department as svp_department,
        p.name as project_name
      FROM activities a
      LEFT JOIN svps s ON a.svp_id = s.id
      LEFT JOIN projects p ON a.project_id = p.id
      WHERE 1=1
    `;

    const params = [];

    if (svpId) {
      query += ` AND a.svp_id = $${params.length + 1}`;
      params.push(svpId);
    }

    if (priority) {
      query += ` AND a.priority = $${params.length + 1}`;
      params.push(priority);
    }

    query += ` ORDER BY a.created_at DESC LIMIT $${params.length + 1}`;
    params.push(limit);

    const result = await pool.query(query, params);
    res.json(result.rows);

  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

