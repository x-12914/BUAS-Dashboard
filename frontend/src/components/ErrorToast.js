import React, { useState, useEffect } from 'react';
import './ErrorToast.css';

const ErrorToast = ({ 
  message, 
  type = 'error', 
  isVisible = false, 
  onClose,
  autoClose = true,
  duration = 5000 
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      if (onClose) onClose();
    }, 300);
  };

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      
      if (autoClose) {
        const timer = setTimeout(() => {
          handleClose();
        }, duration);
        
        return () => clearTimeout(timer);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible, autoClose, duration]);

  const getToastConfig = () => {
    const configs = {
      error: {
        icon: '❌',
        className: 'error',
        title: 'Error'
      },
      success: {
        icon: '✅',
        className: 'success',
        title: 'Success'
      },
      warning: {
        icon: '⚠️',
        className: 'warning',
        title: 'Warning'
      },
      info: {
        icon: 'ℹ️',
        className: 'info',
        title: 'Info'
      }
    };
    
    return configs[type] || configs.error;
  };

  if (!isVisible) return null;

  const config = getToastConfig();

  return (
    <div className={`error-toast ${config.className} ${isAnimating ? 'show' : 'hide'}`}>
      <div className="toast-content">
        <div className="toast-icon">{config.icon}</div>
        <div className="toast-text">
          <div className="toast-title">{config.title}</div>
          <div className="toast-message">{message}</div>
        </div>
        <button className="toast-close" onClick={handleClose}>
          ✕
        </button>
      </div>
      
      {autoClose && (
        <div className="toast-progress">
          <div 
            className="toast-progress-bar"
            style={{ 
              animation: `progress ${duration}ms linear` 
            }}
          ></div>
        </div>
      )}
    </div>
  );
};

export default ErrorToast;
