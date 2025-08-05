import React, { useState, useRef, useEffect } from 'react';
import './AudioPlayer.css';

const AudioPlayer = ({ 
  audioUrl, 
  userID, 
  isVisible = false, 
  onClose,
  autoPlay = false 
}) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState('idle');

  // Reset state when audioUrl changes
  useEffect(() => {
    if (audioUrl) {
      setIsLoading(true);
      setError(null);
      setCurrentTime(0);
      setIsPlaying(false);
      setRetryCount(0);
      setConnectionStatus('connecting');
    }
  }, [audioUrl]);

  // Auto-play functionality
  useEffect(() => {
    if (autoPlay && audioUrl && audioRef.current) {
      const timer = setTimeout(() => {
        handlePlay();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [autoPlay, audioUrl]);

  const handleRetry = async () => {
    if (retryCount >= 3) {
      setError('Max retry attempts reached. Please try again later.');
      return;
    }
    
    setRetryCount(prev => prev + 1);
    setError(null);
    setIsLoading(true);
    setConnectionStatus('retrying');
    
    // Reload the audio element
    if (audioRef.current) {
      audioRef.current.load();
      try {
        await audioRef.current.play();
        setIsPlaying(true);
        setConnectionStatus('connected');
      } catch (err) {
        console.error('Retry failed:', err);
        setError(`Retry ${retryCount + 1} failed: ${err.message}`);
        setConnectionStatus('error');
      }
    }
    setIsLoading(false);
  };

  const handlePlay = async () => {
    if (!audioRef.current) return;
    
    try {
      setIsLoading(true);
      setConnectionStatus('connecting');
      await audioRef.current.play();
      setIsPlaying(true);
      setError(null);
      setConnectionStatus('connected');
    } catch (err) {
      console.error('Audio play error:', err);
      setError(`Failed to play audio: ${err.message}`);
      setIsPlaying(false);
      setConnectionStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setCurrentTime(0);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      setIsLoading(false);
    }
  };

  const handleSeek = (e) => {
    const progressBar = e.currentTarget;
    const clickX = e.nativeEvent.offsetX;
    const width = progressBar.offsetWidth;
    const newTime = (clickX / width) * duration;
    
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const formatTime = (time) => {
    if (isNaN(time)) return '00:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleError = () => {
    setError('Audio file could not be loaded');
    setIsLoading(false);
    setIsPlaying(false);
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  if (!isVisible || !audioUrl) {
    return null;
  }

  return (
    <div className="audio-player-overlay">
      <div className="audio-player">
        <div className="audio-player-header">
          <h3>🎵 Audio Player - User {userID}</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="audio-player-content">
          {error ? (
            <div className="audio-error">
              <span className="error-icon">⚠️</span>
              <p>{error}</p>
              <div className="error-actions">
                <button className="retry-btn" onClick={handleRetry}>
                  🔄 Retry ({retryCount}/3)
                </button>
                <button className="close-btn" onClick={onClose}>
                  ❌ Close
                </button>
              </div>
              {retryCount > 0 && (
                <div className="retry-info">
                  <small>Attempt {retryCount} of 3</small>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Connection Status */}
              <div className={`connection-indicator ${connectionStatus}`}>
                <span className="connection-dot"></span>
                <span className="connection-text">
                  {connectionStatus === 'connecting' && 'Connecting...'}
                  {connectionStatus === 'connected' && 'Connected'}
                  {connectionStatus === 'retrying' && 'Retrying...'}
                  {connectionStatus === 'error' && 'Connection Error'}
                  {connectionStatus === 'idle' && 'Ready'}
                </span>
              </div>

              {/* Hidden audio element */}
              <audio
                ref={audioRef}
                src={audioUrl}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onError={handleError}
                onEnded={handleEnded}
                preload="metadata"
              />

              {/* Progress Bar */}
              <div className="progress-container">
                <div className="time-display">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
                <div 
                  className="progress-bar" 
                  onClick={handleSeek}
                >
                  <div 
                    className="progress-fill"
                    style={{ 
                      width: duration ? `${(currentTime / duration) * 100}%` : '0%' 
                    }}
                  ></div>
                </div>
              </div>

              {/* Control Buttons */}
              <div className="audio-controls">
                <button
                  className="control-btn play-pause"
                  onClick={isPlaying ? handlePause : handlePlay}
                  disabled={isLoading}
                >
                  {isLoading ? '⏳' : isPlaying ? '⏸️' : '▶️'}
                </button>
                
                <button 
                  className="control-btn stop"
                  onClick={handleStop}
                  disabled={isLoading}
                >
                  ⏹️
                </button>

                <div className="volume-control">
                  <span>🔊</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="volume-slider"
                  />
                  <span>{Math.round(volume * 100)}%</span>
                </div>
              </div>

              {/* Audio Info */}
              <div className="audio-info">
                <p><strong>Source:</strong> Latest recording for User {userID}</p>
                <p><strong>Duration:</strong> {formatTime(duration)}</p>
                {isLoading && <p className="loading-text">Loading audio...</p>}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;
