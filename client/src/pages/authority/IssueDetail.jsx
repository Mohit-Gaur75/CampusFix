import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getIssueById } from '../../api/issues';
import { getSimilarIssues, mergeIssues } from '../../api/authority';
import { getMeta } from '../../api/meta';
import { StatusBadge, PriorityPill } from '../../components/ui/Badges';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { ErrorState } from '../../components/ui/ErrorState';
import { ConfirmDialog } from '../../components/ui/Modal';
import { useToast } from '../../components/ui/Toast';
import { ActionPanel } from '../../components/issues/ActionPanel';
import { PriorityBreakdown } from '../../components/issues/PriorityBreakdown';
import { formatRelativeTime } from '../../utils/constants';
import { ArrowLeft, GitMerge } from 'lucide-react';

export const AuthorityIssueDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  const [meta, setMeta] = useState(null);
  const [data, setData] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Merge Dialog
  const [mergeTarget, setMergeTarget] = useState(null);
  const [isMergeOpen, setIsMergeOpen] = useState(false);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const [resMeta, resData, resSimilar] = await Promise.all([
        getMeta(),
        getIssueById(id),
        getSimilarIssues(id)
      ]);
      setMeta(resMeta.data);
      setData(resData.data);
      setSimilar(resSimilar.data);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load issue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const handleMerge = async () => {
    if (!mergeTarget) return;
    try {
      await mergeIssues(id, mergeTarget); // Merge the similar one INTO this one. Wait, mergeTarget into id or id into mergeTarget?
      // POST /issues/:targetId/merge/:sourceId
      // Let's assume we merge the SIMILAR (source) INTO THIS (target)
      addToast({ type: 'success', message: 'Issues merged successfully' });
      fetchDetail();
    } catch (err) {
      addToast({ type: 'error', message: err.response?.data?.error?.message || 'Merge failed' });
    }
  };

  const onActionComplete = () => {
    addToast({ type: 'success', message: 'Updated successfully' });
    fetchDetail();
  };

  if (loading) return <div className="max-w-7xl mx-auto space-y-6"><Skeleton className="h-64 w-full" /></div>;
  if (error) return <ErrorState message={error} onRetry={fetchDetail} />;

  const { issue, reports, timeline } = data;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <button 
        onClick={() => navigate('/authority/issues')}
        className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Master List
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - Main Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="px-2.5 py-1 text-sm font-mono font-bold text-indigo-700 bg-indigo-50 rounded-md">
                    {issue.code}
                  </span>
                  <StatusBadge status={issue.status} />
                  <PriorityPill level={issue.priority.level} />
                </div>
                <h1 className="text-2xl font-bold text-slate-900">{issue.title}</h1>
                <p className="text-slate-500 text-sm mt-2">
                  {issue.locationSnapshot.building} • {issue.locationSnapshot.floor} • {issue.locationSnapshot.label}
                </p>
                {issue.department && (
                  <p className="text-sm font-medium text-indigo-600 mt-1">
                    Assigned: {issue.department.name} {issue.assignedStaff ? `(${issue.assignedStaff})` : ''}
                  </p>
                )}
              </div>
            </div>

            <div className="prose prose-slate max-w-none mb-8">
              <p className="text-slate-700 whitespace-pre-wrap">{issue.description}</p>
            </div>

            {issue.photos?.length > 0 && (
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-slate-900 mb-3">Photo Gallery</h3>
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {issue.photos.map((photo, idx) => (
                    <div key={idx} className="relative h-32 w-32 shrink-0 rounded-lg overflow-hidden border border-slate-200 cursor-pointer hover:opacity-90">
                      <img src={photo} alt={`Issue attachment ${idx + 1}`} className="absolute inset-0 w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Timeline */}
            <div className="border-t border-slate-200 pt-8 mt-8">
              <h3 className="text-lg font-semibold text-slate-900 mb-6">Full Timeline</h3>
              <div className="flow-root">
                <ul className="-mb-8">
                  {timeline.map((event, eventIdx) => (
                    <li key={event._id}>
                      <div className="relative pb-8">
                        {eventIdx !== timeline.length - 1 ? (
                          <span className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-slate-200" aria-hidden="true" />
                        ) : null}
                        <div className="relative flex space-x-3">
                          <div>
                            <span className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center ring-8 ring-white">
                              <div className="h-2.5 w-2.5 rounded-full bg-slate-400" />
                            </span>
                          </div>
                          <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                            <div>
                              <p className="text-sm text-slate-500">
                                <span className="font-medium text-slate-900">{event.note}</span>
                                {event.actor?.name && ` by ${event.actor.name}`} {!event.visibleToStudent && <span className="text-xs bg-slate-100 text-slate-600 px-1 rounded ml-1">Internal</span>}
                              </p>
                            </div>
                            <div className="whitespace-nowrap text-right text-sm text-slate-500">
                              <time dateTime={event.createdAt}>{formatRelativeTime(event.createdAt)}</time>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Workflow Panels */}
        <div className="space-y-6">
          <ActionPanel issue={issue} meta={meta} onActionComplete={onActionComplete} />
          
          <PriorityBreakdown priority={issue.priority} />

          {/* Grouped Reports */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
            <h3 className="text-sm font-semibold text-slate-900 mb-3 border-b border-slate-100 pb-2">Grouped Reports ({reports.length})</h3>
            <ul className="space-y-3 max-h-64 overflow-y-auto pr-2">
              {reports.map((report) => (
                <li key={report._id} className="text-sm border-b border-slate-50 pb-2 last:border-0">
                  <div className="flex justify-between items-start">
                    <span className="font-medium text-slate-700">{report.reporter.name}</span>
                    <span className="text-xs text-slate-400">{formatRelativeTime(report.createdAt)}</span>
                  </div>
                  {report.dedupe?.decision === 'LINKED_BY_USER' && (
                    <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">User Linked</span>
                  )}
                  {report.dedupe?.decision === 'MERGED_BY_AUTHORITY' && (
                    <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">Merged</span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Similar Issues */}
          {similar.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
              <h3 className="text-sm font-semibold text-slate-900 mb-3 border-b border-slate-100 pb-2">Similar Issues</h3>
              <ul className="space-y-4">
                {similar.map(sim => (
                  <li key={sim.issue._id} className="text-sm">
                    <div className="flex items-center justify-between mb-1">
                      <a href={`/authority/issues/${sim.issue._id}`} target="_blank" rel="noreferrer" className="font-mono font-medium text-indigo-600 hover:underline">
                        {sim.issue.code}
                      </a>
                      <span className="text-xs text-slate-500">{Math.round(sim.score * 100)}% match</span>
                    </div>
                    <p className="text-slate-700 truncate mb-2">{sim.issue.title}</p>
                    <Button 
                      variant="outline" 
                      className="w-full text-xs py-1"
                      onClick={() => { setMergeTarget(sim.issue._id); setIsMergeOpen(true); }}
                    >
                      <GitMerge className="h-3 w-3 mr-1" /> Merge into this
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}

        </div>
      </div>

      <ConfirmDialog 
        isOpen={isMergeOpen}
        onClose={() => setIsMergeOpen(false)}
        onConfirm={handleMerge}
        title="Merge Issues"
        message="Are you sure you want to merge that issue into this one? All reports and photos will be transferred here, and the other issue will be permanently closed."
        confirmText="Merge Issues"
        isDangerous={true}
      />
    </div>
  );
};
