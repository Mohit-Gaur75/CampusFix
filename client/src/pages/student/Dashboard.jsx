import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyIssues } from '../../api/issues';
import { StatCard } from '../../components/ui/StatCard';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge, PriorityPill } from '../../components/ui/Badges';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { formatRelativeTime } from '../../utils/constants';
import { AlertCircle, Clock, CheckCircle, Plus, FileText } from 'lucide-react';

export const StudentDashboard = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getMyIssues({ limit: 5 });
      setIssues(res.data.items || []);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto">
        <ErrorState message={error} onRetry={fetchDashboardData} />
      </div>
    );
  }

  const openCount = issues.filter(i => ['REPORTED', 'ASSIGNED'].includes(i.status)).length;
  const inProgressCount = issues.filter(i => i.status === 'IN_PROGRESS').length;
  const resolvedCount = issues.filter(i => ['RESOLVED', 'CLOSED'].includes(i.status)).length;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1">Overview of your reported issues</p>
        </div>
        <Button onClick={() => navigate('/student/report')} className="shrink-0">
          <Plus className="mr-2 h-5 w-5" />
          Report an issue
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Open" 
          value={openCount} 
          icon={AlertCircle} 
          colorClass="text-slate-600" 
          bgClass="bg-slate-100" 
        />
        <StatCard 
          title="In Progress" 
          value={inProgressCount} 
          icon={Clock} 
          colorClass="text-amber-600" 
          bgClass="bg-amber-100" 
        />
        <StatCard 
          title="Resolved" 
          value={resolvedCount} 
          icon={CheckCircle} 
          colorClass="text-emerald-600" 
          bgClass="bg-emerald-100" 
        />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Recent Issues</h2>
          {issues.length > 0 && (
            <button onClick={() => navigate('/student/issues')} className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
              View all &rarr;
            </button>
          )}
        </CardHeader>
        <CardContent className="p-0">
          {issues.length === 0 ? (
            <EmptyState 
              icon={FileText}
              title="No issues reported"
              description="You haven't reported anything yet. If you see a problem on campus, let us know!"
              action={
                <Button onClick={() => navigate('/student/report')} className="mt-2">
                  Report your first issue
                </Button>
              }
            />
          ) : (
            <ul className="divide-y divide-slate-200">
              {issues.slice(0, 5).map(issue => (
                <li key={issue._id} className="p-4 hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => navigate(`/student/issues/${issue._id}`)}>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-mono font-medium text-indigo-600">{issue.code}</span>
                        <StatusBadge status={issue.status} />
                        <PriorityPill level={issue.priority.level} />
                      </div>
                      <p className="text-sm font-medium text-slate-900 truncate">{issue.title}</p>
                      <p className="text-sm text-slate-500 truncate mt-1">
                        {issue.locationSnapshot.building} • {formatRelativeTime(issue.createdAt)}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
