const express = require('express');
const router = express.Router();
const axios = require('axios');

const LM_STUDIO_URL = process.env.LM_STUDIO_URL || 'http://192.168.4.25:1235';

// Check if message contains data integration intent
async function checkForDataIntegrationIntent(message) {
  const lowerMessage = message.toLowerCase();
  
  const dataIntegrationKeywords = [
    'update budget', 'refresh budget', 'sync budget',
    'update project', 'refresh project', 'sync project',
    'update data', 'refresh data', 'sync data',
    'update excel', 'refresh excel', 'sync excel',
    'update spreadsheet', 'refresh spreadsheet', 'sync spreadsheet',
    'update compliance', 'refresh compliance', 'sync compliance',
    'load data', 'import data', 'pull data',
    'latest data', 'new data', 'fresh data'
  ];
  
  return dataIntegrationKeywords.some(keyword => lowerMessage.includes(keyword));
}

const getDashboardContext = async (pool) => {
  try {
    // Get SVP data
    const svpQuery = `
      SELECT 
        name, 
        department, 
        budget_allocated, 
        budget_spent, 
        ROUND(budget_spent::decimal / budget_allocated::decimal * 100, 2) as utilization
      FROM svps 
      ORDER BY name
    `;
    
    // Get project data with SVP assignments
    const projectQuery = `
      SELECT 
        p.name as project_name,
        p.status,
        p.completion_percentage,
        p.end_date,
        p.next_milestone,
        p.compliance_status,
        s.name as svp_name,
        s.department
      FROM projects p
      LEFT JOIN svps s ON p.svp_id = s.id
      ORDER BY p.name
    `;
    
    // Get activities data
    const activityQuery = `
      SELECT 
        a.description,
        a.priority,
        a.status,
        a.created_at,
        s.name as svp_name,
        p.name as project_name
      FROM activities a
      LEFT JOIN svps s ON a.svp_id = s.id
      LEFT JOIN projects p ON a.project_id = p.id
      ORDER BY a.created_at DESC
      LIMIT 10
    `;
    
    // Get compliance data
    const complianceQuery = `
      SELECT metric_type, status, last_audit_date 
      FROM compliance_metrics 
      ORDER BY metric_type
    `;
    
    // Get risk data
    const riskQuery = `
      SELECT title, description, risk_level 
      FROM risk_issues 
      ORDER BY title
    `;

    const [svpResult, projectResult, activityResult, complianceResult, riskResult] = await Promise.all([
      pool.query(svpQuery),
      pool.query(projectQuery),
      pool.query(activityQuery),
      pool.query(complianceQuery),
      pool.query(riskQuery)
    ]);

    // Calculate summary statistics
    const svps = svpResult.rows;
    const projects = projectResult.rows;
    const activities = activityResult.rows;
    const compliance = complianceResult.rows;
    const risks = riskResult.rows;

    const totalBudget = svps.reduce((sum, svp) => sum + parseFloat(svp.budget_allocated), 0);
    const totalSpent = svps.reduce((sum, svp) => sum + parseFloat(svp.budget_spent), 0);
    const avgUtilization = svps.reduce((sum, svp) => sum + parseFloat(svp.utilization), 0) / svps.length;

    return {
      svps: svps,
      projects: projects,
      activities: activities,
      compliance: compliance,
      risks: risks,
      summary: {
        total_svps: svps.length,
        total_budget: totalBudget,
        total_spent: totalSpent,
        avg_utilization: Math.round(avgUtilization),
        total_projects: projects.length,
        on_track_projects: projects.filter(p => p.status === 'On Track').length,
        at_risk_projects: projects.filter(p => p.status === 'At Risk').length,
        compliant_items: compliance.filter(c => c.status === 'Compliant').length,
        total_compliance_items: compliance.length
      }
    };

  } catch (error) {
    console.error('Error getting dashboard context:', error);
    return {};
  }
};

router.post('/chat', async (req, res) => {
  try {
    const { message, conversationId } = req.body;
    const pool = req.app.get('pool');

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Check if this is a data integration request
    const isDataIntegrationRequest = await checkForDataIntegrationIntent(message);
    
    if (isDataIntegrationRequest) {
      // Handle data integration request
      try {
        const response = await fetch('http://localhost:5050/api/ai/process-request', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message })
        });

        const result = await response.json();
        
        return res.json({
          response: result.success 
            ? `✅ ${result.message}\n\n📊 Processed ${result.affectedRecords} records in ${result.processingTime}ms\n\nThe dashboard data has been updated and will refresh automatically.`
            : `❌ ${result.message}\n\nPlease check your data sources and try again.`,
          conversationId: conversationId || Date.now().toString(),
          timestamp: new Date().toISOString(),
          isDataIntegration: true,
          integrationResult: result
        });
      } catch (integrationError) {
        console.error('Data integration error:', integrationError);
        return res.json({
          response: "I encountered an issue while processing your data integration request. Please ensure your data sources are accessible and try again.",
          conversationId: conversationId || Date.now().toString(),
          timestamp: new Date().toISOString(),
          error: true
        });
      }
    }

    const dashboardContext = await getDashboardContext(pool);

    const systemPrompt = `You are ARIA, the AI Regulatory Intelligence Assistant for the Citi Bank LATAM RegInsight Department dashboard. 
You help Alex Rodriguez (the Director) and other users understand dashboard data, answer questions about budgets, projects, compliance, and risks.

IMPORTANT: You can also help with data integration tasks. If users ask to:
- "Update budget data" or "refresh budget from Excel"
- "Update project data" or "sync project information"
- "Refresh compliance data"
- "Update data from spreadsheet"
- "Sync latest data"

You should recognize these as data integration requests and handle them accordingly.

Current Dashboard Data:
SUMMARY:
- SVPs: ${dashboardContext.summary?.total_svps || 0} total
- Budget: $${dashboardContext.summary?.total_budget || 0} allocated, $${dashboardContext.summary?.total_spent || 0} spent (${dashboardContext.summary?.avg_utilization || 0}% utilization)
- Projects: ${dashboardContext.summary?.total_projects || 0} total (${dashboardContext.summary?.on_track_projects || 0} on track, ${dashboardContext.summary?.at_risk_projects || 0} at risk)
- Compliance: ${dashboardContext.summary?.compliant_items || 0}/${dashboardContext.summary?.total_compliance_items || 0} compliant

SVPs AND THEIR DETAILS:
${dashboardContext.svps?.map(svp => `- ${svp.name} (${svp.department}): $${svp.budget_allocated} allocated, $${svp.budget_spent} spent (${svp.utilization}% utilization)`).join('\n') || 'No SVP data available'}

PROJECTS:
${dashboardContext.projects?.map(p => `- ${p.project_name} (${p.status}) - ${p.completion_percentage}% complete, assigned to ${p.svp_name} (${p.department})`).join('\n') || 'No project data available'}

RECENT ACTIVITIES:
${dashboardContext.activities?.slice(0, 5).map(a => `- ${a.description} (${a.priority} priority) - ${a.svp_name}`).join('\n') || 'No activity data available'}

COMPLIANCE STATUS:
${dashboardContext.compliance?.map(c => `- ${c.metric_type}: ${c.status}`).join('\n') || 'No compliance data available'}

RISKS:
${dashboardContext.risks?.map(r => `- ${r.title}: ${r.description} (${r.risk_level})`).join('\n') || 'No risk data available'}

Please provide helpful, accurate answers based on this comprehensive data. When users ask about SVPs, projects, budgets, or any dashboard data, use the specific information provided above. Be conversational, professional, and provide actionable insights.`;

    try {
      const response = await axios.post(`${LM_STUDIO_URL}/v1/chat/completions`, {
        model: "meta-llama-3.1-8b-instruct",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        temperature: 0.7,
        max_tokens: 500,
        stream: false
      });

      const aiResponse = response.data.choices[0].message.content;

      res.json({
        response: aiResponse,
        conversationId: conversationId || Date.now().toString(),
        timestamp: new Date().toISOString()
      });

    } catch (aiError) {
      console.error('LM Studio error:', aiError.message);
      res.json({
        response: "I'm having trouble connecting to my AI service right now. However, I can see your dashboard shows good overall performance with most projects on track. Please try again later or contact support if issues persist.",
        conversationId: conversationId || Date.now().toString(),
        timestamp: new Date().toISOString(),
        error: true
      });
    }

  } catch (error) {
    console.error('Error in chatbot:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
