const express = require('express');
const router = express.Router();

// Import AI services (will be initialized in server.js)
let predictiveAnalyticsEngine = null;
let anomalyDetectionSystem = null;

// Initialize AI services (called from server.js)
function initializeAIServices(predictiveEngine, anomalySystem) {
  predictiveAnalyticsEngine = predictiveEngine;
  anomalyDetectionSystem = anomalySystem;
}

// GET /api/ai-analytics/predictions
router.get('/predictions', async (req, res) => {
  try {
    if (!predictiveAnalyticsEngine || !predictiveAnalyticsEngine.isInitialized) {
      return res.status(503).json({
        success: false,
        message: 'Predictive Analytics Engine not initialized'
      });
    }

    const predictions = predictiveAnalyticsEngine.getAllPredictions();
    const modelStatus = predictiveAnalyticsEngine.getModelStatus();

    res.json({
      success: true,
      data: {
        predictions,
        modelStatus,
        timestamp: new Date()
      }
    });
  } catch (error) {
    console.error('Error fetching predictions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch predictions',
      error: error.message
    });
  }
});

// GET /api/ai-analytics/predictions/:modelId
router.get('/predictions/:modelId', async (req, res) => {
  try {
    const { modelId } = req.params;
    const inputData = req.query;

    if (!predictiveAnalyticsEngine || !predictiveAnalyticsEngine.isInitialized) {
      return res.status(503).json({
        success: false,
        message: 'Predictive Analytics Engine not initialized'
      });
    }

    const prediction = await predictiveAnalyticsEngine.getPrediction(modelId, inputData);

    res.json({
      success: true,
      data: {
        modelId,
        prediction,
        timestamp: new Date()
      }
    });
  } catch (error) {
    console.error(`Error getting prediction for model ${req.params.modelId}:`, error);
    res.status(500).json({
      success: false,
      message: `Failed to get prediction for model ${req.params.modelId}`,
      error: error.message
    });
  }
});

// POST /api/ai-analytics/retrain/:modelId
router.post('/retrain/:modelId', async (req, res) => {
  try {
    const { modelId } = req.params;
    const { trainingData } = req.body;

    if (!predictiveAnalyticsEngine || !predictiveAnalyticsEngine.isInitialized) {
      return res.status(503).json({
        success: false,
        message: 'Predictive Analytics Engine not initialized'
      });
    }

    const result = await predictiveAnalyticsEngine.retrainModel(modelId, trainingData);

    res.json({
      success: true,
      data: {
        modelId,
        result,
        timestamp: new Date()
      }
    });
  } catch (error) {
    console.error(`Error retraining model ${req.params.modelId}:`, error);
    res.status(500).json({
      success: false,
      message: `Failed to retrain model ${req.params.modelId}`,
      error: error.message
    });
  }
});

// GET /api/ai-analytics/anomalies
router.get('/anomalies', async (req, res) => {
  try {
    const { limit = 50, severity } = req.query;

    if (!anomalyDetectionSystem || !anomalyDetectionSystem.isInitialized) {
      return res.status(503).json({
        success: false,
        message: 'Anomaly Detection System not initialized'
      });
    }

    const anomalies = anomalyDetectionSystem.getAnomalies(parseInt(limit), severity);
    const statistics = anomalyDetectionSystem.getAnomalyStatistics();
    const detectorStatus = anomalyDetectionSystem.getDetectorStatus();

    res.json({
      success: true,
      data: {
        anomalies,
        statistics,
        detectorStatus,
        timestamp: new Date()
      }
    });
  } catch (error) {
    console.error('Error fetching anomalies:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch anomalies',
      error: error.message
    });
  }
});

// POST /api/ai-analytics/anomalies/:anomalyId/investigate
router.post('/anomalies/:anomalyId/investigate', async (req, res) => {
  try {
    const { anomalyId } = req.params;
    const { isFalsePositive = false } = req.body;

    if (!anomalyDetectionSystem || !anomalyDetectionSystem.isInitialized) {
      return res.status(503).json({
        success: false,
        message: 'Anomaly Detection System not initialized'
      });
    }

    anomalyDetectionSystem.markAnomalyInvestigated(anomalyId, isFalsePositive);

    res.json({
      success: true,
      data: {
        anomalyId,
        investigated: true,
        isFalsePositive,
        timestamp: new Date()
      }
    });
  } catch (error) {
    console.error(`Error investigating anomaly ${req.params.anomalyId}:`, error);
    res.status(500).json({
      success: false,
      message: `Failed to investigate anomaly ${req.params.anomalyId}`,
      error: error.message
    });
  }
});

// GET /api/ai-analytics/insights
router.get('/insights', async (req, res) => {
  try {
    // Generate AI insights based on current data
    const insights = await generateAIInsights();

    res.json({
      success: true,
      data: {
        insights,
        timestamp: new Date()
      }
    });
  } catch (error) {
    console.error('Error generating insights:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate insights',
      error: error.message
    });
  }
});

// POST /api/ai-analytics/chat
router.post('/chat', async (req, res) => {
  try {
    const { message, context } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    // Generate AI response based on current analytics data
    const response = await generateAIResponse(message, context);

    res.json({
      success: true,
      data: {
        response,
        timestamp: new Date()
      }
    });
  } catch (error) {
    console.error('Error processing chat message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process chat message',
      error: error.message
    });
  }
});

// GET /api/ai-analytics/health
router.get('/health', async (req, res) => {
  try {
    const health = {
      predictiveAnalytics: {
        initialized: predictiveAnalyticsEngine?.isInitialized || false,
        status: predictiveAnalyticsEngine?.isInitialized ? 'healthy' : 'not_initialized'
      },
      anomalyDetection: {
        initialized: anomalyDetectionSystem?.isInitialized || false,
        status: anomalyDetectionSystem?.isInitialized ? 'healthy' : 'not_initialized'
      },
      timestamp: new Date()
    };

    // Add detailed health checks if services are initialized
    if (predictiveAnalyticsEngine?.isInitialized) {
      health.predictiveAnalytics.modelStatus = predictiveAnalyticsEngine.getModelStatus();
    }

    if (anomalyDetectionSystem?.isInitialized) {
      health.anomalyDetection.detectorStatus = anomalyDetectionSystem.getDetectorStatus();
      health.anomalyDetection.statistics = anomalyDetectionSystem.getAnomalyStatistics();
    }

    res.json({
      success: true,
      data: health
    });
  } catch (error) {
    console.error('Error checking AI analytics health:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check health status',
      error: error.message
    });
  }
});

// Helper function to generate AI insights
async function generateAIInsights() {
  const insights = [];

  try {
    // Get predictions if available
    if (predictiveAnalyticsEngine?.isInitialized) {
      const predictions = predictiveAnalyticsEngine.getAllPredictions();
      
      // Budget insights
      if (predictions.budget_forecast) {
        const forecast = predictions.budget_forecast;
        insights.push({
          id: 'budget_forecast_insight',
          type: 'prediction',
          title: 'Budget Forecast Analysis',
          content: `Based on current trends, overall budget utilization is trending ${forecast.overallTrend > 0 ? 'upward' : 'downward'} by ${Math.abs(forecast.overallTrend * 100).toFixed(1)}%.`,
          confidence: forecast.accuracy,
          priority: 'high',
          timestamp: new Date()
        });
      }

      // Project insights
      if (predictions.project_predictions) {
        const projects = predictions.project_predictions;
        const avgHealth = projects.portfolioHealth;
        insights.push({
          id: 'project_health_insight',
          type: 'prediction',
          title: 'Portfolio Health Assessment',
          content: `Project portfolio health is at ${avgHealth.toFixed(1)}%. ${avgHealth > 80 ? 'Portfolio is performing well.' : avgHealth > 60 ? 'Some projects need attention.' : 'Critical portfolio issues detected.'}`,
          confidence: projects.accuracy,
          priority: avgHealth > 70 ? 'medium' : 'high',
          timestamp: new Date()
        });
      }
    }

    // Get anomaly insights if available
    if (anomalyDetectionSystem?.isInitialized) {
      const stats = anomalyDetectionSystem.getAnomalyStatistics();
      
      if (stats.bySeverity.critical > 0) {
        insights.push({
          id: 'critical_anomalies_insight',
          type: 'alert',
          title: 'Critical Anomalies Detected',
          content: `${stats.bySeverity.critical} critical anomalies detected. Immediate investigation recommended.`,
          confidence: 0.95,
          priority: 'critical',
          timestamp: new Date()
        });
      }

      if (stats.falsePositiveRate > 0.2) {
        insights.push({
          id: 'false_positive_insight',
          type: 'recommendation',
          title: 'Anomaly Detection Tuning',
          content: `False positive rate is ${(stats.falsePositiveRate * 100).toFixed(1)}%. Consider recalibrating detection thresholds.`,
          confidence: 0.8,
          priority: 'medium',
          timestamp: new Date()
        });
      }
    }

    // Add general insights
    insights.push({
      id: 'system_performance_insight',
      type: 'analysis',
      title: 'System Performance Overview',
      content: 'AI analytics systems are operating normally. Real-time monitoring and predictive models are active.',
      confidence: 0.9,
      priority: 'low',
      timestamp: new Date()
    });

  } catch (error) {
    console.error('Error generating insights:', error);
    insights.push({
      id: 'error_insight',
      type: 'alert',
      title: 'Insight Generation Error',
      content: 'Unable to generate some insights due to system issues. Please check system health.',
      confidence: 1.0,
      priority: 'medium',
      timestamp: new Date()
    });
  }

  return insights;
}

// Helper function to generate AI chat responses
async function generateAIResponse(message, context) {
  const lowerMessage = message.toLowerCase();
  
  // Budget-related queries
  if (lowerMessage.includes('budget') || lowerMessage.includes('spending')) {
    if (predictiveAnalyticsEngine?.isInitialized) {
      const predictions = predictiveAnalyticsEngine.getAllPredictions();
      if (predictions.budget_forecast) {
        const forecast = predictions.budget_forecast;
        return `Based on current budget analysis, I can see trends across departments. The overall budget trend is ${forecast.overallTrend > 0 ? 'increasing' : 'decreasing'} by ${Math.abs(forecast.overallTrend * 100).toFixed(1)}%. Would you like me to analyze specific department allocations or forecast scenarios?`;
      }
    }
    return "I can help analyze budget patterns and forecasts. The predictive analytics engine is currently processing budget data to provide insights on spending trends and optimization opportunities.";
  }

  // Project-related queries
  if (lowerMessage.includes('project') || lowerMessage.includes('portfolio')) {
    if (predictiveAnalyticsEngine?.isInitialized) {
      const predictions = predictiveAnalyticsEngine.getAllPredictions();
      if (predictions.project_predictions) {
        const projects = predictions.project_predictions;
        return `Current portfolio health is at ${projects.portfolioHealth.toFixed(1)}%. I'm tracking ${projects.predictions.length} active projects with success probability analysis. Would you like details on specific projects or risk assessments?`;
      }
    }
    return "I'm monitoring project portfolios and can provide success probability assessments, risk analysis, and resource optimization recommendations for your active projects.";
  }

  // Anomaly-related queries
  if (lowerMessage.includes('anomal') || lowerMessage.includes('alert') || lowerMessage.includes('unusual')) {
    if (anomalyDetectionSystem?.isInitialized) {
      const stats = anomalyDetectionSystem.getAnomalyStatistics();
      return `I've detected ${stats.total} anomalies recently, including ${stats.bySeverity.critical} critical and ${stats.bySeverity.high} high-priority items. The detection accuracy is ${(stats.detectionAccuracy * 100).toFixed(1)}%. Would you like me to investigate specific anomalies?`;
    }
    return "I'm continuously monitoring for anomalies across budget, compliance, risk, and system metrics using advanced detection algorithms. I can help investigate unusual patterns and recommend actions.";
  }

  // Risk-related queries
  if (lowerMessage.includes('risk') || lowerMessage.includes('compliance')) {
    if (predictiveAnalyticsEngine?.isInitialized) {
      const predictions = predictiveAnalyticsEngine.getAllPredictions();
      if (predictions.risk_assessment) {
        const risk = predictions.risk_assessment;
        return `Current overall risk score is ${risk.overallRiskScore.toFixed(1)}. I'm tracking ${risk.assessments.length} risk categories with predictive analysis. Key emerging risks include: ${risk.emergingRisks.slice(0, 2).join(', ')}. Would you like detailed risk mitigation strategies?`;
      }
    }
    return "I can analyze risk patterns across operational, financial, compliance, strategic, and technology domains. My predictive models help identify emerging risks and recommend mitigation strategies.";
  }

  // Performance and optimization queries
  if (lowerMessage.includes('optim') || lowerMessage.includes('performance') || lowerMessage.includes('efficiency')) {
    if (predictiveAnalyticsEngine?.isInitialized) {
      const predictions = predictiveAnalyticsEngine.getAllPredictions();
      if (predictions.resource_optimization) {
        const optimization = predictions.resource_optimization;
        return `I've identified potential savings of $${(optimization.totalPotentialSavings / 1000000).toFixed(1)}M through resource optimization. Key opportunities include workflow automation and cross-departmental efficiency improvements. Would you like specific optimization recommendations?`;
      }
    }
    return "I can analyze resource utilization patterns and recommend optimization strategies to improve efficiency and reduce costs across departments and projects.";
  }

  // General help or greeting
  if (lowerMessage.includes('help') || lowerMessage.includes('what can you') || lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
    return "I'm your AI Analytics Assistant. I can help you with:\n\n• Budget forecasting and variance analysis\n• Project success predictions and portfolio health\n• Anomaly detection and investigation\n• Risk assessment and mitigation strategies\n• Resource optimization recommendations\n• Real-time insights and trend analysis\n\nWhat would you like to explore?";
  }

  // Default response
  return "I'm analyzing your request using advanced predictive models and anomaly detection systems. I can provide insights on budget trends, project performance, risk assessments, and optimization opportunities. Could you be more specific about what aspect you'd like me to analyze?";
}

module.exports = { router, initializeAIServices };
