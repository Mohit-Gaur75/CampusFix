import * as issueService from '../services/issue.service.js';
import * as uploadService from '../services/upload.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const suggestCategory = asyncHandler(async (req, res) => {
  const result = issueService.suggestCategory(req.body.description);
  res.status(200).json({ success: true, data: result });
});

export const checkDuplicates = asyncHandler(async (req, res) => {
  const { category, locationId, description } = req.body;
  const result = await issueService.checkDuplicates(category, locationId, description);
  res.status(200).json({ success: true, data: result });
});

export const createIssue = asyncHandler(async (req, res) => {
  // Use upload service to upload files to Cloudinary/Local
  const photoUrls = await uploadService.uploadFiles(req.files);
  
  const result = await issueService.createIssue(req.user, req.body, photoUrls);
  res.status(201).json({ success: true, data: result });
});

export const getMyIssues = asyncHandler(async (req, res) => {
  const result = await issueService.getMyIssues(req.user._id, req.query);
  res.status(200).json({ success: true, data: result });
});

export const getIssueById = asyncHandler(async (req, res) => {
  const result = await issueService.getIssueById(req.user, req.params.id);
  res.status(200).json({ success: true, data: result });
});

export const provideFeedback = asyncHandler(async (req, res) => {
  const result = await issueService.provideFeedback(req.user, req.params.id, req.body.action);
  res.status(200).json({ success: true, data: result });
});

export const getPublicIssues = asyncHandler(async (req, res) => {
  const result = await issueService.getPublicIssues(req.query);
  res.status(200).json({ success: true, data: result });
});
