import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import './MapView.css';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom icons for different user states
const createCustomIcon = (status) => {
  const color = status === 'listening' ? '#dc2626' : 
                status === 'idle' ? '#6b7280' : '#ef4444';
  
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        position: relative;
      ">
        ${status === 'listening' ? 
          '<div style="position: absolute; top: -2px; left: -2px; width: 24px; height: 24px; border: 2px solid #dc2626; border-radius: 50%; animation: pulse 2s infinite;"></div>' : 
          ''
        }
      </div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10]
  });
};

// Component to update map view when users change
const MapUpdater = ({ users, selectedUser }) => {
  const map = useMap();

  useEffect(() => {
    if (selectedUser && users.length > 0) {
      const user = users.find(u => u.user_id === selectedUser);
      if (user && user.location) {
        map.setView([user.location.lat, user.location.lng], 15);
      }
    } else if (users.length > 0) {
      // Fit map to show all users
      const validLocations = users
        .filter(user => user.location && user.location.lat && user.location.lng)
        .map(user => [user.location.lat, user.location.lng]);
      
      if (validLocations.length > 0) {
        const bounds = L.latLngBounds(validLocations);
        map.fitBounds(bounds, { padding: [20, 20] });
      }
    }
  }, [map, users, selectedUser]);

  return null;
};

const MapView = ({ users = [], onUserSelect, selectedUser, isLoading }) => {
  const [mapCenter] = useState([6.5244, 3.3792]); // Lagos, Nigeria default
  const [mapZoom] = useState(10);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Filter users with valid locations
  const usersWithLocations = users.filter(user => 
    user.location && 
    user.location.lat && 
    user.location.lng &&
    !isNaN(user.location.lat) && 
    !isNaN(user.location.lng)
  );

  const handleMarkerClick = (user) => {
    if (onUserSelect) {
      onUserSelect(user.user_id);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'listening': return 'Currently Listening';
      case 'idle': return 'Idle';
      case 'offline': return 'Offline';
      default: return 'Unknown';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'listening': return '#dc2626';
      case 'idle': return '#6b7280';
      case 'offline': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <div className={`map-container ${isFullscreen ? 'fullscreen' : ''}`}>
      <div className="map-header">
        <h3>User Locations</h3>
        <div className="map-controls">
          <div className="map-legend">
            <div className="legend-item">
              <div className="legend-dot listening"></div>
              <span>Listening</span>
            </div>
            <div className="legend-item">
              <div className="legend-dot idle"></div>
              <span>Idle</span>
            </div>
            <div className="legend-item">
              <div className="legend-dot offline"></div>
              <span>Offline</span>
            </div>
          </div>
          <button 
            className="fullscreen-btn"
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? '📉' : '📈'}
          </button>
        </div>
      </div>

      <div className="map-wrapper">
        {isLoading && (
          <div className="map-loading">
            <div className="loading-spinner"></div>
            <span>Loading locations...</span>
          </div>
        )}

        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          className="leaflet-map"
          zoomControl={true}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <MapUpdater users={usersWithLocations} selectedUser={selectedUser} />

          {usersWithLocations.map((user) => (
            <Marker
              key={user.user_id}
              position={[user.location.lat, user.location.lng]}
              icon={createCustomIcon(user.status)}
              eventHandlers={{
                click: () => handleMarkerClick(user)
              }}
            >
              <Popup>
                <div className="map-popup">
                  <div className="popup-header">
                    <h4>{user.user_id}</h4>
                    <span 
                      className={`status-badge ${user.status}`}
                      style={{ backgroundColor: getStatusColor(user.status) }}
                    >
                      {getStatusText(user.status)}
                    </span>
                  </div>
                  <div className="popup-content">
                    <div className="popup-info">
                      <strong>Location:</strong> {user.location.lat.toFixed(4)}, {user.location.lng.toFixed(4)}
                    </div>
                    {user.session_start && (
                      <div className="popup-info">
                        <strong>Session Start:</strong> {new Date(user.session_start).toLocaleTimeString()}
                      </div>
                    )}
                    {user.last_activity && (
                      <div className="popup-info">
                        <strong>Last Activity:</strong> {new Date(user.last_activity).toLocaleTimeString()}
                      </div>
                    )}
                  </div>
                  <div className="popup-actions">
                    <button 
                      className="popup-btn select-btn"
                      onClick={() => handleMarkerClick(user)}
                    >
                      Select User
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <div className="map-stats">
        <div className="stat-item">
          <span className="stat-label">Total Users:</span>
          <span className="stat-value">{users.length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">With Locations:</span>
          <span className="stat-value">{usersWithLocations.length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Currently Listening:</span>
          <span className="stat-value listening">
            {users.filter(u => u.status === 'listening').length}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MapView;
