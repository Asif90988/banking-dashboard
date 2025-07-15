const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const pool = req.app.get('pool');
    const { svpId, status, limit = 50 } = req.query;

    let query = `
      SELECT 
        p.id,
        p.name,
        p.description,
        p.status,
        p.completion_percentage,
        p.next_milestone,
        p.compliance_status,
        p.budget_allocated,
        p.budget_spent,
        p.start_date,
        p.end_date,
        p.created_at,
        s.name as svp_name,
        s.department as svp_department,
        v.name as vp_name
      FROM projects p
      LEFT JOIN svps s ON p.svp_id = s.id
      LEFT JOIN vps v ON p.vp_id = v.id
      WHERE 1=1
    `;

    const params = [];

    if (svpId) {
      query += ` AND p.svp_id = $${params.length + 1}`;
      params.push(svpId);
    }

    if (status) {
      query += ` AND p.status = $${params.length + 1}`;
      params.push(status);
    }

    query += ` ORDER BY p.created_at DESC LIMIT $${params.length + 1}`;
    params.push(limit);

    const result = await pool.query(query, params);
    res.json(result.rows);

  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

