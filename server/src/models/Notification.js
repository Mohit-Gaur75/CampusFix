import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  issue: { type: mongoose.Schema.Types.ObjectId, ref: 'Issue', required: true },
  type: { 
    type: String, 
    required: true,
    enum: ['STATUS_CHANGED', 'ASSIGNED', 'REMARK', 'LINKED', 'PRIORITY_CHANGED']
  },
  message: { type: String, required: true },
  read: { type: Boolean, default: false }
}, {
  timestamps: true // adds createdAt, updatedAt
});

notificationSchema.index({ user: 1, read: 1, createdAt: -1 });

export const Notification = mongoose.model('Notification', notificationSchema);
