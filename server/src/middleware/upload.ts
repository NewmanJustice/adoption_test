import multer from 'multer';
import { MAX_FILE_SIZE, MAX_BULK_UPLOAD } from '@adoption/shared/constants/documentTypes.js';
import { validateFile } from '../utils/mimeValidation.js';
import { Request, Response, NextFunction } from 'express';

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: MAX_BULK_UPLOAD
  },
  fileFilter: (req, file, cb) => {
    const validation = validateFile(file.originalname, file.mimetype);
    if (!validation.valid) {
      cb(new Error(validation.error || 'Invalid file'));
    } else {
      cb(null, true);
    }
  }
});

export function handleUploadError(err: any, req: Request, res: Response, next: NextFunction) {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File must be smaller than 20MB' });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ error: `Cannot upload more than ${MAX_BULK_UPLOAD} files at once` });
    }
    return res.status(400).json({ error: err.message });
  }
  
  if (err) {
    return res.status(400).json({ error: err.message });
  }
  
  next();
}
