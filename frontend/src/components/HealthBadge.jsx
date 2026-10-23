import React, { useState, useEffect } from 'react';

export default function HealthBadge({ onHealthChange }) {
  const [health, setHealth] = useState({
    status: 'checking',
    dbConnected: false,
    environment: '...',
  });

  const checkHealth = async () => {
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        setHealth({
          status: data.database?.connected ? 'healthy' : 'degraded',
          dbConnected: data.database?.connected || false,
          environment: data.environment || 'production',
        });
        if (onHealthChange) onHealthChange(true);
      } else {
        setHealth({ status: 'degraded', dbConnected: false, environment: 'offline' });
        if (onHealthChange) onHealthChange(false);
      }
    } catch (err) {
      setHealth({ status: 'error', dbConnected: false, environment: 'offline' });
      if (onHealthChange) onHealthChange(false);
    }
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  const badgeClass =
    health.status === 'healthy'
      ? 'health-badge healthy'
      : health.status === 'degraded'
      ? 'health-badge degraded'
      : 'health-badge error';

  const label =
    health.status === 'healthy'
      ? 'System Online & DB Connected'
      : health.status === 'degraded'
      ? 'Degraded (DB Disconnected)'
      : 'Backend / DB Offline';

  return (
    <div className={badgeClass} title={`Environment: ${health.environment}`}>
      <span className="health-dot" />
      <span>{label}</span>
    </div>
  );
}
