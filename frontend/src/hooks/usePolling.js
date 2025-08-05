// usePolling.js - Enhanced custom hook for data fetching with real-time polling
import { useState, useEffect, useCallback, useRef } from 'react';

const usePolling = (url, interval = 2000, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPolling, setIsPolling] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [isConnected, setIsConnected] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  
  const intervalRef = useRef(null);
  const retryTimeoutRef = useRef(null);
  const { 
    immediate = true, 
    onSuccess,
    onError,
    transform,
    maxRetries = 5,
    retryDelay = 1000
  } = options;

  const fetchData = useCallback(async (isRetry = false) => {
    try {
      if (!isRetry) {
        setError(null);
      }
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      const finalData = transform ? transform(result) : result;
      
      setData(finalData);
      setLoading(false);
      setIsConnected(true);
      setRetryCount(0);
      setLastUpdated(new Date().toISOString());
      
      if (onSuccess) {
        onSuccess(finalData);
      }
    } catch (err) {
      console.error('Polling error:', err);
      setError(err.message);
      setLoading(false);
      setIsConnected(false);
      
      // Implement retry logic
      if (retryCount < maxRetries) {
        setRetryCount(prev => prev + 1);
        retryTimeoutRef.current = setTimeout(() => {
          fetchData(true);
        }, retryDelay * Math.pow(2, retryCount)); // Exponential backoff
      }
      
      if (onError) {
        onError(err);
      }
    }
  }, [url, transform, onSuccess, onError, retryCount, maxRetries, retryDelay]);

  // Start polling
  const startPolling = useCallback(() => {
    if (intervalRef.current) return;
    
    setIsPolling(true);
    
    // Fetch immediately if requested
    if (immediate) {
      fetchData();
    }
    
    // Set up interval
    intervalRef.current = setInterval(fetchData, interval);
  }, [fetchData, interval, immediate]);

  // Stop polling
  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
    setIsPolling(false);
  }, []);

  // Refresh data manually
  const refresh = useCallback(() => {
    setRetryCount(0);
    fetchData();
  }, [fetchData]);

  // Auto-start polling on mount
  useEffect(() => {
    startPolling();
    
    // Cleanup on unmount
    return () => {
      stopPolling();
    };
  }, [startPolling, stopPolling]);

  return {
    data,
    loading,
    error,
    isPolling,
    isConnected,
    lastUpdated,
    retryCount,
    startPolling,
    stopPolling,
    refresh,
    setData // Allow manual data updates
  };
};

export default usePolling;
