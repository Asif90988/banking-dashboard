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

// Advanced analytics endpoint
router.get("/analytics", async (req, res) => {
  try {
    const pool = req.app.get('pool');
    
    // Overall compliance stats
    const overallStats = await pool.query(`
      SELECT 
        status,
        COUNT(*) as count,
        ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
      FROM compliance_metrics 
      WHERE created_at = (SELECT MAX(created_at) FROM compliance_metrics)
      GROUP BY status
      ORDER BY count DESC
    `);

    // Compliance by metric type
    const byMetricType = await pool.query(`
      SELECT 
        metric_type,
        status,
        COUNT(*) as count,
        last_audit_date,
        next_audit_date,
        findings
      FROM compliance_metrics 
      WHERE created_at = (SELECT MAX(created_at) FROM compliance_metrics)
      GROUP BY metric_type, status, last_audit_date, next_audit_date, findings
      ORDER BY metric_type
    `);

    // Audit timeline (upcoming audits)
    const upcomingAudits = await pool.query(`
      SELECT 
        metric_type,
        status,
        next_audit_date,
        last_audit_date,
        findings,
        CASE 
          WHEN next_audit_date <= CURRENT_DATE + INTERVAL '7 days' THEN 'urgent'
          WHEN next_audit_date <= CURRENT_DATE + INTERVAL '30 days' THEN 'due_soon'
          ELSE 'scheduled'
        END as urgency
      FROM compliance_metrics 
      WHERE created_at = (SELECT MAX(created_at) FROM compliance_metrics)
      ORDER BY next_audit_date ASC
    `);

    // Historical trend (last 6 months)
    const trendData = await pool.query(`
      SELECT 
        DATE_TRUNC('month', created_at) as month,
        status,
        COUNT(*) as count
      FROM compliance_metrics 
      WHERE created_at >= CURRENT_DATE - INTERVAL '6 months'
      GROUP BY DATE_TRUNC('month', created_at), status
      ORDER BY month DESC, status
    `);

    // Risk score calculation
    const riskScore = await pool.query(`
      SELECT 
        CASE 
          WHEN status = 'Compliant' THEN 0
          WHEN status = 'Under Review' THEN 1
          WHEN status = 'Non-Compliant' THEN 3
          ELSE 2
        END as risk_weight,
        metric_type,
        status,
        findings
      FROM compliance_metrics 
      WHERE created_at = (SELECT MAX(created_at) FROM compliance_metrics)
    `);

    res.json({
      overallStats: overallStats.rows,
      byMetricType: byMetricType.rows,
      upcomingAudits: upcomingAudits.rows,
      trendData: trendData.rows,
      riskScore: riskScore.rows,
      summary: {
        totalMetrics: byMetricType.rows.length,
        complianceRate: overallStats.rows.find(r => r.status === 'Compliant')?.percentage || 0,
        criticalIssues: overallStats.rows.find(r => r.status === 'Non-Compliant')?.count || 0,
        underReview: overallStats.rows.find(r => r.status === 'Under Review')?.count || 0
      }
    });
  } catch (err) {
    console.error("Error in /api/compliance/analytics:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
