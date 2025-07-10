const axios = require('axios');

class EnterpriseAPIConnector {
  constructor() {
    this.apiClients = new Map();
    this.rateLimiters = new Map();
    this.authTokens = new Map();
  }

  // Setup REST API client with authentication and rate limiting
  async setupRESTClient(config) {
    try {
      const client = axios.create({
        baseURL: config.baseURL,
        timeout: config.timeout || 30000,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Citi-Dashboard/1.0',
          ...this.getAuthHeaders(config.authentication)
        }
      });

      // Add request interceptor for rate limiting
      client.interceptors.request.use(async (requestConfig) => {
        await this.handleRateLimit(config.id, config.rateLimit);
        return requestConfig;
      });

      // Add response interceptor for error handling and retries
      client.interceptors.response.use(
        (response) => {
          console.log(`✅ API Success: ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
          return response;
        },
        async (error) => {
          console.warn(`⚠️ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url} - ${error.response?.status || 'Network Error'}`);
          
          if (error.response?.status === 429) {
            // Handle rate limit exceeded
            console.log('Rate limit exceeded, waiting 5 seconds...');
            await this.delay(5000);
            return client.request(error.config);
          }
          
          if (error.response?.status === 401) {
            // Handle authentication error
            console.log('Authentication failed, refreshing token...');
            await this.refreshAuthToken(config);
            return client.request(error.config);
          }
          
          throw error;
        }
      );

      this.apiClients.set(config.id, client);
      console.log(`🔗 API Client configured: ${config.id} -> ${config.baseURL}`);
      return client;
    } catch (error) {
      console.error(`❌ Failed to setup API client ${config.id}:`, error.message);
      throw error;
    }
  }

  // Connect to Citi's internal financial APIs
  async connectToFinancialAPI() {
    const config = {
      id: 'citi-financial-api',
      type: 'rest',
      baseURL: process.env.CITI_FINANCIAL_API_URL || 'https://api-internal.citi.com/v1',
      authentication: {
        type: 'oauth2',
        credentials: {
          clientId: process.env.CITI_CLIENT_ID,
          clientSecret: process.env.CITI_CLIENT_SECRET,
          scope: 'budget.read project.read compliance.read'
        }
      },
      rateLimit: {
        requests: 100,
        period: 60000 // 100 requests per minute
      },
      timeout: 15000,
      retries: 3
    };

    // Get OAuth2 token first
    await this.getOAuth2Token(config);
    
    const client = await this.setupRESTClient(config);
    return client;
  }

  // Connect to SharePoint for document access
  async connectToSharePoint() {
    const config = {
      id: 'sharepoint-api',
      type: 'rest',
      baseURL: process.env.SHAREPOINT_SITE_URL || 'https://citi.sharepoint.com/sites/reginsight',
      authentication: {
        type: 'oauth2',
        credentials: {
          clientId: process.env.SHAREPOINT_CLIENT_ID,
          clientSecret: process.env.SHAREPOINT_CLIENT_SECRET,
          tenantId: process.env.AZURE_TENANT_ID
        }
      },
      rateLimit: {
        requests: 50,
        period: 60000 // 50 requests per minute
      },
      timeout: 20000
    };

    await this.getOAuth2Token(config);
    const client = await this.setupRESTClient(config);
    return client;
  }

  // Get real-time budget data from Citi APIs
  async getBudgetDataFromAPI(department) {
    const client = this.apiClients.get('citi-financial-api');
    if (!client) {
      console.warn('Citi Financial API not available, using fallback data');
      return this.createFallbackBudgetData();
    }

    try {
      const response = await client.get('/budget/allocations', {
        params: {
          department,
          fiscalYear: new Date().getFullYear(),
          includeProjects: true,
          includeForecasts: true,
          region: 'LATAM'
        }
      });

      console.log(`📊 Retrieved budget data from API for department: ${department}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching budget data from API:', error.message);
      return this.createFallbackBudgetData();
    }
  }

  // Get project data from project management APIs
  async getProjectDataFromAPI(filters = {}) {
    const client = this.apiClients.get('citi-financial-api');
    if (!client) {
      console.warn('Citi Financial API not available, using fallback data');
      return this.createFallbackProjectData();
    }

    try {
      const response = await client.get('/projects', {
        params: {
          status: 'active',
          department: filters.department,
          riskLevel: filters.riskLevel,
          region: 'LATAM',
          limit: 100
        }
      });

      console.log(`📋 Retrieved ${response.data.length} projects from API`);
      return response.data;
    } catch (error) {
      console.error('Error fetching project data from API:', error.message);
      return this.createFallbackProjectData();
    }
  }

  // Get files from SharePoint
  async getFilesFromSharePoint(folderPath) {
    const client = this.apiClients.get('sharepoint-api');
    if (!client) {
      console.warn('SharePoint API not available');
      return [];
    }

    try {
      const response = await client.get(`/_api/web/GetFolderByServerRelativeUrl('${folderPath}')/Files`, {
        headers: {
          'Accept': 'application/json;odata=verbose'
        }
      });

      console.log(`📁 Retrieved ${response.data.d.results.length} files from SharePoint`);
      return response.data.d.results;
    } catch (error) {
      console.error('Error fetching files from SharePoint:', error.message);
      return [];
    }
  }

  // Download Excel file from SharePoint
  async downloadExcelFromSharePoint(filePath) {
    const client = this.apiClients.get('sharepoint-api');
    if (!client) {
      throw new Error('SharePoint API not available');
    }

    try {
      const response = await client.get(`/_api/web/GetFileByServerRelativeUrl('${filePath}')/$value`, {
        responseType: 'arraybuffer'
      });

      console.log(`📥 Downloaded Excel file from SharePoint: ${filePath}`);
      return response.data;
    } catch (error) {
      console.error('Error downloading Excel from SharePoint:', error.message);
      throw error;
    }
  }

  // Get OAuth2 token
  async getOAuth2Token(config) {
    try {
      const tokenEndpoint = config.authentication.credentials.tenantId 
        ? `https://login.microsoftonline.com/${config.authentication.credentials.tenantId}/oauth2/v2.0/token`
        : 'https://oauth.citi.com/token';

      const tokenResponse = await axios.post(tokenEndpoint, new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: config.authentication.credentials.clientId,
        client_secret: config.authentication.credentials.clientSecret,
        scope: config.authentication.credentials.scope || 'https://graph.microsoft.com/.default'
      }), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      const token = tokenResponse.data.access_token;
      this.authTokens.set(config.id, {
        token,
        expiresAt: Date.now() + (tokenResponse.data.expires_in * 1000)
      });

      console.log(`🔐 OAuth2 token obtained for ${config.id}`);
      return token;
    } catch (error) {
      console.error(`❌ Failed to get OAuth2 token for ${config.id}:`, error.message);
      throw error;
    }
  }

  // Refresh authentication token
  async refreshAuthToken(config) {
    try {
      await this.getOAuth2Token(config);
      
      // Update the client headers
      const client = this.apiClients.get(config.id);
      if (client) {
        client.defaults.headers = {
          ...client.defaults.headers,
          ...this.getAuthHeaders(config.authentication)
        };
      }
    } catch (error) {
      console.error(`Failed to refresh token for ${config.id}:`, error.message);
    }
  }

  // Get authentication headers
  getAuthHeaders(auth) {
    switch (auth.type) {
      case 'bearer':
        return { Authorization: `Bearer ${auth.credentials.token}` };
      case 'oauth2':
        const tokenData = this.authTokens.get('citi-financial-api') || this.authTokens.get('sharepoint-api');
        return tokenData ? { Authorization: `Bearer ${tokenData.token}` } : {};
      case 'api-key':
        return { 'X-API-Key': auth.credentials.apiKey };
      case 'basic':
        const encoded = Buffer.from(`${auth.credentials.username}:${auth.credentials.password}`).toString('base64');
        return { Authorization: `Basic ${encoded}` };
      default:
        return {};
    }
  }

  // Handle rate limiting
  async handleRateLimit(clientId, rateLimit) {
    if (!rateLimit) return;
    
    const key = `${clientId}-rate-limit`;
    const now = Date.now();
    
    if (!this.rateLimiters.has(key)) {
      this.rateLimiters.set(key, { requests: 0, resetTime: now + rateLimit.period });
    }
    
    const limiter = this.rateLimiters.get(key);
    
    if (now > limiter.resetTime) {
      limiter.requests = 0;
      limiter.resetTime = now + rateLimit.period;
    }
    
    if (limiter.requests >= rateLimit.requests) {
      const waitTime = limiter.resetTime - now;
      console.log(`⏳ Rate limit reached for ${clientId}, waiting ${waitTime}ms`);
      await this.delay(waitTime);
      limiter.requests = 0;
      limiter.resetTime = now + rateLimit.period;
    }
    
    limiter.requests++;
  }

  // Utility delay function
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Initialize all API connections
  async initializeConnections() {
    console.log('🔗 Initializing enterprise API connections...');
    
    try {
      // Connect to Citi Financial API
      if (process.env.CITI_FINANCIAL_API_URL) {
        await this.connectToFinancialAPI();
      }

      // Connect to SharePoint
      if (process.env.SHAREPOINT_SITE_URL) {
        await this.connectToSharePoint();
      }

      console.log('✅ Enterprise API connections initialized');
    } catch (error) {
      console.warn('⚠️ Some API connections failed, will use fallback data');
    }
  }

  // Create fallback budget data
  createFallbackBudgetData() {
    return {
      data: [
        {
          svp_name: 'Maria Rodriguez',
          department: 'Technology',
          allocated_budget: 5000000,
          spent_amount: 3500000,
          remaining_budget: 1500000,
          utilization_rate: 70,
          projects_count: 8
        },
        {
          svp_name: 'James Chen',
          department: 'Operations',
          allocated_budget: 3000000,
          spent_amount: 2100000,
          remaining_budget: 900000,
          utilization_rate: 70,
          projects_count: 5
        }
      ],
      metadata: {
        source: 'fallback',
        timestamp: new Date(),
        region: 'LATAM'
      }
    };
  }

  // Create fallback project data
  createFallbackProjectData() {
    return [
      {
        project_id: 'PROJ001',
        project_name: 'BCRA Compliance Update',
        status: 'active',
        progress_percent: 75,
        budget_allocated: 200000,
        budget_spent: 150000,
        owner: 'Maria Rodriguez',
        risk_level: 'medium'
      },
      {
        project_id: 'PROJ002',
        project_name: 'KYC Enhancement',
        status: 'at_risk',
        progress_percent: 45,
        budget_allocated: 180000,
        budget_spent: 120000,
        owner: 'Carlos Santos',
        risk_level: 'high'
      }
    ];
  }

  // Health check for all API connections
  async healthCheck() {
    const health = {
      citi_financial_api: false,
      sharepoint_api: false,
      timestamp: new Date()
    };

    // Check Citi Financial API
    try {
      const client = this.apiClients.get('citi-financial-api');
      if (client) {
        await client.get('/health');
        health.citi_financial_api = true;
      }
    } catch (error) {
      console.warn('Citi Financial API health check failed:', error.message);
    }

    // Check SharePoint API
    try {
      const client = this.apiClients.get('sharepoint-api');
      if (client) {
        await client.get('/_api/web');
        health.sharepoint_api = true;
      }
    } catch (error) {
      console.warn('SharePoint API health check failed:', error.message);
    }

    return health;
  }

  // Close all connections and clear tokens
  async closeConnections() {
    console.log('🔗 Closing enterprise API connections...');
    
    this.apiClients.clear();
    this.authTokens.clear();
    this.rateLimiters.clear();
    
    console.log('✅ API connections closed');
  }
}

module.exports = EnterpriseAPIConnector;
