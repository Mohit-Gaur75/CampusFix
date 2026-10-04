import mongoose from 'mongoose';
import { ROLES } from '../utils/constants.js';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true, select: false },
  role: { 
    type: String, 
    required: true, 
    enum: Object.values(ROLES) 
  },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  rollNo: { type: String },
  hostel: { type: String },
  phone: { type: String },
  isDemo: { type: Boolean }
}, {
  timestamps: true
});

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1 });

export const User = mongoose.model('User', userSchema);
