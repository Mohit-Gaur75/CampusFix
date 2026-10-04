import { Issue } from '../models/Issue.js';
import { Report } from '../models/Report.js';
import { Counter } from '../models/Counter.js';
import { Location } from '../models/Location.js';
import { Department } from '../models/Department.js';
import { normalize } from '../utils/text.js';
import { computePriority } from './priority.service.js';
import { similarity } from './duplicate.service.js';
import { notifyReporters } from './notification.service.js';
import { CATEGORY_TO_DEPARTMENT_CODE, TIMELINE_TYPES, CATEGORY_KEYWORDS } from '../utils/constants.js';
import { ApiError } from '../utils/ApiError.js';

const getNextSequence = async (name) => {
  const counter = await Counter.findByIdAndUpdate(
    name,
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return `CF-${String(counter.seq).padStart(4, '0')}`;
};

export const suggestCategory = (description) => {
  const descLower = description.toLowerCase();
  
  let bestCategory = 'OTHER';
  let maxMatches = 0;

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    let matches = 0;
    for (const kw of keywords) {
      if (descLower.includes(kw)) matches++;
    }
    if (matches > maxMatches) {
      maxMatches = matches;
      bestCategory = category;
    }
  }

  const confidence = maxMatches > 0 ? (maxMatches > 2 ? 'HIGH' : 'MEDIUM') : 'LOW';
  return { category: bestCategory, confidence };
};

export const findCandidates = async (input) => {
  const openIssues = await Issue.find({
    category: input.category,
    status: { $in: ['REPORTED', 'ASSIGNED', 'IN_PROGRESS'] },
    mergedInto: null,
    'locationSnapshot.building': input.location.building
  }).populate('location').lean();

  const candidates = openIssues.map(issue => {
    const sim = similarity(input, issue);
    return { issue, ...sim };
  });

  return candidates
    .filter(c => c.score >= 0.50)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
};

export const checkDuplicates = async (category, locationId, description) => {
  const location = await Location.findById(locationId).lean();
  if (!location) throw new ApiError(400, 'Invalid location');
  
  const candidates = await findCandidates({ category, location, description });
  
  return {
    candidates: candidates.map(c => ({
      issue: {
        _id: c.issue._id,
        code: c.issue.code,
        title: c.issue.title,
        status: c.issue.status,
        reportCount: c.issue.reportCount,
        locationSnapshot: c.issue.locationSnapshot
      },
      score: c.score,
      band: c.band,
      breakdown: c.breakdown
    }))
  };
};

export const createIssue = async (user, issueData, photoUrls) => {
  const location = await Location.findById(issueData.locationId);
  if (!location) throw new ApiError(400, 'Invalid location');

  // Spam prevention: block same user from reporting same category/location within 15 mins
  const recentReport = await Report.findOne({
    reporter: user._id,
    category: issueData.category,
    location: location._id,
    createdAt: { $gte: new Date(Date.now() - 15 * 60 * 1000) }
  });

  if (recentReport) {
    throw new ApiError(429, 'You have recently reported an issue in this category and location. Please wait before submitting again.');
  }

  // Handle linking
  if (issueData.linkToIssueId) {
    const targetIssue = await Issue.findById(issueData.linkToIssueId).populate('location');
    if (!targetIssue) throw new ApiError(404, 'Issue to link not found');
    
    if (['RESOLVED', 'CLOSED', 'REJECTED'].includes(targetIssue.status)) {
      throw new ApiError(409, 'Cannot link to a closed or resolved issue');
    }

    if (targetIssue.reporters.map(id => id.toString()).includes(user._id.toString())) {
      throw new ApiError(409, 'You have already reported this issue');
    }

    const sim = similarity({ category: issueData.category, location, description: issueData.description }, targetIssue);

    const report = await Report.create({
      issue: targetIssue._id,
      reporter: user._id,
      description: issueData.description,
      category: issueData.category,
      location: location._id,
      photos: photoUrls,
      isPrimary: false,
      dedupe: {
        score: sim.score,
        band: sim.band,
        matchedIssue: targetIssue._id,
        decision: 'LINKED_BY_USER',
        breakdown: sim.breakdown
      }
    });

    targetIssue.reportCount += 1;
    targetIssue.reporters.push(user._id);
    
    // Append photos up to 4
    const newPhotos = [...targetIssue.photos, ...photoUrls].slice(0, 4);
    targetIssue.photos = newPhotos;

    targetIssue.priority = computePriority({
      description: targetIssue.description,
      category: targetIssue.category,
      location: targetIssue.location,
      reportCount: targetIssue.reportCount,
      createdAt: targetIssue.createdAt,
      status: targetIssue.status
    });

    targetIssue.timeline.push({
      type: TIMELINE_TYPES.REPORT_LINKED,
      note: 'Another student reported the same issue',
      actor: { id: user._id, name: user.name, role: user.role }
    });

    await targetIssue.save();

    await notifyReporters(
      targetIssue.reporters, 
      user._id, 
      targetIssue._id, 
      'LINKED', 
      `${targetIssue.reportCount} students have now reported this issue.`
    );

    return { outcome: 'LINKED', issue: targetIssue, report };
  }

  // Handle new issue creation
  const candidates = await findCandidates({ category: issueData.category, location, description: issueData.description });
  const possiblyRelated = candidates.map(c => ({ issue: c.issue._id, score: c.score }));

  // Check for recurrence
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const recentResolved = await Issue.find({
    category: issueData.category,
    status: 'RESOLVED',
    location: location._id,
    resolvedAt: { $gte: thirtyDaysAgo }
  }).lean();

  let recurrenceOf = null;
  for (const resolvedIssue of recentResolved) {
    const sim = similarity({ category: issueData.category, location, description: issueData.description }, resolvedIssue);
    if (sim.score >= 0.75) {
      recurrenceOf = resolvedIssue._id;
      break;
    }
  }

  const depCode = CATEGORY_TO_DEPARTMENT_CODE[issueData.category];
  const department = await Department.findOne({ code: depCode });

  const priority = computePriority({
    description: issueData.description,
    category: issueData.category,
    location
  });

  const code = await getNextSequence('issue');
  const keywords = Array.from(normalize(issueData.description));
  const title = issueData.description.substring(0, 80);

  const issue = new Issue({
    code,
    title,
    description: issueData.description,
    category: issueData.category,
    location: location._id,
    locationSnapshot: {
      building: location.building,
      floor: location.floor,
      area: location.area,
      label: location.label
    },
    keywords,
    photos: photoUrls,
    priority,
    reporters: [user._id],
    suggestedDepartment: department?._id,
    possiblyRelated,
    recurrenceOf,
    timeline: [{
      type: TIMELINE_TYPES.CREATED,
      actor: { id: user._id, name: user.name, role: user.role }
    }]
  });

  // Temporarily bypass primaryReport for save
  issue.primaryReport = issue._id; 
  await issue.save();

  const decision = candidates.length > 0 ? 'IGNORED_SUGGESTION' : 'NEW';

  let dedupePayload = { decision };
  if (candidates.length > 0) {
    const topCandidate = candidates[0];
    dedupePayload = {
      score: topCandidate.score,
      band: topCandidate.band,
      matchedIssue: topCandidate.issue._id,
      decision,
      breakdown: topCandidate.breakdown
    };
  }

  const report = await Report.create({
    issue: issue._id,
    reporter: user._id,
    description: issueData.description,
    category: issueData.category,
    location: location._id,
    photos: photoUrls,
    isPrimary: true,
    dedupe: dedupePayload
  });

  issue.primaryReport = report._id;
  await issue.save();

  return { outcome: 'CREATED', issue, report };
};

export const getMyIssues = async (userId, query) => {
  const { status, page = 1, limit = 10 } = query;
  
  const filter = { reporters: userId };
  if (status) filter.status = status;

  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Issue.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('location', 'label')
      .lean(),
    Issue.countDocuments(filter)
  ]);

  return { items, total, page: Number(page) };
};

export const getIssueById = async (user, issueId) => {
  const issue = await Issue.findById(issueId)
    .populate('location')
    .populate('department')
    .populate('suggestedDepartment')
    .lean();

  if (!issue) throw new ApiError(404, 'Issue not found');

  const isStudent = user.role === 'STUDENT';
  const isReporter = issue.reporters.map(id => id.toString()).includes(user._id.toString());

  if (isStudent && !isReporter) {
    throw new ApiError(403, 'Access denied. You are not a reporter for this issue.');
  }

  const reports = await Report.find({ issue: issueId }).populate('reporter', 'name role').lean();

  if (isStudent) {
    reports.forEach(r => {
      if (r.reporter._id.toString() !== user._id.toString()) {
        r.reporter.name = 'Anonymous Student';
      }
    });

    issue.timeline = issue.timeline.filter(t => t.visibleToStudent !== false);
  }

  return { issue, reports, timeline: issue.timeline };
};

export const provideFeedback = async (user, issueId, action) => {
  const issue = await Issue.findById(issueId).populate('location');
  if (!issue) throw new ApiError(404, 'Issue not found');

  if (!issue.reporters.map(id => id.toString()).includes(user._id.toString())) {
    throw new ApiError(403, 'Only reporters can provide feedback');
  }

  if (issue.status !== 'RESOLVED') {
    throw new ApiError(400, 'Feedback can only be provided on resolved issues');
  }

  if (action === 'CONFIRM') {
    issue.status = 'CLOSED';
    issue.closedAt = new Date();
    issue.timeline.push({
      type: TIMELINE_TYPES.STATUS,
      note: 'Student confirmed resolution. Issue closed.',
      actor: { id: user._id, name: user.name, role: user.role }
    });
  } else if (action === 'REOPEN') {
    issue.status = 'IN_PROGRESS';
    issue.resolvedAt = undefined;
    
    // Recompute priority age component since it's reopened
    issue.priority = computePriority({
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

    issue.timeline.push({
      type: TIMELINE_TYPES.STATUS,
      note: 'Student reported issue is not resolved. Reopened.',
      actor: { id: user._id, name: user.name, role: user.role }
    });
  } else {
    throw new ApiError(400, 'Invalid feedback action');
  }

  await issue.save();
  return issue;
};

export const getPublicIssues = async (query) => {
  const { page = 1, limit = 50 } = query;
  
  const skip = (page - 1) * limit;
  const filter = { status: { $ne: 'CLOSED' } };

  const [items, total] = await Promise.all([
    Issue.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('location', 'label building area')
      .populate('department', 'name')
      .lean(),
    Issue.countDocuments(filter)
  ]);

  return { items, total, page: Number(page) };
};
