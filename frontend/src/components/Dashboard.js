// Dashboard.js
import React, { useState, useEffect } from 'react';
import StatusBar from './StatusBar';
import UserList from './UserList';
import MapView from './MapView';
import AudioPlayer from './AudioPlayer';
import ConnectionStatus from './ConnectionStatus';
import ApiService from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [audioPlayer, setAudioPlayer] = useState({
    isVisible: false,
    audioUrl: null,
    userID: null
  });

  // Dashboard data state
  const [dashboardData, setDashboardData] = useState({
    active_sessions_count: 0,
    total_users: 0,
    connection_status: 'connecting',
    users: [],
    active_sessions: [],
    stats: {},
    last_updated: null
  });
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const apiService = new ApiService();

  // Polling logic using API service
  useEffect(() => {
    let pollInterval;
    let isActive = true;

    const fetchDashboardData = async () => {
      if (!isActive) return;
      
      try {
        setDashboardError(null);
        const data = await apiService.getDashboardData();
        
        if (isActive) {
          setDashboardData({
            active_sessions_count: data.active_sessions_count || 0,
            total_users: data.total_users || 0,
            connection_status: data.connection_status || 'connected',
            users: data.users || [],
            active_sessions: data.active_sessions || [],
            stats: data.stats || {},
            last_updated: data.last_updated
          });
          setDashboardLoading(false);
          setIsConnected(true);
          setLastUpdated(new Date().toISOString());
          setRetryCount(0);
        }
      } catch (error) {
        console.error('Dashboard polling error:', error);
        if (isActive) {
          setDashboardError(error.message);
          setIsConnected(false);
          setRetryCount(prev => prev + 1);
        }
      }
    };

    const startPolling = () => {
      setIsPolling(true);
      fetchDashboardData(); // Initial fetch
      pollInterval = setInterval(fetchDashboardData, 2000); // Poll every 2 seconds
    };

    const stopPolling = () => {
      setIsPolling(false);
      if (pollInterval) {
        clearInterval(pollInterval);
        pollInterval = null;
      }
    };

    // Start polling on mount
    startPolling();

    // Cleanup on unmount
    return () => {
      isActive = false;
      stopPolling();
    };
  }, []);

  const handleTogglePolling = () => {
    // This will need to be implemented if you want manual control
    console.log('Polling toggle clicked');
  };

  const startPolling = () => {
    // This will be handled by useEffect
  };

  const stopPolling = () => {
    // This will be handled by useEffect
  };

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
          <span>Backend: Flask + FastAPI</span>
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
