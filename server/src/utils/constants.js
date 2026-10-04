export const ROLES = {
  STUDENT: 'STUDENT',
  AUTHORITY: 'AUTHORITY',
  ADMIN: 'ADMIN'
};

export const CATEGORIES = {
  ELECTRICAL: 'ELECTRICAL',
  PLUMBING: 'PLUMBING',
  NETWORK: 'NETWORK',
  SANITATION: 'SANITATION',
  FURNITURE: 'FURNITURE',
  STRUCTURAL: 'STRUCTURAL',
  EQUIPMENT: 'EQUIPMENT',
  OTHER: 'OTHER'
};

export const STATUSES = {
  REPORTED: 'REPORTED',
  ASSIGNED: 'ASSIGNED',
  IN_PROGRESS: 'IN_PROGRESS',
  RESOLVED: 'RESOLVED',
  CLOSED: 'CLOSED',
  REJECTED: 'REJECTED'
};

export const PRIORITY_LEVELS = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL'
};

export const ZONE_TYPES = {
  CLASSROOM: 'CLASSROOM',
  LAB: 'LAB',
  LIBRARY: 'LIBRARY',
  HOSTEL: 'HOSTEL',
  MESS: 'MESS',
  COMMON: 'COMMON',
  SPORTS: 'SPORTS'
};

export const TIMELINE_TYPES = {
  CREATED: 'CREATED',
  REPORT_LINKED: 'REPORT_LINKED',
  ASSIGNED: 'ASSIGNED',
  STATUS: 'STATUS',
  PRIORITY: 'PRIORITY',
  REMARK: 'REMARK',
  MERGED: 'MERGED'
};

export const CATEGORY_WEIGHTS = {
  ELECTRICAL: 10,
  PLUMBING: 12,
  NETWORK: 10,
  SANITATION: 12,
  STRUCTURAL: 14,
  EQUIPMENT: 8,
  FURNITURE: 4,
  OTHER: 4
};

export const CATEGORY_TO_DEPARTMENT_CODE = {
  ELECTRICAL: 'ELEC',
  PLUMBING: 'PLUMB',
  NETWORK: 'IT',
  EQUIPMENT: 'IT',
  SANITATION: 'HK',
  STRUCTURAL: 'CIVIL',
  FURNITURE: 'CIVIL',
  OTHER: 'ESTATE'
};

export const ALLOWED_TRANSITIONS = {
  REPORTED: ['ASSIGNED', 'REJECTED', 'IN_PROGRESS', 'RESOLVED'],
  ASSIGNED: ['IN_PROGRESS', 'RESOLVED', 'REJECTED'],
  IN_PROGRESS: ['RESOLVED', 'REJECTED', 'ASSIGNED'],
  RESOLVED: ['CLOSED', 'IN_PROGRESS'],
  CLOSED: [],
  REJECTED: []
};

// Priority Safety Keywords
export const SEVERE_KEYWORDS = [
  'spark', 'sparking', 'short circuit', 'exposed wire', 'fire', 
  'smoke', 'shock', 'gas', 'flood', 'collapse', 'snake', 'glass'
];

export const MODERATE_KEYWORDS = [
  'leak', 'leakage', 'slippery', 'loose', 'wet', 
  'overflow', 'foul', 'mosquito'
];

// Duplicate Detection Normalization
export const PHRASE_MAP = [
  [/not working|broken|damaged|dead|fused|faulty|stopped|out of order|not functioning/g, 'fault'],
  [/wi-fi|wifi|internet|network|no signal/g, 'network'],
  [/tube light|tubelight|bulb|lamp|light/g, 'light'],
  [/leak|leaking|dripping|seepage/g, 'leak'],
  [/ceiling fan|fan/g, 'fan'],
  [/tap|faucet/g, 'tap'],
  [/toilet|washroom|restroom/g, 'washroom']
];

export const STOPWORDS = new Set([
  'the', 'a', 'is', 'in', 'at', 'of', 'on', 'and', 'there', 'it', 'my', 'our', 'near', 'to', 'very'
]);

export const CATEGORY_KEYWORDS = {
  ELECTRICAL: ['light', 'fan', 'switch', 'socket', 'spark', 'wire', 'power', 'shock', 'bulb'],
  PLUMBING: ['leak', 'water', 'tap', 'washroom', 'toilet', 'pipe', 'drain', 'flush', 'sink'],
  NETWORK: ['wifi', 'internet', 'network', 'router', 'connection'],
  SANITATION: ['smell', 'foul', 'clean', 'dirty', 'garbage', 'dustbin', 'sweep', 'mosquito'],
  FURNITURE: ['bench', 'chair', 'table', 'desk', 'bed', 'wardrobe', 'door', 'lock'],
  STRUCTURAL: ['ceiling', 'wall', 'floor', 'roof', 'window', 'glass', 'collapse', 'crack'],
  EQUIPMENT: ['projector', 'ac', 'computer', 'lab', 'treadmill', 'machine', 'printer', 'screen']
};
