import React, { useEffect, useState } from 'react';
import { getOverview } from '../../api/analytics';
import { TrendChart } from '../../components/charts/TrendChart';
import { CategoryDonut } from '../../components/charts/CategoryDonut';
import { HotspotBar } from '../../components/charts/HotspotBar';
import { Skeleton } from '../../components/ui/Skeleton';
import { ErrorState } from '../../components/ui/ErrorState';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { StatusBadge, PriorityPill } from '../../components/ui/Badges';
import { formatRelativeTime } from '../../utils/constants';

export const Analytics = () => {
  const [days, setDays] = useState(30);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getOverview(days);
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [days]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-[400px]" />
          <Skeleton className="h-[400px]" />
          <Skeleton className="h-[400px]" />
          <Skeleton className="h-[400px]" />
        </div>
      </div>
    );
  }

  if (error) return <ErrorState message={error} onRetry={fetchAnalytics} />;

  const { summary, trend, byCategory, byStatus, hotspots, aging } = data;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Analytics & Insights</h1>
          <p className="text-slate-500 mt-1">Deep dive into campus issue metrics</p>
        </div>
        <div className="bg-white p-1 rounded-lg border border-slate-200 inline-flex">
          {[7, 30, 90].map(d => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                days === d ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {d} Days
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-[400px]">
          <TrendChart data={trend} title={`Trend (${days} Days)`} />
        </div>
        <div className="h-[400px]">
          <CategoryDonut dataObj={byCategory} />
        </div>
        <div className="h-[400px]">
          <HotspotBar hotspots={hotspots.slice(0, 5)} />
        </div>

        <Card className="h-[400px] flex flex-col">
          <CardHeader>
            <h3 className="text-lg font-semibold text-slate-900">Aging Issues (Oldest 5)</h3>
          </CardHeader>
          <div className="overflow-y-auto flex-1 p-0">
            {aging.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">No aging open issues</div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {aging.map(issue => (
                  <li key={issue._id} className="p-4 hover:bg-slate-50">
                    <div className="flex items-center justify-between mb-2">
                      <a href={`/authority/issues/${issue._id}`} className="font-mono text-sm font-bold text-indigo-600 hover:underline">
                        {issue.code}
                      </a>
                      <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
                        {Math.floor((new Date() - new Date(issue.createdAt)) / (1000 * 60 * 60 * 24))} days open
                      </span>
                    </div>
                    <p className="text-sm text-slate-900 font-medium truncate mb-2">{issue.title}</p>
                    <div className="flex gap-2">
                      <StatusBadge status={issue.status} />
                      <PriorityPill level={issue.priority.level} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>
      </div>
      
      {/* Additional full-width data if needed */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-slate-900">Key Performance Indicators</h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
              <p className="text-sm text-slate-500 mb-1">Total Created</p>
              <p className="text-2xl font-bold text-slate-900">{summary.total}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
              <p className="text-sm text-slate-500 mb-1">Average Resolution</p>
              <p className="text-2xl font-bold text-slate-900">{summary.avgResolutionHours}h</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
              <p className="text-sm text-slate-500 mb-1">Overdue (&gt;7 days)</p>
              <p className="text-2xl font-bold text-slate-900">{summary.overdueCount}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
              <p className="text-sm text-slate-500 mb-1">Critical Open</p>
              <p className="text-2xl font-bold text-slate-900">{summary.critical}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
