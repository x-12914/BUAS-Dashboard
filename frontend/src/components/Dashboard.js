// Dashboard.js - Enhanced main dashboard component with Day 4 features
import React, { useState } from 'react';
import StatusBar from './StatusBar';
import UserList from './UserList';
import MapView from './MapView';
import AudioPlayer from './AudioPlayer';
import ConnectionStatus from './ConnectionStatus';
import usePolling from '../hooks/usePolling';
import './Dashboard.css';

const Dashboard = () => {
  // UI state management
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Audio player state
  const [audioPlayer, setAudioPlayer] = useState({
    isVisible: false,
    audioUrl: null,
    userID: null
  });

  // Real-time polling for dashboard data with enhanced connection monitoring
  const {
    data: dashboardData,
    loading: dashboardLoading,
    error: dashboardError,
    isPolling,
    isConnected,
    lastUpdated,
    retryCount,
    startPolling,
    stopPolling
  } = usePolling('/api/dashboard-data', 2000, {
    transform: (data) => {
      // Ensure we have default values
      return {
        active_sessions_count: data.active_sessions_count || 0,
        total_users: data.total_users || 0,
        connection_status: data.connection_status || 'connecting',
        users: data.users || [],
        active_sessions: data.active_sessions || [],
        stats: data.stats || {},
        last_updated: data.last_updated
      };
    },
    onError: (error) => {
      console.error('Dashboard polling error:', error);
    },
    maxRetries: 5,
    retryDelay: 1000
  });

  // Audio player handlers
  const handlePlayAudio = async (userID) => {
    try {
      const audioUrl = `http://localhost:8000/api/audio/${userID}/latest`;
      setAudioPlayer({
        isVisible: true,
        audioUrl: audioUrl,
        userID: userID
      });
    } catch (error) {
      console.error('Error loading audio:', error);
    }
  };

  const handleCloseAudio = () => {
    setAudioPlayer({
      isVisible: false,
      audioUrl: null,
      userID: null
    });
  };

  const handleTogglePolling = () => {
    if (isPolling) {
      stopPolling();
    } else {
      startPolling();
    }
  };

  const getConnectionStatus = () => {
    if (dashboardError) return 'error';
    if (dashboardLoading && !dashboardData) return 'connecting';
    return dashboardData?.connection_status || 'connected';
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>📱 Phone Monitoring Dashboard</h1>
        <div className="dashboard-controls">
          <button 
            className={`polling-toggle ${isPolling ? 'active' : 'inactive'}`}
            onClick={handleTogglePolling}
            title={isPolling ? 'Stop Real-time Updates' : 'Start Real-time Updates'}
          >
            {isPolling ? '⏸️ Pause' : '▶️ Resume'}
          </button>
          <div className="polling-indicator">
            <div className={`indicator-dot ${isPolling ? 'active' : 'inactive'}`}></div>
            <span>Live Updates</span>
          </div>
        </div>
      </div>

      <StatusBar
        activeSessionsCount={dashboardData?.active_sessions_count || 0}
        totalUsers={dashboardData?.total_users || 0}
        connectionStatus={getConnectionStatus()}
        lastUpdated={dashboardData?.last_updated}
      />

      <ConnectionStatus 
        isConnected={isConnected}
        lastUpdated={lastUpdated}
        retryCount={retryCount}
      />

      <div className="dashboard-content">
        <div className="dashboard-main">
          <UserList 
            users={dashboardData?.users || []} 
            loading={dashboardLoading && !dashboardData}
            onPlayAudio={handlePlayAudio}
            selectedUser={selectedUser}
            onUserSelect={setSelectedUser}
          />
          
          <MapView 
            users={dashboardData?.users || []}
            onUserSelect={setSelectedUser}
            selectedUser={selectedUser}
            isLoading={dashboardLoading && !dashboardData}
          />
        </div>

        <div className="dashboard-sidebar">
          <div className="stats-card">
            <h3>📊 Quick Stats</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-value">
                  {dashboardData?.active_sessions_count || 0}
                </span>
                <span className="stat-label">Active Sessions</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">
                  {dashboardData?.total_users || 0}
                </span>
                <span className="stat-label">Total Users</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">
                  {dashboardData?.stats?.total_recordings || 0}
                </span>
                <span className="stat-label">Recordings</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">
                  {dashboardData?.users?.filter(u => u.status === 'listening').length || 0}
                </span>
                <span className="stat-label">Listening Now</span>
              </div>
            </div>
          </div>

          {dashboardData?.active_sessions && dashboardData.active_sessions.length > 0 && (
            <div className="sessions-card">
              <h3>🔴 Active Sessions</h3>
              <div className="sessions-list">
                {dashboardData.active_sessions.map((session) => (
                  <div key={session.session_id} className="session-item">
                    <div className="session-info">
                      <strong>{session.user_id}</strong>
                      <span className="session-duration">
                        {session.duration_minutes}m
                      </span>
                    </div>
                    <div className="session-time">
                      Started: {new Date(session.start_time).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {dashboardError && (
            <div className="error-card">
              <h3>⚠️ Connection Error</h3>
              <p>{dashboardError}</p>
              <button 
                className="retry-btn"
                onClick={() => window.location.reload()}
              >
                🔄 Retry Connection
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="dashboard-footer">
        <div className="footer-info">
          <span>🎉 Day 4: Complete Dashboard with Map Integration & Responsive Design</span>
          <span>•</span>
          <span>Backend: FastAPI on localhost:8000</span>
          <span>•</span>
          <span>Frontend: React with Enhanced UX</span>
          <span>•</span>
          <span>Real-time updates every 2 seconds</span>
        </div>
      </div>

      {/* Audio Player Modal */}
      <AudioPlayer
        audioUrl={audioPlayer.audioUrl}
        userID={audioPlayer.userID}
        isVisible={audioPlayer.isVisible}
        onClose={handleCloseAudio}
        autoPlay={true}
      />
    </div>
  );
};

export default Dashboard;
