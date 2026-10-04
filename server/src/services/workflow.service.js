import { Issue } from '../models/Issue.js';
import { Report } from '../models/Report.js';
import { ALLOWED_TRANSITIONS, TIMELINE_TYPES } from '../utils/constants.js';
import { ApiError } from '../utils/ApiError.js';
import { computePriority } from './priority.service.js';
import { notifyReporters } from './notification.service.js';
import { findCandidates } from './issue.service.js';

export const assignIssue = async (issueId, { departmentId, staffName }, actor) => {
  const issue = await Issue.findById(issueId).populate('location');
  if (!issue) throw new ApiError(404, 'Issue not found');

  if (issue.status === 'REPORTED') {
    issue.status = 'ASSIGNED';
  }

  issue.department = departmentId;
  if (staffName) {
    issue.assignedStaff = staffName;
  }

  issue.timeline.push({
    type: TIMELINE_TYPES.ASSIGNED,
    note: `Assigned to department. ${staffName ? 'Staff: ' + staffName : ''}`,
    actor: { id: actor._id, name: actor.name, role: actor.role }
  });

  await issue.save();
  await notifyReporters(issue.reporters, actor._id, issue._id, 'ASSIGNED', 'Your issue has been assigned to a department.');

  return issue;
};

export const changeStatus = async (issueId, { status, note }, actor) => {
  const issue = await Issue.findById(issueId).populate('location');
  if (!issue) throw new ApiError(404, 'Issue not found');

  const allowed = ALLOWED_TRANSITIONS[issue.status] || [];
  if (!allowed.includes(status)) {
    throw new ApiError(400, `Cannot transition from ${issue.status} to ${status}`);
  }

  if (['REJECTED', 'RESOLVED'].includes(status) && (!note || note.trim().length === 0)) {
    throw new ApiError(400, `A note is required when moving to ${status}`);
  }

  if (['IN_PROGRESS', 'ASSIGNED'].includes(status) && !issue.department) {
    throw new ApiError(400, `Department must be assigned before moving to ${status}`);
  }

  issue.status = status;
  
  if (status === 'RESOLVED') {
    issue.resolvedAt = new Date();
  } else if (status === 'CLOSED' || status === 'REJECTED') {
    issue.closedAt = new Date();
  } else {
    issue.resolvedAt = undefined;
    issue.closedAt = undefined;
  }

  const newPriority = computePriority({
    description: issue.description,
    category: issue.category,
    location: issue.location,
    reportCount: issue.reportCount,
    createdAt: issue.createdAt,
    status: issue.status,
    now: new Date(),
    overridden: issue.priority?.overridden || false,
    overriddenLevel: issue.priority?.level
  });
  
  if (issue.priority?.overrideReason) newPriority.overrideReason = issue.priority.overrideReason;
  issue.priority = newPriority;

  issue.timeline.push({
    type: TIMELINE_TYPES.STATUS,
    note: `Status changed to ${status}.${note ? ' Note: ' + note : ''}`,
    actor: { id: actor._id, name: actor.name, role: actor.role }
  });

  await issue.save();
  await notifyReporters(issue.reporters, actor._id, issue._id, 'STATUS_UPDATE', `Issue status updated to ${status}.`);

  return issue;
};

export const overridePriority = async (issueId, { level, reason }, actor) => {
  const issue = await Issue.findById(issueId).populate('location');
  if (!issue) throw new ApiError(404, 'Issue not found');

  const newPriority = computePriority({
    description: issue.description,
    category: issue.category,
    location: issue.location,
    reportCount: issue.reportCount,
    createdAt: issue.createdAt,
    status: issue.status,
    now: new Date(),
    overridden: true,
    overriddenLevel: level
  });
  
  newPriority.overrideReason = reason;
  issue.priority = newPriority;

  issue.timeline.push({
    type: TIMELINE_TYPES.PRIORITY,
    note: `Priority manually set to ${level}. Reason: ${reason}`,
    actor: { id: actor._id, name: actor.name, role: actor.role }
  });

  await issue.save();
  return issue;
};

export const addRemark = async (issueId, { text, visibleToStudent }, actor) => {
  const issue = await Issue.findById(issueId);
  if (!issue) throw new ApiError(404, 'Issue not found');

  issue.timeline.push({
    type: TIMELINE_TYPES.REMARK,
    note: text,
    visibleToStudent,
    actor: { id: actor._id, name: actor.name, role: actor.role }
  });

  await issue.save();
  
  if (visibleToStudent) {
    await notifyReporters(issue.reporters, actor._id, issue._id, 'REMARK', 'A new remark was added to your issue.');
  }

  return issue;
};

export const mergeIssues = async (targetId, sourceId, actor) => {
  if (targetId === sourceId) throw new ApiError(400, 'Cannot merge an issue into itself');

  const target = await Issue.findById(targetId).populate('location');
  const source = await Issue.findById(sourceId);

  if (!target || !source) throw new ApiError(404, 'Issue not found');
  if (source.status === 'CLOSED' || source.status === 'REJECTED') {
    throw new ApiError(400, 'Cannot merge from a closed or rejected issue');
  }

  // Find all reports belonging to source
  const sourceReports = await Report.find({ issue: sourceId });

  let newReportersAdded = 0;
  for (const report of sourceReports) {
    report.issue = targetId;
    if (report.dedupe) {
      report.dedupe.decision = 'MERGED_BY_AUTHORITY';
      report.dedupe.matchedIssue = targetId;
    }
    
    // Add reporter to target if not already there
    if (!target.reporters.map(id => id.toString()).includes(report.reporter.toString())) {
      target.reporters.push(report.reporter);
      newReportersAdded++;
    }
    await report.save();
  }

  target.reportCount += newReportersAdded;

  // Append photos
  target.photos = [...target.photos, ...source.photos].slice(0, 4);

  const newPriority = computePriority({
    description: target.description,
    category: target.category,
    location: target.location,
    reportCount: target.reportCount,
    createdAt: target.createdAt,
    status: target.status,
    now: new Date(),
    overridden: target.priority?.overridden || false,
    overriddenLevel: target.priority?.level
  });
  if (target.priority?.overrideReason) newPriority.overrideReason = target.priority.overrideReason;
  target.priority = newPriority;

  target.timeline.push({
    type: TIMELINE_TYPES.MERGED,
    note: `Merged reports from ${source.code} into this issue.`,
    actor: { id: actor._id, name: actor.name, role: actor.role }
  });

  source.status = 'CLOSED';
  source.mergedInto = target._id;
  source.closedAt = new Date();
  source.timeline.push({
    type: TIMELINE_TYPES.MERGED,
    note: `This issue was merged into ${target.code}.`,
    actor: { id: actor._id, name: actor.name, role: actor.role }
  });

  await Promise.all([target.save(), source.save()]);
  
  await notifyReporters(target.reporters, actor._id, target._id, 'MERGED', `Your issue was grouped with another similar issue (${target.code}).`);
  
  return target;
};

export const findSimilarForIssue = async (issueId) => {
  const issue = await Issue.findById(issueId).populate('location').lean();
  if (!issue) throw new ApiError(404, 'Issue not found');
  
  const candidates = await findCandidates({
    category: issue.category,
    location: issue.location,
    description: issue.description
  });

  // Filter out itself
  return candidates.filter(c => c.issue._id.toString() !== issue._id.toString());
};
