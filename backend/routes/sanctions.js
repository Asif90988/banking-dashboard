const express = require('express');
const router = express.Router();

// Mock sanctions alerts data - in production this would come from the Kafka streaming system
let sanctionsAlerts = [
  {
    id: '1',
    type: 'flagged_transaction',
    message: 'High-risk transaction flagged: $50,000 transfer to sanctioned jurisdiction - requires immediate review',
    severity: 'critical',
    timestamp: new Date().toISOString(),
    customerName: 'ACME Corp',
    amount: 50000,
    currency: 'USD'
  },
  {
    id: '2',
    type: 'sanctions_match',
    message: 'Potential sanctions match detected: Customer name similarity 85% with OFAC list entry',
    severity: 'high',
    timestamp: new Date().toISOString(),
    matchedEntity: 'Sanctioned Individual',
    confidence: 85
  },
  {
    id: '3',
    type: 'compliance_alert',
    message: 'AML screening completed: 3 transactions require enhanced due diligence procedures',
    severity: 'medium',
    timestamp: new Date().toISOString()
  },
  {
    id: '4',
    type: 'flagged_transaction',
    message: 'Wire transfer blocked: Destination bank on restricted list - transaction automatically rejected',
    severity: 'high',
    timestamp: new Date().toISOString(),
    amount: 25000,
    currency: 'EUR'
  },
  {
    id: '5',
    type: 'sanctions_match',
    message: 'PEP screening alert: Customer identified as Politically Exposed Person - enhanced monitoring required',
    severity: 'medium',
    timestamp: new Date().toISOString()
  },
  {
    id: '6',
    type: 'compliance_alert',
    message: 'Sanctions list updated: 47 new entities added to watchlist - system automatically rescreening all customers',
    severity: 'low',
    timestamp: new Date().toISOString()
  }
];

// GET /api/sanctions/alerts - Get all sanctions alerts
router.get('/alerts', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    
    // Sort by timestamp (newest first)
    const sortedAlerts = sanctionsAlerts.sort((a, b) => 
      new Date(b.timestamp) - new Date(a.timestamp)
    );
    
    const paginatedAlerts = sortedAlerts.slice(offset, offset + limit);
    
    res.json({
      success: true,
      data: paginatedAlerts,
      total: sanctionsAlerts.length,
      limit,
      offset
    });
  } catch (error) {
    console.error('Error fetching sanctions alerts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch sanctions alerts'
    });
  }
});

// GET /api/sanctions/alerts/:id - Get specific sanctions alert
router.get('/alerts/:id', (req, res) => {
  try {
    const alert = sanctionsAlerts.find(a => a.id === req.params.id);
    
    if (!alert) {
      return res.status(404).json({
        success: false,
        error: 'Sanctions alert not found'
      });
    }
    
    res.json({
      success: true,
      data: alert
    });
  } catch (error) {
    console.error('Error fetching sanctions alert:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch sanctions alert'
    });
  }
});

// POST /api/sanctions/alerts - Add new sanctions alert (for testing/simulation)
router.post('/alerts', (req, res) => {
  try {
    const { type, message, severity, customerName, amount, currency, matchedEntity, confidence } = req.body;
    
    if (!type || !message || !severity) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: type, message, severity'
      });
    }
    
    const newAlert = {
      id: Date.now().toString(),
      type,
      message,
      severity,
      timestamp: new Date().toISOString(),
      customerName,
      amount,
      currency,
      matchedEntity,
      confidence
    };
    
    sanctionsAlerts.unshift(newAlert); // Add to beginning of array
    
    // Keep only last 100 alerts
    if (sanctionsAlerts.length > 100) {
      sanctionsAlerts = sanctionsAlerts.slice(0, 100);
    }
    
    res.status(201).json({
      success: true,
      data: newAlert
    });
  } catch (error) {
    console.error('Error creating sanctions alert:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create sanctions alert'
    });
  }
});

// GET /api/sanctions/stats - Get sanctions screening statistics
router.get('/stats', (req, res) => {
  try {
    const stats = {
      totalAlerts: sanctionsAlerts.length,
      criticalAlerts: sanctionsAlerts.filter(a => a.severity === 'critical').length,
      highAlerts: sanctionsAlerts.filter(a => a.severity === 'high').length,
      mediumAlerts: sanctionsAlerts.filter(a => a.severity === 'medium').length,
      lowAlerts: sanctionsAlerts.filter(a => a.severity === 'low').length,
      flaggedTransactions: sanctionsAlerts.filter(a => a.type === 'flagged_transaction').length,
      sanctionsMatches: sanctionsAlerts.filter(a => a.type === 'sanctions_match').length,
      complianceAlerts: sanctionsAlerts.filter(a => a.type === 'compliance_alert').length,
      lastUpdated: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching sanctions stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch sanctions statistics'
    });
  }
});

// Function to add alert from Kafka streaming system
function addAlertFromStream(alertData) {
  const newAlert = {
    id: Date.now().toString(),
    ...alertData,
    timestamp: new Date().toISOString()
  };
  
  sanctionsAlerts.unshift(newAlert);
  
  // Keep only last 100 alerts
  if (sanctionsAlerts.length > 100) {
    sanctionsAlerts = sanctionsAlerts.slice(0, 100);
  }
  
  return newAlert;
}

// Export the function for use by the streaming system
router.addAlertFromStream = addAlertFromStream;

module.exports = router;
