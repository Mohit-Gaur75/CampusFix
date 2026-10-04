import multer from 'multer';
import streamifier from 'streamifier';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import cloudinary from '../config/cloudinary.js';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError(415, 'Invalid file type. Only JPEG, PNG, and WebP are allowed.'));
  }
};

export const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5 MB
}).array('photos', 3);

export const uploadFiles = async (files) => {
  if (!files || files.length === 0) return [];

  const uploadPromises = files.map(file => {
    return new Promise(async (resolve, reject) => {
      if (env.STORAGE_DRIVER === 'cloudinary') {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'campusfix' },
          (error, result) => {
            if (error) reject(new ApiError(500, 'Cloudinary upload failed'));
            else resolve(result.secure_url);
          }
        );
        streamifier.createReadStream(file.buffer).pipe(stream);
      } else {
        try {
          const ext = file.mimetype.split('/')[1];
          const filename = `${uuidv4()}.${ext}`;
          const uploadDir = path.join(process.cwd(), 'uploads');
          
          await fs.mkdir(uploadDir, { recursive: true });
          const filePath = path.join(uploadDir, filename);
          
          await fs.writeFile(filePath, file.buffer);
          resolve(`/uploads/${filename}`);
        } catch (error) {
          reject(new ApiError(500, 'Local file upload failed'));
        }
      }
    });
  });

  return Promise.all(uploadPromises);
};
