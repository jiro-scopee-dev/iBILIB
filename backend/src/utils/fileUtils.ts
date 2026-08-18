import path from 'path';
import crypto from 'crypto';
import fs from 'fs';
import { ApiError } from '../middleware/errorHandler';

export const ALLOWED_EXTENSIONS = [
  'pdf',
  'doc',
  'docx',
  'ppt',
  'pptx',
  'xls',
  'xlsx',
  'png',
  'jpg',
  'jpeg',
];

export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/png',
  'image/jpeg',
];

export function getExtension(filename: string): string {
  const ext = path.extname(filename).replace('.', '').toLowerCase();
  return ext;
}

export function isAllowedFile(filename: string): boolean {
  return ALLOWED_EXTENSIONS.includes(getExtension(filename));
}

export function assertAllowedFile(filename: string): void {
  if (!isAllowedFile(filename)) {
    throw new ApiError(415, `Unsupported file type ".${getExtension(filename)}". Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`);
  }
}

/** Generates a collision-free stored filename, keeping the original extension. */
export function generateStoredFilename(originalFilename: string): string {
  const ext = getExtension(originalFilename);
  const base = crypto.randomBytes(8).toString('hex');
  return `${Date.now()}-${base}.${ext}`;
}

/** Resolves an absolute path for a stored file given the uploads directory. */
export function resolveUploadPath(uploadDir: string, filename: string): string {
  return path.join(uploadDir, path.basename(filename));
}

export function ensureDir(dir: string): void {
  fs.mkdirSync(dir, { recursive: true });
}

export function deleteFileIfExists(filePath: string): void {
  try {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch (err) {
    console.error('Failed to delete file from disk:', filePath, err);
  }
}

export function normalizeExtension(mimeType: string): string {
  if (mimeType === 'application/pdf') return 'pdf';
  if (mimeType.includes('msword')) return 'doc';
  if (mimeType.includes('wordprocessingml')) return 'docx';
  if (mimeType.includes('ms-powerpoint')) return 'ppt';
  if (mimeType.includes('presentationml')) return 'pptx';
  if (mimeType.includes('ms-excel')) return 'xls';
  if (mimeType.includes('spreadsheetml')) return 'xlsx';
  if (mimeType === 'image/png') return 'png';
  if (mimeType === 'image/jpeg') return 'jpg';
  return 'bin';
}
