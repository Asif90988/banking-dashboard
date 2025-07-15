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

// Advanced analytics endpoint
router.get('/analytics', async (req, res) => {
  try {
    const pool = req.app.get('pool');
    
    // Risk distribution by level
    const riskDistribution = await pool.query(`
      SELECT 
        risk_level,
        COUNT(*) as count,
        ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
      FROM risk_issues 
      GROUP BY risk_level
      ORDER BY 
        CASE risk_level 
          WHEN 'Critical' THEN 1
          WHEN 'High' THEN 2  
          WHEN 'Medium' THEN 3
          WHEN 'Low' THEN 4
          ELSE 5
        END
    `);

    // Impact vs Probability matrix
    const riskMatrix = await pool.query(`
      SELECT 
        impact_level,
        probability,
        COUNT(*) as count,
        risk_level,
        ARRAY_AGG(title) as risk_titles
      FROM risk_issues 
      GROUP BY impact_level, probability, risk_level
      ORDER BY 
        CASE impact_level 
          WHEN 'Critical' THEN 1
          WHEN 'High' THEN 2
          WHEN 'Medium' THEN 3
          WHEN 'Low' THEN 4
          ELSE 5
        END,
        CASE probability
          WHEN 'Very High' THEN 1
          WHEN 'High' THEN 2
          WHEN 'Medium' THEN 3
          WHEN 'Low' THEN 4
          WHEN 'Very Low' THEN 5
          ELSE 6
        END
    `);

    // Risk trends over time
    const riskTrends = await pool.query(`
      SELECT 
        DATE_TRUNC('month', created_at) as month,
        risk_level,
        COUNT(*) as count
      FROM risk_issues 
      WHERE created_at >= CURRENT_DATE - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', created_at), risk_level
      ORDER BY month DESC, risk_level
    `);

    // Risks by SVP/Department
    const risksBySVP = await pool.query(`
      SELECT 
        s.name as svp_name,
        s.department,
        r.risk_level,
        COUNT(*) as count,
        ROUND(AVG(
          CASE r.risk_level 
            WHEN 'Critical' THEN 5
            WHEN 'High' THEN 4
            WHEN 'Medium' THEN 3
            WHEN 'Low' THEN 2
            WHEN 'Very Low' THEN 1
            ELSE 0
          END
        ), 2) as avg_risk_score
      FROM risk_issues r
      LEFT JOIN svps s ON r.svp_id = s.id
      GROUP BY s.name, s.department, r.risk_level
      ORDER BY avg_risk_score DESC, count DESC
    `);

    // Risk by status
    const riskStatus = await pool.query(`
      SELECT 
        status,
        risk_level,
        COUNT(*) as count,
        ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
      FROM risk_issues 
      GROUP BY status, risk_level
      ORDER BY count DESC
    `);

    // Top risk owners
    const topRiskOwners = await pool.query(`
      SELECT 
        owner,
        COUNT(*) as total_risks,
        COUNT(CASE WHEN risk_level IN ('Critical', 'High') THEN 1 END) as critical_high_risks,
        COUNT(CASE WHEN status = 'Open' THEN 1 END) as open_risks,
        ROUND(AVG(
          CASE risk_level 
            WHEN 'Critical' THEN 5
            WHEN 'High' THEN 4
            WHEN 'Medium' THEN 3
            WHEN 'Low' THEN 2
            WHEN 'Very Low' THEN 1
            ELSE 0
          END
        ), 2) as avg_risk_score
      FROM risk_issues 
      WHERE owner IS NOT NULL
      GROUP BY owner
      ORDER BY critical_high_risks DESC, total_risks DESC
      LIMIT 10
    `);

    // Risk heat map data
    const heatMapData = await pool.query(`
      SELECT 
        impact_level,
        probability,
        COUNT(*) as risk_count,
        ARRAY_AGG(DISTINCT risk_level) as risk_levels,
        ARRAY_AGG(title) as titles
      FROM risk_issues 
      GROUP BY impact_level, probability
    `);

    // Risk summary statistics
    const summary = await pool.query(`
      SELECT 
        COUNT(*) as total_risks,
        COUNT(CASE WHEN risk_level IN ('Critical', 'High') THEN 1 END) as high_critical_risks,
        COUNT(CASE WHEN status = 'Open' THEN 1 END) as open_risks,
        COUNT(CASE WHEN status = 'Closed' THEN 1 END) as closed_risks,
        COUNT(CASE WHEN status = 'In Progress' THEN 1 END) as in_progress_risks,
        ROUND(AVG(
          CASE risk_level 
            WHEN 'Critical' THEN 5
            WHEN 'High' THEN 4
            WHEN 'Medium' THEN 3
            WHEN 'Low' THEN 2
            WHEN 'Very Low' THEN 1
            ELSE 0
          END
        ), 2) as avg_risk_score,
        ROUND(
          COUNT(CASE WHEN risk_level IN ('Critical', 'High') THEN 1 END) * 100.0 / COUNT(*), 2
        ) as high_risk_percentage
      FROM risk_issues
    `);

    res.json({
      riskDistribution: riskDistribution.rows,
      riskMatrix: riskMatrix.rows,
      riskTrends: riskTrends.rows,
      risksBySVP: risksBySVP.rows,
      riskStatus: riskStatus.rows,
      topRiskOwners: topRiskOwners.rows,
      heatMapData: heatMapData.rows,
      summary: summary.rows[0] || {
        total_risks: 0,
        high_critical_risks: 0,
        open_risks: 0,
        closed_risks: 0,
        in_progress_risks: 0,
        avg_risk_score: 0,
        high_risk_percentage: 0
      }
    });
  } catch (err) {
    console.error("Error in /api/risk/analytics:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
