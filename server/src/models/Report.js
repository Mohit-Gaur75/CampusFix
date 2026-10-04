import mongoose from 'mongoose';
import { CATEGORIES } from '../utils/constants.js';

const reportSchema = new mongoose.Schema({
  issue: { type: mongoose.Schema.Types.ObjectId, ref: 'Issue', required: true },
  reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  description: { type: String, required: true, minlength: 10, maxlength: 500 },
  category: { 
    type: String, 
    required: true,
    enum: Object.values(CATEGORIES)
  },
  location: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true },
  photos: [{ type: String }],
  isPrimary: { type: Boolean, required: true },
  dedupe: {
    score: { type: Number },
    band: { type: String, enum: ['PROBABLE', 'RELATED', 'NONE'] },
    matchedIssue: { type: mongoose.Schema.Types.ObjectId, ref: 'Issue' },
    decision: { type: String, enum: ['NEW', 'LINKED_BY_USER', 'IGNORED_SUGGESTION'] },
    breakdown: {
      category: { type: Number },
      location: { type: Number },
      keyword: { type: Number }
    }
  }
}, {
  timestamps: true // adds createdAt, updatedAt
});

reportSchema.index({ issue: 1, createdAt: 1 });
reportSchema.index({ reporter: 1, createdAt: -1 });
reportSchema.index({ issue: 1, reporter: 1 }, { unique: true });

export const Report = mongoose.model('Report', reportSchema);
