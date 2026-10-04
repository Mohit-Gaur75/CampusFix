import React from 'react';

export const Skeleton = ({ className = '', variant = 'rectangular' }) => {
  const variants = {
    circular: 'rounded-full',
    rectangular: 'rounded-md',
    text: 'rounded h-4'
  };
  return (
    <div className={`animate-pulse bg-slate-200 ${variants[variant]} ${className}`} />
  );
};
