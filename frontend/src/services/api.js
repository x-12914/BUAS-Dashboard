// api.js - API service for backend communication
const API_BASE_URL = 'http://localhost:8000';

class ApiService {
  constructor(baseURL = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} - ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Dashboard data endpoints
  async getDashboardData() {
    return this.request('/api/dashboard-data');
  }

  async getDashboardStats() {
    return this.request('/api/dashboard/stats');
  }

  // User endpoints
  async getUsers() {
    return this.request('/api/users');
  }

  async startListening(userId) {
    return this.request(`/api/start-listening/${userId}`, {
      method: 'POST',
    });
  }

  async stopListening(userId) {
    return this.request(`/api/stop-listening/${userId}`, {
      method: 'POST',
    });
  }

  // Session endpoints
  async getActiveSessions() {
    return this.request('/api/sessions/active');
  }

  async endSession(sessionId) {
    return this.request(`/api/sessions/${sessionId}/end`, {
      method: 'POST',
    });
  }

  // Recording endpoints
  async getRecentRecordings(limit = 10) {
    return this.request(`/api/recordings/recent?limit=${limit}`);
  }

  async getLatestAudio(userId) {
    return this.request(`/api/audio/${userId}/latest`);
  }

  // Analytics endpoints
  async getHourlyActivity() {
    return this.request('/api/analytics/hourly-activity');
  }

  // Health check
  async getHealth() {
    return this.request('/health');
  }

  // Upload recording
  async uploadRecording(userId, audioFile) {
    const formData = new FormData();
    formData.append('user_id', userId);
    formData.append('audio_file', audioFile);

    return this.request('/api/upload-recording', {
      method: 'POST',
      headers: {}, // Let browser set Content-Type for FormData
      body: formData,
    });
  }
}

// Create and export singleton instance
const apiService = new ApiService();

export default apiService;

// Named exports for specific functions
export const {
  getDashboardData,
  getDashboardStats,
  getUsers,
  startListening,
  stopListening,
  getActiveSessions,
  endSession,
  getRecentRecordings,
  getLatestAudio,
  getHourlyActivity,
  getHealth,
  uploadRecording,
} = apiService;
