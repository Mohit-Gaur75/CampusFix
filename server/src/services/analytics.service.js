import { Issue } from '../models/Issue.js';

export const getOverview = async (days) => {
  const issues = await Issue.find({ mergedInto: null }).populate('location').lean();
  const now = new Date();
  
  const summary = {
    total: issues.length,
    open: 0,
    inProgress: 0,
    resolved: 0,
    critical: 0,
    avgResolutionHours: 0,
    overdueCount: 0
  };

  const byCategory = {};
  const byStatus = {};
  const byBuilding = {};
  const hotspotsMap = {};
  
  let totalResolvedHours = 0;
  let resolvedCountWithTime = 0;

  issues.forEach(issue => {
    const isOpen = ['REPORTED', 'ASSIGNED', 'IN_PROGRESS'].includes(issue.status);
    const isResolved = ['RESOLVED', 'CLOSED'].includes(issue.status);

    // byStatus
    byStatus[issue.status] = (byStatus[issue.status] || 0) + 1;

    // byBuilding
    const building = issue.location?.building || issue.locationSnapshot?.building || 'Unknown';
    byBuilding[building] = (byBuilding[building] || 0) + 1;

    if (isOpen) {
      summary.open++;
      if (issue.status === 'IN_PROGRESS') summary.inProgress++;
      if (issue.priority?.level === 'CRITICAL') summary.critical++;
      
      const ageHours = (now - new Date(issue.createdAt)) / (1000 * 60 * 60);
      if (ageHours > 7 * 24) summary.overdueCount++;

      // byCategory only tracks open issues as per typical dashboards, but let's do all time or just open.
      // "byCategory: Open issue counts by category" -> strictly open issues
      byCategory[issue.category] = (byCategory[issue.category] || 0) + 1;
    }

    if (isResolved) {
      summary.resolved++;
      if (issue.resolvedAt) {
        const hours = (new Date(issue.resolvedAt) - new Date(issue.createdAt)) / (1000 * 60 * 60);
        totalResolvedHours += hours;
        resolvedCountWithTime++;
      }
    }

    // Hotspots grouping
    if (issue.location) {
      const locId = issue.location._id.toString();
      if (!hotspotsMap[locId]) {
        hotspotsMap[locId] = {
          location: issue.location,
          total: 0,
          openCount: 0,
          issues: []
        };
      }
      hotspotsMap[locId].total++;
      if (isOpen) hotspotsMap[locId].openCount++;
      hotspotsMap[locId].issues.push(issue);
    }
  });

  if (resolvedCountWithTime > 0) {
    summary.avgResolutionHours = Math.round(totalResolvedHours / resolvedCountWithTime);
  }

  // Calculate hotspots recurrences and sort
  const hotspots = Object.values(hotspotsMap).map(loc => {
    let recurrences = 0;
    const catCounts = {};

    loc.issues.forEach(issue => {
      if (issue.recurrenceOf) {
        recurrences++;
      }
      catCounts[issue.category] = (catCounts[issue.category] || 0) + 1;
    });

    // Add issues that are part of >=2 same category (excluding those already counted by recurrenceOf if we want to be strict, but prompt says "recurrences = issues with recurrenceOf or >=2 issues same category")
    let categoryRecurrences = 0;
    Object.values(catCounts).forEach(count => {
      if (count >= 2) categoryRecurrences += count;
    });
    
    // We just take the max to avoid double counting if an issue is both
    recurrences = Math.max(recurrences, categoryRecurrences);

    return {
      location: {
        id: loc.location._id,
        label: loc.location.label,
        building: loc.location.building
      },
      total: loc.total,
      openCount: loc.openCount,
      recurrences
    };
  })
  .sort((a, b) => b.total - a.total)
  .slice(0, 5);

  // Trend mapping
  const trendMap = {};
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(now.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    trendMap[dateStr] = { date: dateStr, created: 0, resolved: 0 };
  }

  const cutoff = new Date();
  cutoff.setDate(now.getDate() - days);

  issues.forEach(issue => {
    const createdStr = new Date(issue.createdAt).toISOString().split('T')[0];
    if (trendMap[createdStr] && new Date(issue.createdAt) >= cutoff) {
      trendMap[createdStr].created++;
    }

    if (issue.resolvedAt) {
      const resolvedStr = new Date(issue.resolvedAt).toISOString().split('T')[0];
      if (trendMap[resolvedStr] && new Date(issue.resolvedAt) >= cutoff) {
        trendMap[resolvedStr].resolved++;
      }
    }
  });

  const trend = Object.values(trendMap).sort((a, b) => a.date.localeCompare(b.date));

  // Aging (oldest 5 unresolved)
  const aging = issues
    .filter(i => ['REPORTED', 'ASSIGNED', 'IN_PROGRESS'].includes(i.status))
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    .slice(0, 5)
    .map(i => ({
      id: i._id,
      code: i.code,
      title: i.title,
      status: i.status,
      priority: i.priority,
      createdAt: i.createdAt,
      daysOpen: Math.floor((now - new Date(i.createdAt)) / (1000 * 60 * 60 * 24))
    }));

  return {
    summary,
    byCategory,
    byStatus,
    byBuilding,
    hotspots,
    trend,
    aging
  };
};
