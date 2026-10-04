import React, { useState } from 'react';
import { assignIssue, changeStatus, overridePriority, addRemark } from '../../api/authority';
import { Button } from '../ui/Button';
import { ALLOWED_TRANSITIONS } from '../../utils/constants';

export const ActionPanel = ({ issue, meta, onActionComplete }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Assign State
  const [deptId, setDeptId] = useState(issue.department?._id || '');
  const [staff, setStaff] = useState(issue.assignedStaff || '');

  // Status State
  const [status, setStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');

  // Priority State
  const [priority, setPriority] = useState('');
  const [priorityReason, setPriorityReason] = useState('');

  // Remark State
  const [remarkText, setRemarkText] = useState('');
  const [visibleToStudent, setVisibleToStudent] = useState(false);

  const allowedNext = ALLOWED_TRANSITIONS[issue.status] || [];

  const handleWrap = async (actionFn) => {
    try {
      setLoading(true);
      setError('');
      await actionFn();
      onActionComplete();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Action failed');
    } finally {
      setLoading(false);
    }
  };

  const onAssign = (e) => {
    e.preventDefault();
    if (!deptId) return;
    handleWrap(() => assignIssue(issue._id, { departmentId: deptId, staffName: staff }));
  };

  const onStatus = (e) => {
    e.preventDefault();
    if (!status) return;
    handleWrap(() => changeStatus(issue._id, { status, note: statusNote }));
  };

  const onPriority = (e) => {
    e.preventDefault();
    if (!priority || !priorityReason) return;
    handleWrap(() => overridePriority(issue._id, { level: priority, reason: priorityReason }));
  };

  const onRemark = (e) => {
    e.preventDefault();
    if (!remarkText) return;
    handleWrap(() => addRemark(issue._id, { text: remarkText, visibleToStudent }));
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 space-y-8">
      {error && <div className="p-3 bg-rose-50 text-rose-700 rounded-md text-sm">{error}</div>}
      
      {/* Assign */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-3 border-b border-slate-100 pb-2">Assign Department</h3>
        <form onSubmit={onAssign} className="space-y-3">
          <select className="w-full text-sm border-slate-300 rounded-md" value={deptId} onChange={e => setDeptId(e.target.value)} required disabled={loading}>
            <option value="">Select Department</option>
            {meta?.departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
          </select>
          <input type="text" placeholder="Staff Name (Optional)" className="w-full text-sm border-slate-300 rounded-md" value={staff} onChange={e => setStaff(e.target.value)} disabled={loading} />
          <Button type="submit" disabled={loading || !deptId} className="w-full text-sm">Assign</Button>
        </form>
      </div>

      {/* Status */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-3 border-b border-slate-100 pb-2">Change Status</h3>
        {allowedNext.length === 0 ? (
          <p className="text-xs text-slate-500">No further status transitions allowed.</p>
        ) : (
          <form onSubmit={onStatus} className="space-y-3">
            <select className="w-full text-sm border-slate-300 rounded-md" value={status} onChange={e => setStatus(e.target.value)} required disabled={loading}>
              <option value="">Select Next Status</option>
              {allowedNext.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
            </select>
            {(status === 'REJECTED' || status === 'RESOLVED') && (
              <textarea placeholder="Reason/Note (Required)" className="w-full text-sm border-slate-300 rounded-md" required value={statusNote} onChange={e => setStatusNote(e.target.value)} disabled={loading} rows={2} />
            )}
            <Button type="submit" disabled={loading || !status} className="w-full text-sm">Update Status</Button>
          </form>
        )}
      </div>

      {/* Priority Override */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-3 border-b border-slate-100 pb-2">Override Priority</h3>
        <form onSubmit={onPriority} className="space-y-3">
          <select className="w-full text-sm border-slate-300 rounded-md" value={priority} onChange={e => setPriority(e.target.value)} required disabled={loading}>
            <option value="">Select Level</option>
            {meta?.priorities.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <input type="text" placeholder="Reason for override" className="w-full text-sm border-slate-300 rounded-md" value={priorityReason} onChange={e => setPriorityReason(e.target.value)} disabled={loading} required />
          <Button type="submit" disabled={loading || !priority || !priorityReason} className="w-full text-sm">Force Priority</Button>
        </form>
      </div>

      {/* Add Remark */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-3 border-b border-slate-100 pb-2">Add Remark</h3>
        <form onSubmit={onRemark} className="space-y-3">
          <textarea placeholder="Internal note or update..." className="w-full text-sm border-slate-300 rounded-md" required value={remarkText} onChange={e => setRemarkText(e.target.value)} disabled={loading} rows={3} />
          <label className="flex items-center text-sm text-slate-700">
            <input type="checkbox" className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 mr-2" checked={visibleToStudent} onChange={e => setVisibleToStudent(e.target.checked)} disabled={loading} />
            Visible to student
          </label>
          <Button type="submit" disabled={loading || !remarkText} className="w-full text-sm">Add Remark</Button>
        </form>
      </div>
    </div>
  );
};
