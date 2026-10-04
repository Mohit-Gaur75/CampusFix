import React, { useEffect, useState } from 'react';
import { Card } from './Card';

export const StatCard = ({ title, value, icon: Icon, colorClass = 'text-indigo-600', bgClass = 'bg-indigo-100' }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const isNum = typeof value === 'number' || !isNaN(Number(value));
    const target = isNum ? Number(value) : 0;
    
    if (!isNum) {
      setDisplayValue(value);
      return;
    }

    let start = 0;
    const duration = 1000;
    const increment = target / (duration / 16);
    
    if (target === 0) {
      setDisplayValue(0);
      return;
    }

    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setDisplayValue(target);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <Card className="flex items-center p-6 hover:shadow-md transition-shadow">
      <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${bgClass} ${colorClass} mr-4`}>
        {Icon && <Icon className="h-6 w-6" />}
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900">{displayValue}</h3>
      </div>
    </Card>
  );
};
