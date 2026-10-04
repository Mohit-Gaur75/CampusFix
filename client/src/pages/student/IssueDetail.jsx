import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getIssueById, provideFeedback } from '../../api/issues';
import { Button } from '../../components/ui/Button';
import { StatusBadge, PriorityPill } from '../../components/ui/Badges';
import { Skeleton } from '../../components/ui/Skeleton';
import { ErrorState } from '../../components/ui/ErrorState';
import { useToast } from '../../components/ui/Toast';
import { ConfirmDialog } from '../../components/ui/Modal';
import { formatRelativeTime } from '../../utils/constants';
import { ArrowLeft, Users, Clock } from 'lucide-react';

export const IssueDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedbackAction, setFeedbackAction] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getIssueById(id);
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load issue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const handleFeedback = async () => {
    try {
      await provideFeedback(id, feedbackAction);
      addToast({ type: 'success', message: 'Feedback submitted successfully' });
      fetchDetail();
    } catch (err) {
      addToast({ type: 'error', message: err.response?.data?.error?.message || 'Action failed' });
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-10 w-32 mb-6" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchDetail} />;
  }

  const { issue, timeline } = data;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button 
        onClick={() => navigate('/student/issues')}
        className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to issues
      </button>

      {issue.reportCount > 1 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start">
          <Users className="h-5 w-5 text-amber-500 mt-0.5 mr-3 shrink-0" />
          <div>
            <h4 className="text-sm font-semibold text-amber-800">You're not alone</h4>
            <p className="text-sm text-amber-700 mt-1">
              You and {issue.reportCount - 1} other student(s) reported this issue. Updates will be shared with everyone.
            </p>
          </div>
        </div>
      )}

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
            <p className="text-slate-500 text-sm mt-2 flex items-center">
              <Clock className="h-4 w-4 mr-1.5" />
              Reported {formatRelativeTime(issue.createdAt)} in {issue.locationSnapshot.building} • {issue.locationSnapshot.floor} • {issue.locationSnapshot.label}
            </p>
          </div>
        </div>

        <div className="prose prose-slate max-w-none mb-8">
          <p className="text-slate-700 whitespace-pre-wrap">{issue.description}</p>
        </div>

        {issue.photos?.length > 0 && (
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Photos</h3>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {issue.photos.map((photo, idx) => (
                <div key={idx} className="relative h-32 w-32 shrink-0 rounded-lg overflow-hidden border border-slate-200 cursor-pointer hover:opacity-90">
                  <img src={photo} alt={`Issue attachment ${idx + 1}`} className="absolute inset-0 w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="border-t border-slate-200 pt-8 mt-8">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">Timeline</h3>
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
                            {event.actor?.name && ` by ${event.actor.name}`}
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

        {issue.status === 'RESOLVED' && (
          <div className="border-t border-slate-200 pt-6 mt-6 bg-slate-50 -mx-6 sm:-mx-8 px-6 sm:px-8 pb-6 sm:pb-8 rounded-b-xl">
            <h3 className="text-base font-medium text-slate-900 mb-2">Is the issue resolved?</h3>
            <p className="text-sm text-slate-500 mb-4">Please confirm if the problem has been fixed, or reopen it if it persists.</p>
            <div className="flex gap-3">
              <Button 
                onClick={() => { setFeedbackAction('CONFIRM'); setIsConfirmOpen(true); }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Yes, it's fixed
              </Button>
              <Button 
                variant="outline"
                onClick={() => { setFeedbackAction('REOPEN'); setIsConfirmOpen(true); }}
                className="text-amber-700 hover:bg-amber-50 hover:border-amber-200"
              >
                No, reopen issue
              </Button>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog 
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleFeedback}
        title={feedbackAction === 'CONFIRM' ? 'Confirm Resolution' : 'Reopen Issue'}
        message={feedbackAction === 'CONFIRM' 
          ? 'Are you sure this issue has been resolved? This will permanently close the ticket.' 
          : 'Are you sure the issue still persists? This will alert the authority.'}
        confirmText={feedbackAction === 'CONFIRM' ? 'Close Issue' : 'Reopen Issue'}
      />
    </div>
  );
};
