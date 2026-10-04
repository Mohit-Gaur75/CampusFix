import { Notification } from '../models/Notification.js';

export const createNotification = async (userId, issueId, type, message) => {
  return Notification.create({
    user: userId,
    issue: issueId,
    type,
    message
  });
};

export const notifyReporters = async (reporters, excludeUserId, issueId, type, message) => {
  const promises = reporters
    .filter(id => id.toString() !== excludeUserId.toString())
    .map(id => createNotification(id, issueId, type, message));
  
  return Promise.all(promises);
};
