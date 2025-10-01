import { useState, useEffect } from 'react';
import api from '../services/api';

const HealthCheck = () => {
  const [status, setStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkHealth = async () => {
    setStatus('checking');
    try {
      const response = await api.get('/test');
      if (response.status === 200) {
        setStatus('online');
      } else {
        setStatus('offline');
      }
    } catch (error) {
      console.error('Health check failed:', error);
      setStatus('offline');
    }
    setLastChecked(new Date());
  };

  useEffect(() => {
    checkHealth();
  }, []);

  const getStatusColor = () => {
    switch (status) {
      case 'online': return 'text-green-600';
      case 'offline': return 'text-red-600';
      case 'checking': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'online': return '✓ Backend Online';
      case 'offline': return '✗ Backend Offline';
      case 'checking': return '⏳ Checking...';
      default: return 'Unknown';
    }
  };

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className={getStatusColor()}>{getStatusText()}</span>
      {lastChecked && (
        <span className="text-gray-500">
          (Last checked: {lastChecked.toLocaleTimeString()})
        </span>
      )}
      <button
        onClick={checkHealth}
        className="text-blue-600 hover:text-blue-800 underline"
        disabled={status === 'checking'}
      >
        Refresh
      </button>
    </div>
  );
};

export default HealthCheck;
