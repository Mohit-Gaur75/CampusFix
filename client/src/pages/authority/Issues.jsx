import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getAuthorityIssues } from '../../api/authority';
import { getMeta } from '../../api/meta';
import { useDebounce } from '../../hooks/useDebounce';
import { Button } from '../../components/ui/Button';
import { StatusBadge, PriorityPill } from '../../components/ui/Badges';
import { Skeleton } from '../../components/ui/Skeleton';
import { ErrorState } from '../../components/ui/ErrorState';
import { Pagination } from '../../components/ui/Pagination';
import { formatRelativeTime } from '../../utils/constants';
import { Filter, X, Search } from 'lucide-react';

export const AuthorityIssues = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [meta, setMeta] = useState(null);
  const [issues, setIssues] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sync state with URL params
  const [q, setQ] = useState(searchParams.get('q') || '');
  const debouncedQ = useDebounce(q, 500);

  const getParam = (key) => searchParams.get(key) || '';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = 20;

  useEffect(() => {
    getMeta().then(res => setMeta(res.data)).catch(console.error);
  }, []);

  const fetchIssues = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = Object.fromEntries(searchParams.entries());
      if (debouncedQ) params.q = debouncedQ;
      params.limit = limit;
      
      const res = await getAuthorityIssues(params);
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
  }, [searchParams, debouncedQ]);

  const updateParams = (newParams) => {
    const updated = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([key, value]) => {
      if (value) updated.set(key, value);
      else updated.delete(key);
    });
    if (!newParams.page) updated.set('page', '1');
    setSearchParams(updated);
  };

  const clearFilters = () => {
    setQ('');
    setSearchParams(new URLSearchParams());
  };

  const totalPages = Math.ceil(total / limit);
  const activeFiltersCount = Array.from(searchParams.keys()).filter(k => k !== 'page' && k !== 'sort').length;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Master Issue List</h1>
          <p className="text-slate-500 mt-1">Manage and assign all campus issues</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by code, title, or description..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <select className="text-sm border-slate-300 rounded-lg" value={getParam('status')} onChange={e => updateParams({ status: e.target.value })}>
              <option value="">All Statuses</option>
              {meta?.statuses.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
            </select>
            <select className="text-sm border-slate-300 rounded-lg" value={getParam('priority')} onChange={e => updateParams({ priority: e.target.value })}>
              <option value="">All Priorities</option>
              {meta?.priorities.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <select className="text-sm border-slate-300 rounded-lg" value={getParam('department')} onChange={e => updateParams({ department: e.target.value })}>
              <option value="">All Departments</option>
              {meta?.departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
            </select>
            <select className="text-sm border-slate-300 rounded-lg" value={getParam('sort')} onChange={e => updateParams({ sort: e.target.value })}>
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="priority">Highest Priority</option>
              <option value="reports">Most Reports</option>
            </select>
            {activeFiltersCount > 0 && (
              <Button variant="ghost" onClick={clearFilters} className="text-sm">
                <X className="h-4 w-4 mr-1" /> Clear
              </Button>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={fetchIssues} />
      ) : issues.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-xl border border-slate-200 border-dashed">
          <Filter className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">No issues match filters</h3>
          <Button variant="outline" onClick={clearFilters}>Clear all filters</Button>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          {/* Desktop Table Header */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <div className="col-span-3">Issue</div>
            <div className="col-span-2">Location</div>
            <div className="col-span-2">Department</div>
            <div className="col-span-2">Status / Priority</div>
            <div className="col-span-1 text-center">Reports</div>
            <div className="col-span-2 text-right">Age</div>
          </div>
          
          <ul className="divide-y divide-slate-100">
            {issues.map(issue => (
              <li 
                key={issue._id} 
                className="hover:bg-slate-50 transition-colors cursor-pointer relative"
                onClick={() => navigate(`/authority/issues/${issue._id}`)}
              >
                {/* Priority Color Bar Indicator */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                  issue.priority.level === 'CRITICAL' ? 'bg-red-500' : 
                  issue.priority.level === 'HIGH' ? 'bg-orange-500' :
                  issue.priority.level === 'MEDIUM' ? 'bg-sky-500' : 'bg-slate-300'
                }`} />

                {/* Mobile Card / Desktop Row */}
                <div className="p-4 md:px-6 md:py-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center ml-1">
                  
                  {/* Issue Info */}
                  <div className="md:col-span-3 min-w-0">
                    <div className="flex items-center gap-2 mb-1 md:mb-0">
                      <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded md:hidden">{issue.code}</span>
                      <h3 className="text-sm font-semibold text-slate-900 truncate">{issue.title}</h3>
                    </div>
                    <span className="hidden md:inline-block text-xs font-mono text-slate-500">{issue.code}</span>
                  </div>

                  {/* Location */}
                  <div className="md:col-span-2 text-sm text-slate-500 truncate">
                    {issue.locationSnapshot.building}
                    <span className="hidden md:inline"> • {issue.locationSnapshot.floor}</span>
                  </div>

                  {/* Department */}
                  <div className="md:col-span-2 text-sm text-slate-600 truncate">
                    {issue.department ? issue.department.name : <span className="text-slate-400 italic">Unassigned</span>}
                  </div>

                  {/* Badges */}
                  <div className="md:col-span-2 flex flex-wrap gap-2">
                    <StatusBadge status={issue.status} />
                    <PriorityPill level={issue.priority.level} />
                  </div>

                  {/* Reports Count */}
                  <div className="md:col-span-1 md:text-center">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
                      ×{issue.reportCount}
                    </span>
                  </div>

                  {/* Age */}
                  <div className="md:col-span-2 md:text-right text-xs text-slate-500 whitespace-nowrap">
                    {formatRelativeTime(issue.createdAt)}
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={(p) => updateParams({ page: p.toString() })} />
        </div>
      )}
    </div>
  );
};
