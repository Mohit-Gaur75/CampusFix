import { normalize } from '../utils/text.js';

const round2 = (num) => Math.round(num * 100) / 100;

export const keywordSimilarity = (tokensA, tokensB) => {
  if (!tokensA || !tokensB || tokensA.size === 0 || tokensB.size === 0) return 0;
  
  let intersection = 0;
  for (const token of tokensA) {
    if (tokensB.has(token)) {
      intersection++;
    }
  }

  const union = tokensA.size + tokensB.size - intersection;
  return union === 0 ? 0 : intersection / union;
};

export const locationScore = (locA, locB) => {
  if (locA._id && locB._id && locA._id.toString() === locB._id.toString()) return 1.0;
  if (locA.building === locB.building && locA.floor === locB.floor) return 0.6;
  if (locA.building === locB.building) return 0.3;
  return 0;
};

export const similarity = (input, issue) => {
  const c = input.category === issue.category ? 1 : 0;
  const l = locationScore(input.location, issue.location);
  
  const inputTokens = normalize(input.description);
  // issue.keywords is an array of strings in DB, convert to Set
  const issueTokens = new Set(issue.keywords || []);
  
  const k = keywordSimilarity(inputTokens, issueTokens);
  
  let score = 0.25 * c + 0.35 * l + 0.40 * k;
  
  if (!c || k === 0) score = Math.min(score, 0.49);
  if (l < 0.6) score = Math.min(score, 0.74);
  
  const finalScore = round2(score);
  
  let band = 'NONE';
  if (finalScore >= 0.75) band = 'PROBABLE';
  else if (finalScore >= 0.50) band = 'RELATED';
  
  return {
    score: finalScore,
    band,
    breakdown: { category: c, location: l, keyword: round2(k) }
  };
};
