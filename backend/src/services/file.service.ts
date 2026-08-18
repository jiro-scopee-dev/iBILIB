import fs from 'fs';
import path from 'path';
import { env } from '../config/env';
import { ApiError } from '../middleware/errorHandler';
import { fileRepository } from '../repositories/file.repository';
import { deleteFileIfExists } from '../utils/fileUtils';

/**
 * Creates a File record from a multer-uploaded file.
 * The file has already been stored on disk by multer.
 */
async function createFromUpload(uploaded: Express.Multer.File) {
  const storedDir = path.basename(env.uploadDir);
  try {
    const file = await fileRepository.create({
      filename: uploaded.filename,
      originalFilename: uploaded.originalname,
      fileType: uploaded.mimetype,
      fileSize: uploaded.size,
      path: `${storedDir}/${uploaded.filename}`,
    });
    return file;
  } catch (err) {
    deleteFileIfExists(path.join(env.uploadDir, uploaded.filename));
    throw err;
  }
}

/** Deletes a File record and its file from disk. */
async function remove(fileId: number) {
  const file = await fileRepository.findById(fileId);
  if (!file) throw new ApiError(404, 'File not found');
  await fileRepository.delete(fileId);
  deleteFileIfExists(`${env.uploadDir}/${file.filename}`);
  return file;
}

/** Removes a file from disk by its stored filename (no DB record involved). */
function removeFromDisk(filename: string) {
  deleteFileIfExists(path.join(env.uploadDir, filename));
}

async function getById(fileId: number) {
  const file = await fileRepository.findById(fileId);
  if (!file) throw new ApiError(404, 'File not found');
  return file;
}

async function list() {
  return fileRepository.findAll();
}

/** Reads the file bytes from disk (used for streaming responses). */
function readFromDisk(file: { filename: string; fileSize: number }) {
  const abs = path.join(env.uploadDir, file.filename);
  if (!fs.existsSync(abs)) throw new ApiError(404, 'File missing on disk');
  return abs;
}

export const fileService = {
  createFromUpload,
  remove,
  removeFromDisk,
  getById,
  list,
  readFromDisk,
};

export const createFileFromUpload = (uploaded: Express.Multer.File) => createFromUpload(uploaded);
export const deleteFile = (fileId: number) => remove(fileId);
export const deleteFileFromDisk = (filename: string) => removeFromDisk(filename);
