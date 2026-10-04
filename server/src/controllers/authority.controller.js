import { Issue } from '../models/Issue.js';
import * as workflowService from '../services/workflow.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { computePriority } from '../services/priority.service.js';
import { ApiError } from '../utils/ApiError.js';

export const listIssues = asyncHandler(async (req, res) => {
  const { 
    status, priority, category, building, department, q, minReports, 
    sort = 'newest', page = 1, limit = 20 
  } = req.query;

  const filter = { mergedInto: null };

  if (status) filter.status = status;
  if (priority) filter['priority.level'] = priority;
  if (category) filter.category = category;
  if (building) filter['locationSnapshot.building'] = building;
  if (department) filter.department = department;
  if (minReports) filter.reportCount = { $gte: Number(minReports) };
  
  if (q) {
    filter.$or = [
      { code: { $regex: q, $options: 'i' } },
      { title: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } }
    ];
  }

  let sortObj = { createdAt: -1 };
  if (sort === 'oldest') sortObj = { createdAt: 1 };
  if (sort === 'priority') sortObj = { 'priority.score': -1, createdAt: -1 };
  if (sort === 'reports') sortObj = { reportCount: -1, createdAt: -1 };

  const skip = (Number(page) - 1) * Number(limit);

  const [items, total] = await Promise.all([
    Issue.find(filter)
      .sort(sortObj)
      .skip(skip)
      .limit(Number(limit))
      .populate('location', 'label criticality')
      .populate('department', 'name code')
      .lean(),
    Issue.countDocuments(filter)
  ]);

  // Refresh age component dynamically for reads
  const now = new Date();
  items.forEach(issue => {
    const refreshed = computePriority({
      description: issue.description,
      category: issue.category,
      location: issue.location,
      reportCount: issue.reportCount,
      createdAt: issue.createdAt,
      status: issue.status,
      now,
      overridden: issue.priority?.overridden || false,
      overriddenLevel: issue.priority?.level
    });
    
    if (issue.priority?.overrideReason) refreshed.overrideReason = issue.priority.overrideReason;
    issue.priority = refreshed;
  });

  res.status(200).json({ success: true, data: { items, total, page: Number(page) } });
});

export const getSimilar = asyncHandler(async (req, res) => {
  const result = await workflowService.findSimilarForIssue(req.params.id);
  res.status(200).json({ success: true, data: result });
});

export const assignIssue = asyncHandler(async (req, res) => {
  const result = await workflowService.assignIssue(req.params.id, req.body, req.user);
  res.status(200).json({ success: true, data: result });
});

export const changeStatus = asyncHandler(async (req, res) => {
  const result = await workflowService.changeStatus(req.params.id, req.body, req.user);
  res.status(200).json({ success: true, data: result });
});

export const overridePriority = asyncHandler(async (req, res) => {
  const result = await workflowService.overridePriority(req.params.id, req.body, req.user);
  res.status(200).json({ success: true, data: result });
});

export const addRemark = asyncHandler(async (req, res) => {
  const result = await workflowService.addRemark(req.params.id, req.body, req.user);
  res.status(200).json({ success: true, data: result });
});

export const mergeIssues = asyncHandler(async (req, res) => {
  const { targetId, sourceId } = req.params;
  const result = await workflowService.mergeIssues(targetId, sourceId, req.user);
  res.status(200).json({ success: true, data: result });
});
