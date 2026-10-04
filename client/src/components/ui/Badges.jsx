import React from 'react';
import { STATUS_COLORS, PRIORITY_COLORS } from '../../utils/constants';

export const Badge = ({ children, className = '' }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
    {children}
  </span>
);

export const StatusBadge = ({ status }) => {
  const colorClass = STATUS_COLORS[status] || 'bg-slate-100 text-slate-700';
  return (
    <Badge className={colorClass}>
      {status.replace('_', ' ')}
    </Badge>
  );
};

export const PriorityPill = ({ level }) => {
  const colorClass = PRIORITY_COLORS[level] || 'bg-slate-100 text-slate-700';
  const isCritical = level === 'CRITICAL';
  
  return (
    <Badge className={`${colorClass} font-bold border border-current`}>
      {isCritical && (
        <span className="relative flex h-2 w-2 mr-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
        </span>
      )}
      {level}
    </Badge>
  );
};
