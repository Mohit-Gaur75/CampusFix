import mongoose from 'mongoose';
import { ZONE_TYPES } from '../utils/constants.js';

const locationSchema = new mongoose.Schema({
  building: { type: String, required: true },
  floor: { type: String, required: true },
  area: { type: String, required: true },
  zoneType: { 
    type: String, 
    required: true,
    enum: Object.values(ZONE_TYPES)
  },
  criticality: { 
    type: Number, 
    required: true,
    min: 1,
    max: 5
  },
  label: { type: String }
}, {
  timestamps: true
});

locationSchema.index({ building: 1, floor: 1, area: 1 }, { unique: true });

locationSchema.pre('save', function(next) {
  if (this.building && this.floor && this.area) {
    this.label = `${this.building} • ${this.floor} • ${this.area}`;
  }
  next();
});

export const Location = mongoose.model('Location', locationSchema);
