import React from 'react';
import { useConnectionStatus } from './useConnectionStatus';
import { ServerStatusProps } from './types';
import { Tooltip } from '../ui/Tooltip';

export default function ServerStatusIndicator({ className = '' }: ServerStatusProps) {
  const status = useConnectionStatus();

  const indicatorColor = status.isConnected ? 'bg-green-500' : 'bg-red-500';
  const tooltipContent = (
    <div className="space-y-1 text-sm">
      <p>Status: {status.isConnected ? 'Connected' : 'Disconnected'}</p>
      {status.lastConnected && (
        <p>Last connected: {status.lastConnected.toLocaleString()}</p>
      )}
      {status.error && (
        <p className="text-red-400">Error: {status.error}</p>
      )}
    </div>
  );

  return (
    <Tooltip content={tooltipContent}>
      <div className={`relative ${className}`}>
        <div
          className={`w-3 h-3 rounded-full ${indicatorColor} shadow-lg ${
            status.isConnected ? 'animate-pulse' : ''
          }`}
        />
        {!status.isConnected && (
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500 animate-ping" />
        )}
      </div>
    </Tooltip>
  );
}