const express = require('express');
const router = express.Router();

router.get('/overview', async (req, res) => {
  try {
    const pool = req.app.get('pool');

    const query = `
      SELECT 
        SUM(budget_allocated) as total_allocated,
        SUM(budget_spent) as total_spent,
        SUM(budget_allocated - budget_spent) as remaining,
        ROUND(AVG(budget_spent::decimal / budget_allocated::decimal * 100), 2) as avg_utilization
      FROM svps
    `;

    const result = await pool.query(query);
    res.json(result.rows[0]);

  } catch (error) {
    console.error('Error fetching budget overview:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/by-svp', async (req, res) => {
  try {
    const pool = req.app.get('pool');

    const query = `
      SELECT 
        s.id,
        s.name,
        s.department,
        s.budget_allocated,
        s.budget_spent,
        s.budget_allocated - s.budget_spent as remaining,
        ROUND(s.budget_spent::decimal / s.budget_allocated::decimal * 100, 2) as utilization_percentage,
        CASE 
          WHEN s.budget_spent::decimal / s.budget_allocated::decimal > 0.9 THEN 'danger'
          WHEN s.budget_spent::decimal / s.budget_allocated::decimal > 0.8 THEN 'warning'
          ELSE 'normal'
        END as status
      FROM svps s
      ORDER BY s.budget_allocated DESC
    `;

    const result = await pool.query(query);
    res.json(result.rows);

  } catch (error) {
    console.error('Error fetching budget by SVP:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/sources', async (req, res) => {
  try {
    const pool = req.app.get('pool');

    const query = `
      SELECT 
        bs.*,
        COALESCE(ba.allocated_amount, 0) as allocated_amount,
        bs.total_amount - COALESCE(ba.allocated_amount, 0) as remaining_amount
      FROM budget_sources bs
      LEFT JOIN (
        SELECT 
          budget_source_id,
          SUM(allocated_amount) as allocated_amount
        FROM budget_allocations
        GROUP BY budget_source_id
      ) ba ON bs.id = ba.budget_source_id
      ORDER BY bs.created_at DESC
    `;

    const result = await pool.query(query);
    res.json(result.rows);

  } catch (error) {
    console.error('Error fetching budget sources:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

