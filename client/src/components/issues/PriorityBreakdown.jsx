import React from 'react';

export const PriorityBreakdown = ({ priority }) => {
  if (!priority) return null;

  const b = priority.breakdown || { safety: 0, affected: 0, location: 0, category: 0, age: 0 };
  
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-900">Priority Breakdown</h3>
        <span className="text-2xl font-black text-slate-800">{priority.score}<span className="text-sm font-normal text-slate-400">/100</span></span>
      </div>

      {priority.overridden && (
        <div className="mb-4 text-xs font-medium bg-amber-50 text-amber-700 px-3 py-2 rounded border border-amber-200">
          Overridden to {priority.level} by authority. Reason: {priority.overrideReason}
        </div>
      )}
      
      <div className="space-y-3 text-sm">
        <div className="flex justify-between items-center">
          <span className="text-slate-600">Safety Hazard</span>
          <span className="font-mono text-slate-900">+{b.safety}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-slate-600">Affected Scope</span>
          <span className="font-mono text-slate-900">+{b.affected}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-slate-600">Location Criticality</span>
          <span className="font-mono text-slate-900">+{b.location}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-slate-600">Category Weight</span>
          <span className="font-mono text-slate-900">+{b.category}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-slate-600">Age Component</span>
          <span className="font-mono text-slate-900">+{b.age}</span>
        </div>
      </div>
      
      <div className="mt-4 pt-3 border-t border-slate-100">
        <p className="text-xs text-slate-500 italic">
          {priority.level === 'CRITICAL' ? 'This is a critical issue requiring immediate resolution.' :
           priority.level === 'HIGH' ? 'This is a high-priority issue affecting many users or critical areas.' :
           priority.level === 'MEDIUM' ? 'This is a standard issue that needs attention soon.' :
           'This is a low-priority issue that can be handled during normal operations.'}
        </p>
      </div>
    </div>
  );
};
