const DataGenerator = require('./DataGenerator');
const fs = require('fs');
const path = require('path');

class CachedDataGenerator {
  constructor() {
    this.dataGenerator = new DataGenerator();
    this.cacheDir = path.join(__dirname, '../cache');
    this.cacheFile = path.join(this.cacheDir, 'vps-data-cache.json');
    this.refreshInterval = 2.5 * 60 * 60 * 1000; // 2.5 hours in milliseconds
    
    // Ensure cache directory exists
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }
    
    this.cachedData = null;
    this.lastGenerated = null;
    
    console.log('🔄 VPS Cached Data Generator initialized');
    console.log(`📅 Data refresh interval: ${this.refreshInterval / (60 * 60 * 1000)} hours`);
  }

  // Check if cached data is still valid
  isCacheValid() {
    if (!this.lastGenerated) return false;
    
    const now = new Date();
    const timeDiff = now.getTime() - this.lastGenerated.getTime();
    const isValid = timeDiff < this.refreshInterval;
    
    if (!isValid) {
      console.log(`⏰ Cache expired. Last generated: ${this.lastGenerated}, ${(timeDiff / (60 * 60 * 1000)).toFixed(1)} hours ago`);
    }
    
    return isValid;
  }

  // Load cached data from file
  loadCachedData() {
    try {
      if (fs.existsSync(this.cacheFile)) {
        const fileData = fs.readFileSync(this.cacheFile, 'utf8');
        const parsed = JSON.parse(fileData);
        
        this.cachedData = parsed.data;
        this.lastGenerated = new Date(parsed.timestamp);
        
        console.log(`📂 Loaded cached data from ${this.lastGenerated}`);
        return true;
      }
    } catch (error) {
      console.warn('⚠️ Failed to load cached data:', error.message);
    }
    return false;
  }

  // Save data to cache file
  saveCachedData() {
    try {
      const cacheData = {
        data: this.cachedData,
        timestamp: this.lastGenerated.toISOString(),
        refreshInterval: this.refreshInterval
      };
      
      fs.writeFileSync(this.cacheFile, JSON.stringify(cacheData, null, 2));
      console.log(`💾 Cached data saved to ${this.cacheFile}`);
    } catch (error) {
      console.warn('⚠️ Failed to save cached data:', error.message);
    }
  }

  // Generate fresh data
  generateFreshData() {
    console.log('🔄 Generating fresh VPS data...');
    
    this.cachedData = {
      budget: this.dataGenerator.generateBudgetData(50),
      projects: this.dataGenerator.generateProjectData(30),
      compliance: this.dataGenerator.generateComplianceData(20),
      metadata: {
        environment: 'VPS Production',
        generatedAt: new Date().toISOString(),
        nextRefresh: new Date(Date.now() + this.refreshInterval).toISOString(),
        refreshInterval: `${this.refreshInterval / (60 * 60 * 1000)} hours`
      }
    };
    
    this.lastGenerated = new Date();
    this.saveCachedData();
    
    console.log(`✅ Fresh VPS data generated. Next refresh: ${this.cachedData.metadata.nextRefresh}`);
    return this.cachedData;
  }

  // Get data (cached or fresh)
  getData() {
    // Try to load from cache first
    if (!this.cachedData) {
      this.loadCachedData();
    }
    
    // Check if we need to refresh
    if (!this.isCacheValid()) {
      return this.generateFreshData();
    }
    
    console.log(`📊 Using cached VPS data (${(Date.now() - this.lastGenerated.getTime()) / (60 * 1000)} minutes old)`);
    return this.cachedData;
  }

  // Get specific data type
  getBudgetData() {
    const data = this.getData();
    return data.budget || [];
  }

  getProjectData() {
    const data = this.getData();
    return data.projects || [];
  }

  getComplianceData() {
    const data = this.getData();
    return data.compliance || [];
  }

  // Force refresh (for manual refresh if needed)
  forceRefresh() {
    console.log('🔄 Forcing data refresh...');
    return this.generateFreshData();
  }

  // Get cache status
  getCacheStatus() {
    const data = this.getData();
    return {
      lastGenerated: this.lastGenerated,
      nextRefresh: new Date(this.lastGenerated.getTime() + this.refreshInterval),
      cacheValid: this.isCacheValid(),
      recordCounts: {
        budget: data.budget?.length || 0,
        projects: data.projects?.length || 0,
        compliance: data.compliance?.length || 0
      }
    };
  }
}

module.exports = CachedDataGenerator;
