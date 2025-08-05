// api.js - Updated for Flask server integration
const API_BASE_URL = 'http://143.244.133.125:5000'; // Your Flask VPS server

// Basic Auth for Flask server
const AUTH_HEADER = 'Basic ' + btoa('admin:supersecret');

class ApiService {
  constructor(baseURL = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  // Generic request method with Flask auth
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': AUTH_HEADER, // Flask basic auth
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

  // Dashboard data endpoints - Map to Flask routes
  async getDashboardData() {
    // Map Flask /dashboard/data to expected dashboard format
    try {
      const flaskData = await this.request('/dashboard/data');
      
      // Transform Flask data to dashboard format
      return this.transformFlaskData(flaskData);
    } catch (error) {
      // Return fallback data if Flask server is down
      return this.getFallbackData();
    }
  }

  // Transform Flask upload data to dashboard user format
  transformFlaskData(flaskData) {
    const now = new Date().toISOString();
    
    // Group uploads by device_id to create "users"
    const deviceMap = new Map();
    
    flaskData.forEach(upload => {
      const deviceId = upload.device_id;
      if (!deviceMap.has(deviceId)) {
        deviceMap.set(deviceId, {
          user_id: deviceId,
          status: "idle", // Default status
          location: {
            lat: 6.5244, // Default Lagos coordinates
            lng: 3.3792
          },
          session_start: null,
          current_session_id: null,
          latest_audio: `/uploads/${upload.audio_file}`,
          phone_number: `+234${deviceId}`,
          device_info: `Device-${deviceId}`,
          uploads: []
        });
      }
      
      const device = deviceMap.get(deviceId);
      device.uploads.push(upload);
      
      // Use most recent upload timestamp
      if (!device.last_activity || new Date(upload.timestamp) > new Date(device.last_activity)) {
        device.last_activity = upload.timestamp;
      }
    });

    const users = Array.from(deviceMap.values());
    
    return {
      active_sessions_count: users.filter(u => u.status === "listening").length,
      total_users: users.length,
      connection_status: "connected",
      users: users,
      active_sessions: [], // No active sessions concept in Flask server
      stats: {
        total_users: users.length,
        active_sessions: 0,
        total_recordings: flaskData.length,
        online_users: users.length
      },
      last_updated: now
    };
  }

  // Fallback data when Flask server is unreachable
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

  // Mock implementations for unsupported Flask features
  async startListening(userId) {
    // Flask doesn't have session concept, return mock response
    return {
      status: "success",
      message: `Started monitoring device ${userId}`,
      session_id: `mock_${userId}_${Date.now()}`,
      user_id: userId,
      location: { lat: 6.5244, lng: 3.3792, source: "mock" }
    };
  }

  async stopListening(userId) {
    // Flask doesn't have session concept, return mock response
    return {
      status: "success",
      message: `Stopped monitoring device ${userId}`,
      session_id: `mock_${userId}_${Date.now()}`,
      duration_minutes: 0
    };
  }

  async getLatestAudio(userId) {
    // Try to get latest upload for this device
    try {
      const flaskData = await this.request('/dashboard/data');
      const deviceUploads = flaskData.filter(u => u.device_id === userId);
      
      if (deviceUploads.length > 0) {
        const latest = deviceUploads[0]; // Already ordered by timestamp desc
        return {
          user_id: userId,
          audio_url: `${this.baseURL}/uploads/${latest.audio_file}`,
          duration: 0, // Not available in Flask data
          recorded_at: latest.timestamp,
          file_size: 0 // Not available in Flask data
        };
      } else {
        throw new Error("No audio found");
      }
    } catch (error) {
      throw new Error("No audio found for this device");
    }
  }

  // Other required methods (mock implementations)
  async getUsers() {
    const dashboardData = await this.getDashboardData();
    return { users: dashboardData.users };
  }

  async getActiveSessions() {
    return { active_sessions: [] }; // Flask doesn't have sessions
  }

  async getDashboardStats() {
    const dashboardData = await this.getDashboardData();
    return dashboardData.stats;
  }

  async getRecentRecordings(limit = 10) {
    try {
      const flaskData = await this.request('/dashboard/data');
      const recordings = flaskData.slice(0, limit).map((upload, index) => ({
        id: `rec_${upload.device_id}_${index}`,
        user_id: upload.device_id,
        filename: upload.audio_file,
        duration: 0, // Not available
        created_at: upload.timestamp,
        file_size: 0 // Not available
      }));
      
      return {
        recordings: recordings,
        total: recordings.length,
        limit: limit
      };
    } catch (error) {
      return { recordings: [], total: 0, limit: limit };
    }
  }

  async getHealth() {
    try {
      // Test Flask server connectivity
      await this.request('/dashboard/data');
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

  // Mock analytics endpoints
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

  // File upload to Flask server
  async uploadRecording(userId, audioFile) {
    const formData = new FormData();
    formData.append('file', audioFile);

    return this.request(`/upload/audio/${userId}`, {
      method: 'POST',
      headers: {
        'Authorization': AUTH_HEADER
        // Don't set Content-Type, let browser handle FormData
      },
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
  getRecentRecordings,
  getLatestAudio,
  getHourlyActivity,
  getHealth,
  uploadRecording,
} = apiService;