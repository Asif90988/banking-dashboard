const EventEmitter = require('events');

class AnomalyDetectionSystem extends EventEmitter {
  constructor() {
    super();
    this.detectors = new Map();
    this.anomalies = [];
    this.thresholds = new Map();
    this.historicalBaselines = new Map();
    this.isInitialized = false;
    
    // Detection algorithms configuration
    this.detectionConfigs = {
      statistical: {
        name: 'Statistical Anomaly Detection',
        methods: ['z_score', 'iqr', 'modified_z_score'],
        sensitivity: 0.95, // 95% confidence interval
        enabled: true
      },
      time_series: {
        name: 'Time Series Anomaly Detection',
        methods: ['seasonal_decomposition', 'arima_residuals', 'lstm_autoencoder'],
        window_size: 24, // 24 data points
        enabled: true
      },
      behavioral: {
        name: 'Behavioral Anomaly Detection',
        methods: ['isolation_forest', 'one_class_svm', 'local_outlier_factor'],
        contamination: 0.1, // 10% expected anomalies
        enabled: true
      },
      multivariate: {
        name: 'Multivariate Anomaly Detection',
        methods: ['mahalanobis_distance', 'pca_reconstruction', 'autoencoder'],
        dimensions: ['budget', 'projects', 'compliance', 'risk'],
        enabled: true
      }
    };

    // Anomaly categories and their severity levels
    this.anomalyCategories = {
      budget: {
        name: 'Budget Anomalies',
        severity_mapping: {
          'spending_spike': 'HIGH',
          'budget_underutilization': 'MEDIUM',
          'allocation_imbalance': 'MEDIUM',
          'variance_pattern': 'LOW'
        }
      },
      performance: {
        name: 'Performance Anomalies',
        severity_mapping: {
          'sudden_drop': 'CRITICAL',
          'gradual_decline': 'HIGH',
          'efficiency_loss': 'MEDIUM',
          'resource_bottleneck': 'HIGH'
        }
      },
      compliance: {
        name: 'Compliance Anomalies',
        severity_mapping: {
          'violation_spike': 'CRITICAL',
          'score_drop': 'HIGH',
          'audit_failure': 'CRITICAL',
          'policy_deviation': 'MEDIUM'
        }
      },
      system: {
        name: 'System Anomalies',
        severity_mapping: {
          'performance_degradation': 'HIGH',
          'error_rate_increase': 'HIGH',
          'resource_exhaustion': 'CRITICAL',
          'connectivity_issues': 'MEDIUM'
        }
      },
      behavioral: {
        name: 'Behavioral Anomalies',
        severity_mapping: {
          'unusual_access_pattern': 'HIGH',
          'data_exfiltration_risk': 'CRITICAL',
          'privilege_escalation': 'CRITICAL',
          'abnormal_usage': 'MEDIUM'
        }
      }
    };

    this.initialize();
  }

  async initialize() {
    try {
      console.log('🔍 Initializing Anomaly Detection System...');
      
      // Initialize detection algorithms
      await this.initializeDetectors();
      
      // Load historical baselines
      await this.loadHistoricalBaselines();
      
      // Set up dynamic thresholds
      await this.setupDynamicThresholds();
      
      // Start real-time monitoring
      this.startRealTimeMonitoring();
      
      this.isInitialized = true;
      console.log('✅ Anomaly Detection System initialized successfully');
      
      this.emit('initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Anomaly Detection System:', error);
      this.emit('error', error);
    }
  }

  async initializeDetectors() {
    console.log('🧠 Initializing anomaly detectors...');
    
    for (const [detectorId, config] of Object.entries(this.detectionConfigs)) {
      if (config.enabled) {
        try {
          const detector = await this.createDetector(detectorId, config);
          this.detectors.set(detectorId, detector);
          console.log(`✅ Initialized detector: ${config.name}`);
        } catch (error) {
          console.error(`❌ Failed to initialize detector ${detectorId}:`, error);
        }
      }
    }
  }

  async createDetector(detectorId, config) {
    // Simulate detector initialization delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      id: detectorId,
      config,
      detect: this.createDetectionFunction(detectorId),
      updateBaseline: this.createBaselineUpdateFunction(detectorId),
      calibrate: this.createCalibrationFunction(detectorId),
      getStats: this.createStatsFunction(detectorId)
    };
  }

  createDetectionFunction(detectorId) {
    return (data, dataType) => {
      switch (detectorId) {
        case 'statistical':
          return this.detectStatisticalAnomalies(data, dataType);
        case 'time_series':
          return this.detectTimeSeriesAnomalies(data, dataType);
        case 'behavioral':
          return this.detectBehavioralAnomalies(data, dataType);
        case 'multivariate':
          return this.detectMultivariateAnomalies(data, dataType);
        default:
          throw new Error(`Unknown detector: ${detectorId}`);
      }
    };
  }

  createBaselineUpdateFunction(detectorId) {
    return (data, dataType) => {
      console.log(`🔄 Updating baseline for ${detectorId} detector`);
      this.updateBaseline(detectorId, data, dataType);
    };
  }

  createCalibrationFunction(detectorId) {
    return (calibrationData) => {
      console.log(`⚙️ Calibrating ${detectorId} detector`);
      // Simulate calibration process
      return {
        accuracy: 0.85 + Math.random() * 0.1,
        precision: 0.80 + Math.random() * 0.15,
        recall: 0.75 + Math.random() * 0.2,
        f1Score: 0.82 + Math.random() * 0.1
      };
    };
  }

  createStatsFunction(detectorId) {
    return () => {
      const detectorAnomalies = this.anomalies.filter(a => a.detectedBy === detectorId);
      return {
        totalDetections: detectorAnomalies.length,
        criticalAnomalies: detectorAnomalies.filter(a => a.severity === 'CRITICAL').length,
        highAnomalies: detectorAnomalies.filter(a => a.severity === 'HIGH').length,
        falsePositiveRate: Math.random() * 0.1, // Simulated
        lastDetection: detectorAnomalies.length > 0 ? detectorAnomalies[0].timestamp : null
      };
    };
  }

  async loadHistoricalBaselines() {
    console.log('📊 Loading historical baselines...');
    
    // Load baselines for different data types
    const dataTypes = ['budget', 'projects', 'compliance', 'risk', 'system'];
    
    for (const dataType of dataTypes) {
      const baseline = await this.calculateBaseline(dataType);
      this.historicalBaselines.set(dataType, baseline);
      console.log(`✅ Loaded baseline for ${dataType}`);
    }
  }

  async calculateBaseline(dataType) {
    // Simulate baseline calculation from historical data
    const historicalData = this.generateHistoricalData(dataType);
    
    return {
      mean: this.calculateMean(historicalData),
      std: this.calculateStandardDeviation(historicalData),
      median: this.calculateMedian(historicalData),
      q1: this.calculatePercentile(historicalData, 25),
      q3: this.calculatePercentile(historicalData, 75),
      iqr: this.calculateIQR(historicalData),
      min: Math.min(...historicalData),
      max: Math.max(...historicalData),
      seasonalPatterns: this.detectSeasonalPatterns(historicalData),
      trendComponents: this.extractTrendComponents(historicalData),
      lastUpdated: new Date()
    };
  }

  generateHistoricalData(dataType) {
    // Generate sample historical data for baseline calculation
    const data = [];
    const baseValue = this.getBaseValue(dataType);
    
    for (let i = 0; i < 100; i++) {
      // Add some noise and seasonal patterns
      const noise = (Math.random() - 0.5) * baseValue * 0.2;
      const seasonal = Math.sin(i / 10) * baseValue * 0.1;
      const trend = i * baseValue * 0.001;
      
      data.push(baseValue + noise + seasonal + trend);
    }
    
    return data;
  }

  getBaseValue(dataType) {
    const baseValues = {
      budget: 1000000,
      projects: 50,
      compliance: 85,
      risk: 25,
      system: 95
    };
    
    return baseValues[dataType] || 100;
  }

  async setupDynamicThresholds() {
    console.log('⚙️ Setting up dynamic thresholds...');
    
    for (const [dataType, baseline] of this.historicalBaselines) {
      const thresholds = {
        statistical: {
          z_score: 2.5, // 2.5 standard deviations
          iqr_multiplier: 1.5,
          modified_z_score: 3.5
        },
        time_series: {
          residual_threshold: baseline.std * 2,
          seasonal_deviation: baseline.std * 1.5,
          trend_change: 0.1 // 10% change
        },
        behavioral: {
          isolation_score: 0.6,
          svm_decision: 0,
          lof_threshold: 2.0
        },
        multivariate: {
          mahalanobis_threshold: 3.0,
          reconstruction_error: baseline.std * 2.5,
          pca_variance: 0.95
        }
      };
      
      this.thresholds.set(dataType, thresholds);
    }
    
    console.log('✅ Dynamic thresholds configured');
  }

  startRealTimeMonitoring() {
    console.log('🔄 Starting real-time anomaly monitoring...');
    
    // Monitor every 30 seconds
    setInterval(() => {
      this.runAnomalyDetectionCycle();
    }, 30 * 1000);
    
    // Run initial detection
    setTimeout(() => {
      this.runAnomalyDetectionCycle();
    }, 5000);
  }

  async runAnomalyDetectionCycle() {
    try {
      console.log('🔍 Running anomaly detection cycle...');
      
      // Generate or fetch real-time data
      const realtimeData = await this.fetchRealtimeData();
      
      // Run detection on each data stream
      for (const [dataType, data] of Object.entries(realtimeData)) {
        await this.detectAnomaliesInData(dataType, data);
      }
      
      // Process and prioritize detected anomalies
      await this.processDetectedAnomalies();
      
      console.log('✅ Anomaly detection cycle completed');
    } catch (error) {
      console.error('❌ Error in anomaly detection cycle:', error);
      this.emit('error', error);
    }
  }

  async fetchRealtimeData() {
    // Simulate fetching real-time data from various sources
    return {
      budget: this.generateRealtimeBudgetData(),
      projects: this.generateRealtimeProjectData(),
      compliance: this.generateRealtimeComplianceData(),
      risk: this.generateRealtimeRiskData(),
      system: this.generateRealtimeSystemData()
    };
  }

  generateRealtimeBudgetData() {
    const departments = ['Technology', 'Risk Management', 'Operations', 'Compliance'];
    return departments.map(dept => ({
      department: dept,
      currentSpend: Math.random() * 500000 + 100000,
      utilizationRate: Math.random() * 0.4 + 0.6, // 60-100%
      variance: (Math.random() - 0.5) * 0.3, // -15% to +15%
      timestamp: new Date()
    }));
  }

  generateRealtimeProjectData() {
    return [
      { id: 'proj_001', progress: Math.random() * 100, riskScore: Math.random() * 100 },
      { id: 'proj_002', progress: Math.random() * 100, riskScore: Math.random() * 100 },
      { id: 'proj_003', progress: Math.random() * 100, riskScore: Math.random() * 100 }
    ].map(proj => ({ ...proj, timestamp: new Date() }));
  }

  generateRealtimeComplianceData() {
    return {
      overallScore: Math.random() * 20 + 80, // 80-100
      violations: Math.floor(Math.random() * 5),
      auditStatus: Math.random() > 0.8 ? 'FAILED' : 'PASSED',
      riskLevel: Math.random() * 50 + 10, // 10-60
      timestamp: new Date()
    };
  }

  generateRealtimeRiskData() {
    return {
      operationalRisk: Math.random() * 50 + 10,
      financialRisk: Math.random() * 40 + 15,
      complianceRisk: Math.random() * 30 + 20,
      strategicRisk: Math.random() * 45 + 5,
      timestamp: new Date()
    };
  }

  generateRealtimeSystemData() {
    return {
      cpuUsage: Math.random() * 100,
      memoryUsage: Math.random() * 100,
      diskUsage: Math.random() * 100,
      networkLatency: Math.random() * 100 + 10,
      errorRate: Math.random() * 10,
      timestamp: new Date()
    };
  }

  async detectAnomaliesInData(dataType, data) {
    const detectedAnomalies = [];
    
    // Run each enabled detector
    for (const [detectorId, detector] of this.detectors) {
      try {
        const anomalies = await detector.detect(data, dataType);
        detectedAnomalies.push(...anomalies);
      } catch (error) {
        console.error(`❌ Error in ${detectorId} detector:`, error);
      }
    }
    
    // Store detected anomalies
    for (const anomaly of detectedAnomalies) {
      this.recordAnomaly(anomaly, dataType);
    }
    
    return detectedAnomalies;
  }

  detectStatisticalAnomalies(data, dataType) {
    const anomalies = [];
    const baseline = this.historicalBaselines.get(dataType);
    const thresholds = this.thresholds.get(dataType)?.statistical;
    
    if (!baseline || !thresholds) return anomalies;
    
    // Convert data to numerical values for analysis
    const values = this.extractNumericalValues(data, dataType);
    
    for (const value of values) {
      // Z-Score anomaly detection
      const zScore = Math.abs((value.value - baseline.mean) / baseline.std);
      if (zScore > thresholds.z_score) {
        anomalies.push({
          type: 'statistical',
          method: 'z_score',
          value: value.value,
          expected: baseline.mean,
          deviation: zScore,
          severity: this.calculateSeverity(zScore, 'z_score'),
          confidence: Math.min(0.95, zScore / thresholds.z_score),
          metadata: value.metadata
        });
      }
      
      // IQR anomaly detection
      const iqrLower = baseline.q1 - thresholds.iqr_multiplier * baseline.iqr;
      const iqrUpper = baseline.q3 + thresholds.iqr_multiplier * baseline.iqr;
      
      if (value.value < iqrLower || value.value > iqrUpper) {
        anomalies.push({
          type: 'statistical',
          method: 'iqr',
          value: value.value,
          expected: `${baseline.q1} - ${baseline.q3}`,
          deviation: Math.min(iqrLower - value.value, value.value - iqrUpper),
          severity: this.calculateSeverity(Math.abs(value.value - baseline.median) / baseline.iqr, 'iqr'),
          confidence: 0.85,
          metadata: value.metadata
        });
      }
    }
    
    return anomalies;
  }

  detectTimeSeriesAnomalies(data, dataType) {
    const anomalies = [];
    const baseline = this.historicalBaselines.get(dataType);
    const thresholds = this.thresholds.get(dataType)?.time_series;
    
    if (!baseline || !thresholds) return anomalies;
    
    // Simulate time series anomaly detection
    const values = this.extractNumericalValues(data, dataType);
    
    for (const value of values) {
      // Check for seasonal deviation
      const expectedSeasonal = this.getExpectedSeasonalValue(value.timestamp, baseline.seasonalPatterns);
      const seasonalDeviation = Math.abs(value.value - expectedSeasonal);
      
      if (seasonalDeviation > thresholds.seasonal_deviation) {
        anomalies.push({
          type: 'time_series',
          method: 'seasonal_deviation',
          value: value.value,
          expected: expectedSeasonal,
          deviation: seasonalDeviation,
          severity: this.calculateSeverity(seasonalDeviation / thresholds.seasonal_deviation, 'seasonal'),
          confidence: 0.80,
          metadata: value.metadata
        });
      }
      
      // Check for trend anomalies
      const expectedTrend = this.getExpectedTrendValue(value.timestamp, baseline.trendComponents);
      const trendDeviation = Math.abs((value.value - expectedTrend) / expectedTrend);
      
      if (trendDeviation > thresholds.trend_change) {
        anomalies.push({
          type: 'time_series',
          method: 'trend_deviation',
          value: value.value,
          expected: expectedTrend,
          deviation: trendDeviation,
          severity: this.calculateSeverity(trendDeviation / thresholds.trend_change, 'trend'),
          confidence: 0.75,
          metadata: value.metadata
        });
      }
    }
    
    return anomalies;
  }

  detectBehavioralAnomalies(data, dataType) {
    const anomalies = [];
    const thresholds = this.thresholds.get(dataType)?.behavioral;
    
    if (!thresholds) return anomalies;
    
    // Simulate behavioral anomaly detection using isolation forest approach
    const values = this.extractNumericalValues(data, dataType);
    
    for (const value of values) {
      // Simulate isolation score calculation
      const isolationScore = this.calculateIsolationScore(value, dataType);
      
      if (isolationScore > thresholds.isolation_score) {
        anomalies.push({
          type: 'behavioral',
          method: 'isolation_forest',
          value: value.value,
          isolationScore,
          severity: this.calculateSeverity(isolationScore, 'isolation'),
          confidence: isolationScore,
          metadata: value.metadata
        });
      }
      
      // Simulate Local Outlier Factor
      const lofScore = this.calculateLOFScore(value, dataType);
      
      if (lofScore > thresholds.lof_threshold) {
        anomalies.push({
          type: 'behavioral',
          method: 'local_outlier_factor',
          value: value.value,
          lofScore,
          severity: this.calculateSeverity(lofScore / thresholds.lof_threshold, 'lof'),
          confidence: Math.min(0.95, lofScore / thresholds.lof_threshold),
          metadata: value.metadata
        });
      }
    }
    
    return anomalies;
  }

  detectMultivariateAnomalies(data, dataType) {
    const anomalies = [];
    const thresholds = this.thresholds.get(dataType)?.multivariate;
    
    if (!thresholds) return anomalies;
    
    // Simulate multivariate anomaly detection
    const multivariateData = this.extractMultivariateFeatures(data, dataType);
    
    for (const dataPoint of multivariateData) {
      // Simulate Mahalanobis distance calculation
      const mahalanobisDistance = this.calculateMahalanobisDistance(dataPoint, dataType);
      
      if (mahalanobisDistance > thresholds.mahalanobis_threshold) {
        anomalies.push({
          type: 'multivariate',
          method: 'mahalanobis_distance',
          features: dataPoint.features,
          distance: mahalanobisDistance,
          severity: this.calculateSeverity(mahalanobisDistance / thresholds.mahalanobis_threshold, 'mahalanobis'),
          confidence: Math.min(0.95, mahalanobisDistance / thresholds.mahalanobis_threshold),
          metadata: dataPoint.metadata
        });
      }
      
      // Simulate autoencoder reconstruction error
      const reconstructionError = this.calculateReconstructionError(dataPoint, dataType);
      
      if (reconstructionError > thresholds.reconstruction_error) {
        anomalies.push({
          type: 'multivariate',
          method: 'autoencoder',
          features: dataPoint.features,
          reconstructionError,
          severity: this.calculateSeverity(reconstructionError / thresholds.reconstruction_error, 'reconstruction'),
          confidence: 0.85,
          metadata: dataPoint.metadata
        });
      }
    }
    
    return anomalies;
  }

  recordAnomaly(anomaly, dataType) {
    const anomalyRecord = {
      id: `anomaly_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      dataType,
      category: this.categorizeAnomaly(anomaly, dataType),
      ...anomaly,
      detectedBy: anomaly.type,
      timestamp: new Date(),
      status: 'DETECTED',
      investigated: false,
      falsePositive: false
    };
    
    // Add to anomalies list (keep last 1000)
    this.anomalies.unshift(anomalyRecord);
    if (this.anomalies.length > 1000) {
      this.anomalies.splice(1000);
    }
    
    // Emit anomaly event
    this.emit('anomaly_detected', anomalyRecord);
    
    console.log(`🚨 Anomaly detected: ${anomalyRecord.category} (${anomalyRecord.severity})`);
  }

  categorizeAnomaly(anomaly, dataType) {
    // Categorize based on data type and anomaly characteristics
    if (dataType === 'budget') {
      if (anomaly.method === 'z_score' && anomaly.deviation > 3) {
        return 'spending_spike';
      } else if (anomaly.value < anomaly.expected * 0.7) {
        return 'budget_underutilization';
      } else {
        return 'allocation_imbalance';
      }
    } else if (dataType === 'system') {
      if (anomaly.value > 90) {
        return 'resource_exhaustion';
      } else if (anomaly.method === 'trend_deviation') {
        return 'performance_degradation';
      } else {
        return 'connectivity_issues';
      }
    } else if (dataType === 'compliance') {
      if (anomaly.severity === 'CRITICAL') {
        return 'violation_spike';
      } else {
        return 'score_drop';
      }
    }
    
    return 'general_anomaly';
  }

  calculateSeverity(score, method) {
    // Calculate severity based on score and method
    if (method === 'z_score') {
      if (score > 4) return 'CRITICAL';
      if (score > 3) return 'HIGH';
      if (score > 2.5) return 'MEDIUM';
      return 'LOW';
    } else if (method === 'isolation') {
      if (score > 0.8) return 'CRITICAL';
      if (score > 0.7) return 'HIGH';
      if (score > 0.6) return 'MEDIUM';
      return 'LOW';
    } else {
      if (score > 2) return 'HIGH';
      if (score > 1.5) return 'MEDIUM';
      return 'LOW';
    }
  }

  async processDetectedAnomalies() {
    const recentAnomalies = this.anomalies.filter(a => 
      new Date() - a.timestamp < 5 * 60 * 1000 // Last 5 minutes
    );
    
    if (recentAnomalies.length === 0) return;
    
    // Group anomalies by category and severity
    const groupedAnomalies = this.groupAnomalies(recentAnomalies);
    
    // Send alerts for critical anomalies
    await this.sendAnomalyAlerts(groupedAnomalies);
    
    // Update anomaly statistics
    this.updateAnomalyStatistics(recentAnomalies);
    
    // Broadcast to clients
    this.broadcastAnomalies(groupedAnomalies);
  }

  groupAnomalies(anomalies) {
    const grouped = {};
    
    for (const anomaly of anomalies) {
      const key = `${anomaly.category}_${anomaly.severity}`;
      if (!grouped[key]) {
        grouped[key] = {
          category: anomaly.category,
          severity: anomaly.severity,
          count: 0,
          anomalies: []
        };
      }
      grouped[key].count++;
      grouped[key].anomalies.push(anomaly);
    }
    
    return Object.values(grouped);
  }

  async sendAnomalyAlerts(groupedAnomalies) {
    for (const group of groupedAnomalies) {
      if (group.severity === 'CRITICAL' || group.severity === 'HIGH') {
        const alert = {
          type: 'ANOMALY_ALERT',
          category: group.category,
          severity: group.severity,
          count: group.count,
          message: this.generateAlertMessage(group),
          timestamp: new Date(),
          anomalies: group.anomalies.slice(0, 5) // Include first 5 anomalies
        };
        
        this.emit('alert', alert);
        console.log(`🚨 ALERT: ${alert.message}`);
      }
    }
  }

  generateAlertMessage(group) {
    const categoryName = this.anomalyCategories[group.category]?.name || group.category;
    return `${group.severity} anomaly detected: ${group.count} ${categoryName} anomalies in the last 5 minutes`;
  }

  updateAnomalyStatistics(anomalies) {
    // Update internal statistics for monitoring and reporting
    const stats = {
      totalAnomalies: this.anomalies.length,
      recentAnomalies: anomalies.length,
      criticalAnomalies: anomalies.filter(a => a.severity === 'CRITICAL').length,
      highAnomalies: anomalies.filter(a => a.severity === 'HIGH').length,
      falsePositiveRate: this.calculateFalsePositiveRate(),
      detectionAccuracy: this.calculateDetectionAccuracy(),
      lastUpdated: new Date()
    };
    
    this.emit('statistics_updated', stats);
  }

  broadcastAnomalies(groupedAnomalies) {
    if (this.broadcastToClients) {
      this.broadcastToClients('anomalies_detected', {
        groups: groupedAnomalies,
        timestamp: new Date()
      });
    }
  }

  // Helper methods for calculations
  extractNumericalValues(data, dataType) {
    const values = [];
    
    if (Array.isArray(data)) {
      for (const item of data) {
        if (dataType === 'budget') {
          values.push({
            value: item.currentSpend,
            timestamp: item.timestamp,
            metadata: { department: item.department, utilizationRate: item.utilizationRate }
          });
        } else if (dataType === 'projects') {
          values.push({
            value: item.riskScore,
            timestamp: item.timestamp,
            metadata: { projectId: item.id, progress: item.progress }
          });
        }
      }
    } else {
      // Handle single object data
      if (dataType === 'compliance') {
        values.push({
          value: data.overallScore,
          timestamp: data.timestamp,
          metadata: { violations: data.violations, auditStatus: data.auditStatus }
        });
      } else if (dataType === 'system') {
        values.push(
          { value: data.cpuUsage, timestamp: data.timestamp, metadata: { metric: 'cpu' } },
          { value: data.memoryUsage, timestamp: data.timestamp, metadata: { metric: 'memory' } },
          { value: data.errorRate, timestamp: data.timestamp, metadata: { metric: 'errors' } }
        );
      }
    }
    
    return values;
  }

  extractMultivariateFeatures(data, dataType) {
    const features = [];
    
    if (dataType === 'system' && data) {
      features.push({
        features: [data.cpuUsage, data.memoryUsage, data.diskUsage, data.networkLatency],
        timestamp: data.timestamp,
        metadata: { type: 'system_metrics' }
      });
    } else if (dataType === 'risk' && data) {
      features.push({
        features: [data.operationalRisk, data.financialRisk, data.complianceRisk, data.strategicRisk],
        timestamp: data.timestamp,
        metadata: { type: 'risk_metrics' }
      });
    }
    
    return features;
  }

  // Statistical calculation methods
  calculateMean(data) {
    return data.reduce((sum, val) => sum + val, 0) / data.length;
  }

  calculateStandardDeviation(data) {
    const mean = this.calculateMean(data);
    const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;
    return Math.sqrt(variance);
  }

  calculateMedian(data) {
    const sorted = [...data].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
  }

  calculatePercentile(data, percentile) {
    const sorted = [...data].sort((a, b) => a - b);
    const index = (percentile / 100) * (sorted.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index % 1;
    
    return sorted[lower] * (1 - weight) + sorted[upper] * weight;
  }

  calculateIQR(data) {
    return this.calculatePercentile(data, 75) - this.calculatePercentile(data, 25);
  }

  detectSeasonalPatterns(data) {
    // Simulate seasonal pattern detection
    return {
      hasSeasonality: Math.random() > 0.5,
      period: 12, // Monthly seasonality
      amplitude: this.calculateStandardDeviation(data) * 0.3
    };
  }

  extractTrendComponents(data) {
    // Simulate trend extraction
    const trend = this.calculateTrend(data);
    return {
      slope: trend,
      intercept: this.calculateMean(data),
      strength: Math.abs(trend)
    };
  }

  calculateTrend(data) {
    if (data.length < 2) return 0;
    
    const n = data.length;
    const sumX = (n * (n + 1)) / 2;
    const sumY = data.reduce((sum, val) => sum + val, 0);
    const sumXY = data.reduce((sum, val, idx) => sum + val * (idx + 1), 0);
    const sumX2 = (n * (n + 1) * (2 * n + 1)) / 6;
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    return slope;
  }

  getExpectedSeasonalValue(timestamp, seasonalPatterns) {
    if (!seasonalPatterns.hasSeasonality) return 0;
    
    const dayOfYear = timestamp.getDate();
    return seasonalPatterns.amplitude * Math.sin((2 * Math.PI * dayOfYear) / seasonalPatterns.period);
  }

  getExpectedTrendValue(timestamp, trendComponents) {
    const daysSinceEpoch = Math.floor(timestamp.getTime() / (1000 * 60 * 60 * 24));
    return trendComponents.intercept + trendComponents.slope * daysSinceEpoch;
  }

  calculateIsolationScore(value, dataType) {
    // Simulate isolation forest score calculation
    const baseline = this.historicalBaselines.get(dataType);
    if (!baseline) return 0.5;
    
    const deviation = Math.abs(value.value - baseline.mean) / baseline.std;
    return Math.min(0.95, deviation / 4); // Normalize to 0-1 range
  }

  calculateLOFScore(value, dataType) {
    // Simulate Local Outlier Factor calculation
    const baseline = this.historicalBaselines.get(dataType);
    if (!baseline) return 1.0;
    
    const deviation = Math.abs(value.value - baseline.median) / baseline.iqr;
    return Math.max(1.0, deviation);
  }

  calculateMahalanobisDistance(dataPoint, dataType) {
    // Simulate Mahalanobis distance calculation
    const features = dataPoint.features;
    const mean = features.reduce((sum, val) => sum + val, 0) / features.length;
    const variance = features.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / features.length;
    
    return Math.sqrt(variance) * (1 + Math.random() * 0.5);
  }

  calculateReconstructionError(dataPoint, dataType) {
    // Simulate autoencoder reconstruction error
    const features = dataPoint.features;
    const reconstructed = features.map(f => f * (0.9 + Math.random() * 0.2)); // Simulate reconstruction
    
    const error = features.reduce((sum, val, idx) => sum + Math.pow(val - reconstructed[idx], 2), 0);
    return Math.sqrt(error / features.length);
  }

  calculateFalsePositiveRate() {
    const investigatedAnomalies = this.anomalies.filter(a => a.investigated);
    if (investigatedAnomalies.length === 0) return 0;
    
    const falsePositives = investigatedAnomalies.filter(a => a.falsePositive).length;
    return falsePositives / investigatedAnomalies.length;
  }

  calculateDetectionAccuracy() {
    const investigatedAnomalies = this.anomalies.filter(a => a.investigated);
    if (investigatedAnomalies.length === 0) return 0.85; // Default accuracy
    
    const truePositives = investigatedAnomalies.filter(a => !a.falsePositive).length;
    return truePositives / investigatedAnomalies.length;
  }

  updateBaseline(detectorId, data, dataType) {
    // Update baseline with new data
    const currentBaseline = this.historicalBaselines.get(dataType);
    if (!currentBaseline) return;
    
    // Add new data to historical data and recalculate baseline
    const historicalData = this.generateHistoricalData(dataType);
    const values = this.extractNumericalValues(data, dataType);
    
    for (const value of values) {
      historicalData.push(value.value);
    }
    
    // Keep only recent data (last 200 points)
    if (historicalData.length > 200) {
      historicalData.splice(0, historicalData.length - 200);
    }
    
    // Recalculate baseline
    const updatedBaseline = {
      mean: this.calculateMean(historicalData),
      std: this.calculateStandardDeviation(historicalData),
      median: this.calculateMedian(historicalData),
      q1: this.calculatePercentile(historicalData, 25),
      q3: this.calculatePercentile(historicalData, 75),
      iqr: this.calculateIQR(historicalData),
      min: Math.min(...historicalData),
      max: Math.max(...historicalData),
      seasonalPatterns: currentBaseline.seasonalPatterns,
      trendComponents: currentBaseline.trendComponents,
      lastUpdated: new Date()
    };
    
    this.historicalBaselines.set(dataType, updatedBaseline);
    console.log(`📊 Updated baseline for ${dataType}`);
  }

  // Public API methods
  getAnomalies(limit = 50, severity = null) {
    let anomalies = this.anomalies;
    
    if (severity) {
      anomalies = anomalies.filter(a => a.severity === severity);
    }
    
    return anomalies.slice(0, limit);
  }

  getAnomalyStatistics() {
    const total = this.anomalies.length;
    const critical = this.anomalies.filter(a => a.severity === 'CRITICAL').length;
    const high = this.anomalies.filter(a => a.severity === 'HIGH').length;
    const medium = this.anomalies.filter(a => a.severity === 'MEDIUM').length;
    const low = this.anomalies.filter(a => a.severity === 'LOW').length;
    
    return {
      total,
      bySeverity: { critical, high, medium, low },
      byCategory: this.getAnomaliesByCategory(),
      byDetector: this.getAnomaliesByDetector(),
      falsePositiveRate: this.calculateFalsePositiveRate(),
      detectionAccuracy: this.calculateDetectionAccuracy(),
      lastUpdated: new Date()
    };
  }

  getAnomaliesByCategory() {
    const categories = {};
    for (const anomaly of this.anomalies) {
      categories[anomaly.category] = (categories[anomaly.category] || 0) + 1;
    }
    return categories;
  }

  getAnomaliesByDetector() {
    const detectors = {};
    for (const anomaly of this.anomalies) {
      detectors[anomaly.detectedBy] = (detectors[anomaly.detectedBy] || 0) + 1;
    }
    return detectors;
  }

  markAnomalyInvestigated(anomalyId, isFalsePositive = false) {
    const anomaly = this.anomalies.find(a => a.id === anomalyId);
    if (anomaly) {
      anomaly.investigated = true;
      anomaly.falsePositive = isFalsePositive;
      anomaly.investigatedAt = new Date();
      
      console.log(`🔍 Anomaly ${anomalyId} marked as investigated (false positive: ${isFalsePositive})`);
      this.emit('anomaly_investigated', anomaly);
    }
  }

  getDetectorStatus() {
    const status = {};
    
    for (const [detectorId, detector] of this.detectors) {
      status[detectorId] = {
        name: detector.config.name,
        enabled: detector.config.enabled,
        stats: detector.getStats(),
        lastCalibration: new Date() // Simulated
      };
    }
    
    return status;
  }

  // Integration methods
  setBroadcastFunction(broadcastFn) {
    this.broadcastToClients = broadcastFn;
  }

  connectToKafka(kafkaService) {
    console.log('🔗 Connecting Anomaly Detection to Kafka...');
    
    // Listen for data updates to trigger anomaly detection
    kafkaService.on('budget_updated', (data) => {
      this.detectAnomaliesInData('budget', [data]);
    });
    
    kafkaService.on('project_updated', (data) => {
      this.detectAnomaliesInData('projects', [data]);
    });
    
    kafkaService.on('system_metrics', (data) => {
      this.detectAnomaliesInData('system', data);
    });
    
    console.log('✅ Anomaly Detection connected to Kafka');
  }

  connectToPredictiveAnalytics(predictiveEngine) {
    console.log('🔗 Connecting Anomaly Detection to Predictive Analytics...');
    
    // Listen for prediction updates to detect anomalies in predictions
    predictiveEngine.on('predictions_updated', (predictions) => {
      this.detectPredictionAnomalies(predictions);
    });
    
    console.log('✅ Anomaly Detection connected to Predictive Analytics');
  }

  async detectPredictionAnomalies(predictions) {
    // Detect anomalies in prediction results
    for (const [predictionType, predictionData] of Object.entries(predictions)) {
      if (predictionType === 'budget_forecast') {
        await this.detectBudgetForecastAnomalies(predictionData);
      } else if (predictionType === 'risk_assessment') {
        await this.detectRiskAssessmentAnomalies(predictionData);
      }
    }
  }

  async detectBudgetForecastAnomalies(forecastData) {
    for (const forecast of forecastData.forecasts) {
      // Check for unusually high variance in predictions
      if (forecast.currentMonth.variance > forecast.currentMonth.predicted * 0.3) {
        this.recordAnomaly({
          type: 'prediction',
          method: 'forecast_variance',
          value: forecast.currentMonth.variance,
          expected: forecast.currentMonth.predicted * 0.2,
          deviation: forecast.currentMonth.variance / (forecast.currentMonth.predicted * 0.2),
          severity: 'HIGH',
          confidence: 0.8,
          metadata: { department: forecast.department, predictionType: 'budget_forecast' }
        }, 'prediction');
      }
    }
  }

  async detectRiskAssessmentAnomalies(riskData) {
    for (const assessment of riskData.assessments) {
      // Check for sudden risk level changes
      const riskChange = Math.abs(assessment.predictedRiskLevel - assessment.currentRiskLevel);
      if (riskChange > 20) { // 20 point change
        this.recordAnomaly({
          type: 'prediction',
          method: 'risk_change',
          value: assessment.predictedRiskLevel,
          expected: assessment.currentRiskLevel,
          deviation: riskChange,
          severity: riskChange > 30 ? 'CRITICAL' : 'HIGH',
          confidence: assessment.confidence,
          metadata: { category: assessment.category, predictionType: 'risk_assessment' }
        }, 'prediction');
      }
    }
  }

  // Graceful shutdown
  async shutdown() {
    console.log('🔌 Shutting down Anomaly Detection System...');
    
    try {
      // Clear intervals
      if (this.monitoringInterval) {
        clearInterval(this.monitoringInterval);
      }
      
      // Save current state if needed
      console.log(`💾 Saving ${this.anomalies.length} anomaly records...`);
      
      console.log('✅ Anomaly Detection System shut down successfully');
    } catch (error) {
      console.error('❌ Error during shutdown:', error.message);
    }
  }
}

module.exports = AnomalyDetectionSystem;
