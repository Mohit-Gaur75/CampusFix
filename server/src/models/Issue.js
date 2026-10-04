import mongoose from 'mongoose';
import { CATEGORIES, STATUSES, PRIORITY_LEVELS, TIMELINE_TYPES } from '../utils/constants.js';

const issueSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { 
    type: String, 
    required: true,
    enum: Object.values(CATEGORIES)
  },
  location: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true },
  locationSnapshot: {
    building: { type: String, required: true },
    floor: { type: String, required: true },
    area: { type: String, required: true },
    label: { type: String, required: true }
  },
  keywords: [{ type: String }],
  photos: [{ type: String }],
  status: { 
    type: String, 
    required: true,
    enum: Object.values(STATUSES),
    default: STATUSES.REPORTED
  },
  priority: {
    score: { type: Number, required: true },
    level: { type: String, required: true, enum: Object.values(PRIORITY_LEVELS) },
    breakdown: {
      safety: { type: Number },
      affected: { type: Number },
      location: { type: Number },
      category: { type: Number },
      age: { type: Number }
    },
    overridden: { type: Boolean, default: false },
    overrideReason: { type: String }
  },
  reportCount: { type: Number, required: true, default: 1 },
  reporters: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  primaryReport: { type: mongoose.Schema.Types.ObjectId, ref: 'Report', required: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  suggestedDepartment: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  assignedStaff: { type: String },
  possiblyRelated: [{
    issue: { type: mongoose.Schema.Types.ObjectId, ref: 'Issue' },
    score: { type: Number }
  }],
  mergedInto: { type: mongoose.Schema.Types.ObjectId, ref: 'Issue' },
  recurrenceOf: { type: mongoose.Schema.Types.ObjectId, ref: 'Issue' },
  timeline: [{
    type: { type: String, required: true, enum: Object.values(TIMELINE_TYPES) },
    fromStatus: { type: String, enum: Object.values(STATUSES) },
    toStatus: { type: String, enum: Object.values(STATUSES) },
    note: { type: String },
    visibleToStudent: { type: Boolean, default: true },
    actor: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      name: { type: String },
      role: { type: String }
    },
    at: { type: Date, default: Date.now }
  }],
  resolvedAt: { type: Date },
  closedAt: { type: Date }
}, {
  timestamps: true // adds createdAt, updatedAt
});

issueSchema.index({ code: 1 }, { unique: true });
issueSchema.index({ status: 1, 'priority.score': -1 }); // priority queue
issueSchema.index({ location: 1, category: 1, status: 1 }); // duplicate lookup
issueSchema.index({ createdAt: -1 });
issueSchema.index({ reporters: 1 });
issueSchema.index({ title: 'text', description: 'text' }); // search

export const Issue = mongoose.model('Issue', issueSchema);
