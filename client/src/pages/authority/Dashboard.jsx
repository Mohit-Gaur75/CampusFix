import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOverview } from '../../api/analytics';
import { getAuthorityIssues } from '../../api/authority';
import { StatCard } from '../../components/ui/StatCard';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { StatusBadge, PriorityPill } from '../../components/ui/Badges';
import { Skeleton } from '../../components/ui/Skeleton';
import { ErrorState } from '../../components/ui/ErrorState';
import { formatRelativeTime } from '../../utils/constants';
import { Layers, AlertCircle, Clock, CheckCircle, AlertTriangle, Timer } from 'lucide-react';
import { TrendChart } from '../../components/charts/TrendChart';
import { CategoryDonut } from '../../components/charts/CategoryDonut';

export const AuthorityDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [priorityQueue, setPriorityQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [overviewRes, issuesRes] = await Promise.all([
        getOverview(30),
        getAuthorityIssues({ sort: 'priority', limit: 5 })
      ]);
      setData(overviewRes.data);
      setPriorityQueue(issuesRes.data.items || []);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-96 lg:col-span-2" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (error) return <ErrorState message={error} onRetry={fetchData} />;

  const { summary, trend, byCategory } = data;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Control Center</h1>
        <p className="text-slate-500 mt-1">Overview of campus operations for the last 30 days</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title="Total Issues" value={summary.total} icon={Layers} colorClass="text-slate-600" bgClass="bg-slate-100" />
        <StatCard title="Open" value={summary.open} icon={AlertCircle} colorClass="text-indigo-600" bgClass="bg-indigo-100" />
        <StatCard title="In Progress" value={summary.inProgress} icon={Clock} colorClass="text-amber-600" bgClass="bg-amber-100" />
        <StatCard title="Resolved" value={summary.resolved} icon={CheckCircle} colorClass="text-emerald-600" bgClass="bg-emerald-100" />
        <StatCard title="Critical" value={summary.critical} icon={AlertTriangle} colorClass="text-red-600" bgClass="bg-red-100" />
        <StatCard title="Avg Resolution" value={`${summary.avgResolutionHours}h`} icon={Timer} colorClass="text-sky-600" bgClass="bg-sky-100" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col space-y-6">
          <div className="h-[350px]">
            <TrendChart data={trend} />
          </div>
          <div className="h-[350px]">
            <CategoryDonut dataObj={byCategory} />
          </div>
        </div>

        <div>
          <Card className="h-[724px] flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-900">Priority Queue</h2>
            </CardHeader>
            <div className="overflow-y-auto flex-1">
              {priorityQueue.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-sm">No open issues</div>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {priorityQueue.map(issue => (
                    <li 
                      key={issue._id} 
                      className="p-4 hover:bg-slate-50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/authority/issues/${issue._id}`)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                          {issue.code}
                        </span>
                        <PriorityPill level={issue.priority.level} />
                      </div>
                      <p className="text-sm font-medium text-slate-900 truncate">{issue.title}</p>
                      <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
                        <span className="truncate max-w-[140px]">{issue.locationSnapshot?.building}</span>
                        <span className="flex items-center gap-2 shrink-0">
                          <span className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-600 font-medium">×{issue.reportCount}</span>
                          {formatRelativeTime(issue.createdAt)}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
