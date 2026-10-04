import { CATEGORY_WEIGHTS, SEVERE_KEYWORDS, MODERATE_KEYWORDS, PRIORITY_LEVELS } from '../utils/constants.js';

export const levelFromScore = (score) => {
  if (score >= 65) return PRIORITY_LEVELS.CRITICAL;
  if (score >= 45) return PRIORITY_LEVELS.HIGH;
  if (score >= 25) return PRIORITY_LEVELS.MEDIUM;
  return PRIORITY_LEVELS.LOW;
};

export const computePriority = ({ description, category, location, reportCount = 1, createdAt = new Date(), status = 'REPORTED', now = new Date(), overridden = false, overriddenLevel = null }) => {
  let safety = 0;
  const descLower = description.toLowerCase();
  
  if (SEVERE_KEYWORDS.some(kw => descLower.includes(kw))) {
    safety = 35;
  } else if (MODERATE_KEYWORDS.some(kw => descLower.includes(kw))) {
    safety = 15;
  }

  const affected = Math.min(25, 3 + (reportCount - 1) * 7);
  const locationScore = location.criticality * 3;
  const categoryScore = CATEGORY_WEIGHTS[category] || 4; // Fallback to OTHER weight
  
  let age = 0;
  if (!['RESOLVED', 'CLOSED', 'REJECTED'].includes(status)) {
    const daysOpen = Math.floor((now - new Date(createdAt)) / (1000 * 60 * 60 * 24));
    age = Math.min(15, Math.max(0, daysOpen) * 3);
  }

  const score = Math.min(100, safety + affected + locationScore + categoryScore + age);
  const level = overridden && overriddenLevel ? overriddenLevel : levelFromScore(score);

  return {
    score,
    level,
    overridden,
    overrideReason: overridden ? undefined : null, // Preserve reason outside
    breakdown: {
      safety,
      affected,
      location: locationScore,
      category: categoryScore,
      age
    }
  };
};
