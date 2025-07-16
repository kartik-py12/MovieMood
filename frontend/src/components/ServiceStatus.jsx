import { useState, useEffect } from 'react';

const ServiceStatus = () => {
  const [status, setStatus] = useState('checking');
  const [lastCheck, setLastCheck] = useState(null);

  const checkApiHealth = async () => {
    try {
      const response = await fetch('https://tmdbproxy-eedtf6bxbae2f4d3.westindia-01.azurewebsites.net/api/health');
      const data = await response.json();
      
      if (response.ok && data.status === 'ok') {
        setStatus('healthy');
      } else {
        setStatus('degraded');
      }
    } catch {
      setStatus('down');
    }
    
    setLastCheck(new Date());
  };

  useEffect(() => {
    checkApiHealth();
    
    // Check every 30 seconds
    const interval = setInterval(checkApiHealth, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    switch (status) {
      case 'healthy': return 'text-green-500';
      case 'degraded': return 'text-yellow-500';
      case 'down': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'healthy': return 'Service Healthy';
      case 'degraded': return 'Service Degraded';
      case 'down': return 'Service Down';
      default: return 'Checking...';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800/90 text-white px-3 py-2 rounded-lg text-sm backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${status === 'healthy' ? 'bg-green-500' : status === 'degraded' ? 'bg-yellow-500' : status === 'down' ? 'bg-red-500' : 'bg-gray-500'}`}></div>
        <span className={getStatusColor()}>{getStatusText()}</span>
      </div>
      {lastCheck && (
        <div className="text-xs text-gray-400 mt-1">
          Last check: {lastCheck.toLocaleTimeString()}
        </div>
      )}
    </div>
  );
};

export default ServiceStatus;
