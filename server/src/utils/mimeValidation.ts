import { ALLOWED_MIME_TYPES, ALLOWED_EXTENSIONS } from '@adoption/shared/constants/documentTypes';
import path from 'path';

export function isValidFileExtension(filename: string): boolean {
  const ext = path.extname(filename).toLowerCase();
  return ALLOWED_EXTENSIONS.includes(ext as any);
}

export function isValidMimeType(mimeType: string): boolean {
  return ALLOWED_MIME_TYPES.includes(mimeType as any);
}

export function validateFile(filename: string, mimeType: string): { valid: boolean; error?: string } {
  if (!isValidFileExtension(filename)) {
    return {
      valid: false,
      error: 'File must be a PDF, DOCX, DOC, JPG, JPEG, PNG, or TIFF'
    };
  }

  if (!isValidMimeType(mimeType)) {
    return {
      valid: false,
      error: 'Invalid file type'
    };
  }

  return { valid: true };
}
