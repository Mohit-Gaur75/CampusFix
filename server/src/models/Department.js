import mongoose from 'mongoose';
import { CATEGORIES } from '../utils/constants.js';

const departmentSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  code: { type: String, required: true, unique: true },
  categories: [{ 
    type: String,
    enum: Object.values(CATEGORIES),
    required: true
  }],
  staff: [{
    name: { type: String },
    phone: { type: String }
  }]
}, {
  timestamps: true
});

departmentSchema.index({ code: 1 }, { unique: true });

export const Department = mongoose.model('Department', departmentSchema);
