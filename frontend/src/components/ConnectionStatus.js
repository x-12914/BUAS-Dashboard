import React, { useState } from 'react';
import './ConnectionStatus.css';

const ConnectionStatus = ({ isConnected, lastUpdated, retryCount = 0 }) => {
  const [showDetails, setShowDetails] = useState(false);
  
  const getStatusInfo = () => {
    if (isConnected) {
      return {
        icon: '🟢',
        text: 'Connected',
        className: 'connected',
        description: 'Real-time updates active'
      };
    } else {
      return {
        icon: '🔴',
        text: 'Disconnected',
        className: 'disconnected',
        description: retryCount > 0 ? `Retrying... (${retryCount})` : 'Connection lost'
      };
    }
  };

  const formatLastUpdated = (timestamp) => {
    if (!timestamp) return 'Never';
    
    const now = new Date();
    const updateTime = new Date(timestamp);
    const diffSeconds = Math.floor((now - updateTime) / 1000);
    
    if (diffSeconds < 10) return 'Just now';
    if (diffSeconds < 60) return `${diffSeconds}s ago`;
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
    return updateTime.toLocaleTimeString();
  };

  const status = getStatusInfo();

  return (
    <div className={`connection-status ${status.className}`}>
      <div className="status-indicator" onClick={() => setShowDetails(!showDetails)}>
        <span className="status-icon">{status.icon}</span>
        <span className="status-text">{status.text}</span>
        <span className="status-toggle">{showDetails ? '▼' : '▶'}</span>
      </div>
      
      {showDetails && (
        <div className="status-details">
          <div className="status-row">
            <span className="label">Status:</span>
            <span className="value">{status.description}</span>
          </div>
          <div className="status-row">
            <span className="label">Last Update:</span>
            <span className="value">{formatLastUpdated(lastUpdated)}</span>
          </div>
          {retryCount > 0 && (
            <div className="status-row">
              <span className="label">Retry Attempts:</span>
              <span className="value">{retryCount}</span>
            </div>
          )}
          <div className="status-row">
            <span className="label">Polling:</span>
            <span className="value">Every 2 seconds</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConnectionStatus;
