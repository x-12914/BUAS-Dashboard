// api.js - Updated for Flask server with /api routes
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://143.244.133.125:5000'; // Flask server on port 5000

const AUTH_HEADER = 'Basic ' + btoa('admin:supersecret');

class ApiService {
  constructor(baseURL = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': AUTH_HEADER,
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

  async getDashboardData() {
    try {
      const flaskData = await this.request('/api/dashboard-data');
      // Flask server returns data in the correct format already
      return flaskData;
    } catch (error) {
      console.error('Dashboard data fetch failed:', error);
      return this.getFallbackData();
    }
  }

  // Keep this method for fallback scenarios
  transformFlaskData(flaskData) {
    // This method is no longer needed as Flask returns the correct format
    // But keeping it for compatibility
    return flaskData;
  }

  getFallbackData() {
    return {
      active_sessions_count: 0,
      total_users: 0,
      connection_status: "disconnected",
      users: [],
      active_sessions: [],
      stats: {
        total_users: 0,
        active_sessions: 0,
        total_recordings: 0,
        online_users: 0
      },
      last_updated: new Date().toISOString()
    };
  }

  async startListening(userId) {
    return {
      status: "success",
      message: `Started monitoring device ${userId}`,
      session_id: `mock_${userId}_${Date.now()}`,
      user_id: userId,
      location: { lat: 6.5244, lng: 3.3792, source: "mock" }
    };
  }

  async stopListening(userId) {
    return {
      status: "success",
      message: `Stopped monitoring device ${userId}`,
      session_id: `mock_${userId}_${Date.now()}`,
      duration_minutes: 0
    };
  }

  async getLatestAudio(userId) {
    try {
      const flaskData = await this.request('/api/dashboard-data');
      const deviceUploads = flaskData.filter(u => u.device_id === userId);

      if (deviceUploads.length > 0) {
        const latest = deviceUploads[0];
        return {
          user_id: userId,
          audio_url: `${this.baseURL}/api/uploads/${latest.audio_file}`,
          duration: 0,
          recorded_at: latest.timestamp,
          file_size: 0
        };
      } else {
        throw new Error("No audio found");
      }
    } catch (error) {
      throw new Error("No audio found for this device");
    }
  }

  async getUsers() {
    const dashboardData = await this.getDashboardData();
    return { users: dashboardData.users };
  }

  async getActiveSessions() {
    return { active_sessions: [] };
  }

  async getDashboardStats() {
    const dashboardData = await this.getDashboardData();
    return dashboardData.stats;
  }

  async getRecentRecordings(limit = 10) {
    try {
      const flaskData = await this.request('/api/dashboard-data');
      const recordings = flaskData.slice(0, limit).map((upload, index) => ({
        id: `rec_${upload.device_id}_${index}`,
        user_id: upload.device_id,
        filename: upload.audio_file,
        duration: 0,
        created_at: upload.timestamp,
        file_size: 0
      }));
      return { recordings, total: recordings.length, limit };
    } catch (error) {
      return { recordings: [], total: 0, limit };
    }
  }

  async getHealth() {
    try {
      await this.request('/api/health');
      return {
        status: "healthy",
        timestamp: new Date().toISOString(),
        version: "1.0.0"
      };
    } catch (error) {
      return {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: error.message
      };
    }
  }

  async getHourlyActivity() {
    const hours = [];
    const activity = [];
    const currentHour = new Date().getHours();

    for (let i = 0; i < 24; i++) {
      const hour = (currentHour - 23 + i) % 24;
      hours.push(`${hour.toString().padStart(2, '0')}:00`);
      activity.push(Math.floor(Math.random() * 10) + 1);
    }

    return {
      labels: hours,
      data: activity,
      total_today: activity.reduce((a, b) => a + b, 0),
      peak_hour: hours[activity.indexOf(Math.max(...activity))],
      last_updated: new Date().toISOString()
    };
  }

  async uploadRecording(userId, audioFile) {
    const formData = new FormData();
    formData.append('file', audioFile);

    return this.request(`/api/upload/audio/${userId}`, {
      method: 'POST',
      headers: {
        'Authorization': AUTH_HEADER
      },
      body: formData
    });
  }
}

const apiService = new ApiService();

export default apiService;

export const {
  getDashboardData,
  getDashboardStats,
  getUsers,
  startListening,
  stopListening,
  getActiveSessions,
  getRecentRecordings,
  getLatestAudio,
  getHourlyActivity,
  getHealth,
  uploadRecording,
} = apiService;
