import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Card, CardHeader, CardContent } from '../ui/Card';

export const HotspotBar = ({ hotspots, title = "Location Hotspots" }) => {
  const data = (hotspots || []).map(h => ({
    name: h.location.label.length > 15 ? h.location.label.substring(0,15) + '...' : h.location.label,
    fullLabel: h.location.label,
    total: h.total,
    open: h.openCount,
    recurring: h.recurrences
  }));

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      </CardHeader>
      <CardContent className="flex-1 min-h-[300px]">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-400 text-sm">No data available</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 0, right: 10, left: 20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
              <XAxis type="number" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#475569', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend wrapperStyle={{ paddingTop: '10px' }} iconType="circle" />
              <Bar dataKey="total" name="Total Issues" fill="#94a3b8" radius={[0, 4, 4, 0]} barSize={12} />
              <Bar dataKey="open" name="Open" fill="#f59e0b" radius={[0, 4, 4, 0]} barSize={12} />
              <Bar dataKey="recurring" name="Recurring" fill="#ef4444" radius={[0, 4, 4, 0]} barSize={12} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};
