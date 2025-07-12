// API client functions for dashboard data

const API_BASE_URL = 'http://localhost:5050/api';

async function apiRequest(endpoint: string, options?: RequestInit) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// Dashboard API
export const dashboardApi = {
  getSummary: () => apiRequest('/dashboard'),
  getSVPPerformance: () => apiRequest('/dashboard/svp-performance'),
};

// Budget API
export const budgetApi = {
  getOverview: () => apiRequest('/budget/overview'),
  getBySVP: () => apiRequest('/budget/by-svp'),
  getSources: () => apiRequest('/budget/sources'),
};

// Projects API
export const projectsApi = {
  getAll: () => apiRequest('/projects'),
  getById: (id: string) => apiRequest(`/projects/${id}`),
};

// Compliance API
export const complianceApi = {
  getKPIs: () => apiRequest('/compliance/kpis'),
  getAll: () => apiRequest('/compliance'),
};

// Activities API
export const activitiesApi = {
  getAll: () => apiRequest('/activities'),
  getByPriority: (priority: string) => apiRequest(`/activities?priority=${priority}`),
};

// Risk API
export const riskApi = {
  getSummary: () => apiRequest('/risk'),
  getAll: () => apiRequest('/risk'),
};

// Chatbot API
export const chatbotApi = {
  sendMessage: (message: string, conversationId?: string) => 
    apiRequest('/chatbot/chat', {
      method: 'POST',
      body: JSON.stringify({ message, conversationId }),
    }),
};
