import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyIssues } from '../../api/issues';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge, PriorityPill } from '../../components/ui/Badges';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { Pagination } from '../../components/ui/Pagination';
import { formatRelativeTime } from '../../utils/constants';
import { Filter, Search } from 'lucide-react';

export const MyIssues = () => {
  const [issues, setIssues] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const limit = 10;
  
  const navigate = useNavigate();

  const fetchIssues = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = { page, limit, sort: 'newest' };
      if (statusFilter !== 'ALL') {
        params.status = statusFilter;
      }
      const res = await getMyIssues(params);
      setIssues(res.data.items || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load issues');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, [page, statusFilter]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Issues</h1>
          <p className="text-slate-500 mt-1">Track the status of your reported problems</p>
        </div>
      </div>

      <div className="bg-white p-2 rounded-lg border border-slate-200 inline-flex space-x-1">
        {['ALL', 'REPORTED', 'IN_PROGRESS', 'RESOLVED'].map(filter => (
          <button
            key={filter}
            onClick={() => { setStatusFilter(filter); setPage(1); }}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              statusFilter === filter 
                ? 'bg-indigo-50 text-indigo-700' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            {filter === 'ALL' ? 'All Issues' : filter.replace('_', ' ')}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28 w-full" />)}
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={fetchIssues} />
      ) : issues.length === 0 ? (
        <EmptyState 
          icon={Search}
          title="No issues found"
          description={statusFilter === 'ALL' ? "You haven't reported any issues yet." : "No issues in this filter."}
        />
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <ul className="divide-y divide-slate-200">
            {issues.map(issue => (
              <li 
                key={issue._id} 
                className="p-5 hover:bg-slate-50 transition-colors cursor-pointer" 
                onClick={() => navigate(`/student/issues/${issue._id}`)}
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-mono font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{issue.code}</span>
                      <StatusBadge status={issue.status} />
                      <PriorityPill level={issue.priority.level} />
                    </div>
                    <h3 className="text-base font-semibold text-slate-900 truncate">{issue.title}</h3>
                    <p className="text-sm text-slate-500 mt-1 line-clamp-2">{issue.description}</p>
                    <div className="flex items-center text-xs text-slate-400 mt-3 gap-3">
                      <span>{issue.locationSnapshot.building} • {issue.locationSnapshot.floor}</span>
                      <span>•</span>
                      <span>{formatRelativeTime(issue.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
};
