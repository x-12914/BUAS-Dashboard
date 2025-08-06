// Dashboard.js
import React, { useState } from 'react';
import StatusBar from './StatusBar';
import UserList from './UserList';
import MapView from './MapView';
import AudioPlayer from './AudioPlayer';
import ConnectionStatus from './ConnectionStatus';
import usePolling from '../hooks/usePolling';
import './Dashboard.css';

const Dashboard = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [audioPlayer, setAudioPlayer] = useState({
    isVisible: false,
    audioUrl: null,
    userID: null
  });

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
    transform: (data) => ({
      active_sessions_count: data.active_sessions_count || 0,
      total_users: data.total_users || 0,
      connection_status: data.connection_status || 'connecting',
      users: data.users || [],
      active_sessions: data.active_sessions || [],
      stats: data.stats || {},
      last_updated: data.last_updated
    }),
    onError: (error) => console.error('Dashboard polling error:', error),
    maxRetries: 5,
    retryDelay: 1000
  });

  const handlePlayAudio = async (userID) => {
    try {
      const audioUrl = `/api/audio/${userID}/latest`;
      setAudioPlayer({ isVisible: true, audioUrl, userID });
    } catch (error) {
      console.error('Error loading audio:', error);
    }
  };

  const handleCloseAudio = () => {
    setAudioPlayer({ isVisible: false, audioUrl: null, userID: null });
  };

  const handleTogglePolling = () => {
    isPolling ? stopPolling() : startPolling();
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
        activeSessionsCount={dashboardData?.active_sessions_count}
        totalUsers={dashboardData?.total_users}
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
            users={dashboardData?.users}
            loading={dashboardLoading}
            onPlayAudio={handlePlayAudio}
            selectedUser={selectedUser}
            onUserSelect={setSelectedUser}
          />
          <MapView
            users={dashboardData?.users}
            onUserSelect={setSelectedUser}
            selectedUser={selectedUser}
            isLoading={dashboardLoading}
          />
        </div>
      </div>

      <div className="dashboard-footer">
        <div className="footer-info">
          <span>🎉 Enhanced Dashboard</span>
          <span>•</span>
          <span>Backend: Flask</span>
          <span>•</span>
          <span>Frontend: React</span>
          <span>•</span>
          <span>Real-time updates every 2 seconds</span>
        </div>
      </div>

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
