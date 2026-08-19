import { env } from '../config/env';
import { ApiError } from '../middleware/errorHandler';
import { fileRepository } from '../repositories/file.repository';
import { removeStored, resolveStored, storeUpload } from '../utils/storage';

/**
 * Creates a File record from a multer-uploaded file (bytes in memory).
 * The bytes are persisted to disk (local) or Supabase Storage (supabase).
 */
async function createFromUpload(uploaded: Express.Multer.File) {
  const stored = await storeUpload({
    originalFilename: uploaded.originalname,
    mimetype: uploaded.mimetype,
    size: uploaded.size,
    buffer: uploaded.buffer,
  });
  return fileRepository.create({
    filename: stored.filename,
    originalFilename: uploaded.originalname,
    fileType: uploaded.mimetype,
    fileSize: uploaded.size,
    path: stored.path,
  });
}

/** Deletes a File record and its stored bytes. */
async function remove(fileId: number) {
  const file = await fileRepository.findById(fileId);
  if (!file) throw new ApiError(404, 'File not found');
  await fileRepository.delete(fileId);
  await removeStored(file.path);
  return file;
}

async function getById(fileId: number) {
  const file = await fileRepository.findById(fileId);
  if (!file) throw new ApiError(404, 'File not found');
  return file;
}

async function list() {
  return fileRepository.findAll();
}

/**
 * Resolves where the file bytes can be read from.
 * Returns a signed URL for the supabase backend, or an absolute local path.
 * Throws 404 when the file is missing from storage.
 */
async function readableLocation(file: { path: string }) {
  const location = await resolveStored(file.path);
  if (!location) throw new ApiError(404, 'File missing from storage');
  return location;
}

export const fileService = {
  createFromUpload,
  remove,
  getById,
  list,
  readableLocation,
  removeStoredFile: (storagePath: string) => removeStored(storagePath),
};

export const createFileFromUpload = (uploaded: Express.Multer.File) => createFromUpload(uploaded);
export const deleteFile = (fileId: number) => remove(fileId);
export const deleteFileFromDisk = (storagePath: string) => removeStored(storagePath);