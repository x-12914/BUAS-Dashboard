// StatusBar.js - Active sessions counter and connection status
import React from 'react';
import './StatusBar.css';

const StatusBar = ({ 
  activeSessionsCount = 0, 
  totalUsers = 0, 
  connectionStatus = 'connecting',
  lastUpdated = null 
}) => {
  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return '🟢';
      case 'error':
        return '🔴';
      case 'connecting':
        return '🟡';
      default:
        return '⚪';
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Connected';
      case 'error':
        return 'Connection Error';
      case 'connecting':
        return 'Connecting...';
      default:
        return 'Unknown Status';
    }
  };

  const formatLastUpdated = () => {
    if (!lastUpdated) return '';
    const date = new Date(lastUpdated);
    return date.toLocaleTimeString();
  };

  return (
    <div className="status-bar">
      <div className="status-left">
        <div className="status-item">
          <span className="status-icon active">🔴</span>
          <span className="status-text">
            Active Sessions: <strong>{activeSessionsCount}</strong>
          </span>
        </div>
        
        <div className="status-item">
          <span className="status-icon users">👥</span>
          <span className="status-text">
            Total Users: <strong>{totalUsers}</strong>
          </span>
        </div>
      </div>

      <div className="status-right">
        <div className="status-item">
          <span className="status-icon connection">
            {getStatusIcon()}
          </span>
          <span className={`status-text connection-${connectionStatus}`}>
            {getStatusText()}
          </span>
        </div>
        
        {lastUpdated && (
          <div className="status-item last-updated">
            <span className="update-time">
              Last updated: {formatLastUpdated()}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatusBar;
