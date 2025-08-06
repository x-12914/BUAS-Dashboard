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
    transform,
    onSuccess,
    onError,
    maxRetries = 5,
    retryDelay = 1000
  } = options;

  const fetchData = useCallback(async (isRetry = false) => {
    try {
      if (!isRetry) setError(null);
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(url, {
        signal: controller.signal,
        headers: { 'Cache-Control': 'no-cache' }
      });

      clearTimeout(timeout);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const result = await response.json();
      const finalData = transform ? transform(result) : result;

      setData(finalData);
      setLoading(false);
      setIsConnected(true);
      setRetryCount(0);
      setLastUpdated(new Date().toISOString());
      onSuccess?.(finalData);
    } catch (err) {
      setError(err.message);
      setLoading(false);
      setIsConnected(false);
      if (retryCount < maxRetries) {
        setRetryCount(prev => prev + 1);
        retryTimeoutRef.current = setTimeout(() => {
          fetchData(true);
        }, retryDelay * Math.pow(2, retryCount));
      }
      onError?.(err);
    }
  }, [url, transform, onSuccess, onError, retryCount, maxRetries, retryDelay]);

  const startPolling = useCallback(() => {
    if (intervalRef.current) return;
    setIsPolling(true);
    if (immediate) fetchData();
    intervalRef.current = setInterval(fetchData, interval);
  }, [fetchData, interval, immediate]);

  const stopPolling = useCallback(() => {
    clearInterval(intervalRef.current);
    clearTimeout(retryTimeoutRef.current);
    intervalRef.current = null;
    retryTimeoutRef.current = null;
    setIsPolling(false);
  }, []);

  const refresh = useCallback(() => {
    setRetryCount(0);
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    startPolling();
    return stopPolling;
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
    setData
  };
};

export default usePolling;
