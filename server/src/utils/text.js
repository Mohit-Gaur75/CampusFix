import { PHRASE_MAP, STOPWORDS } from './constants.js';

export const normalize = (text) => {
  if (!text) return new Set();
  
  let t = text.toLowerCase().replace(/[^a-z0-9\s-]/g, ' ');
  
  for (const [pattern, canon] of PHRASE_MAP) {
    t = t.replace(pattern, canon);
  }
  
  const tokens = t.split(/\s+/).filter(w => w && !STOPWORDS.has(w));
  return new Set(tokens);
};
