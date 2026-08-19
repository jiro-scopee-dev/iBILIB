import fs from 'fs';
import path from 'path';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from '../config/env';
import { ApiError } from '../middleware/errorHandler';
import { deleteFileIfExists, ensureDir, generateStoredFilename } from './fileUtils';

interface UploadPayload {
  originalFilename: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

function getSupabase(): SupabaseClient {
  if (!env.supabaseUrl || !env.supabaseServiceRoleKey) {
    throw new ApiError(500, 'Supabase storage is not configured');
  }
  return createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
    auth: { persistSession: false },
  });
}

/**
 * Stores an uploaded file (bytes already in memory) and returns its stored
 * name plus a storage path. On 'local' backend this writes to env.uploadDir;
 * on 'supabase' it uploads to the configured storage bucket.
 */
export async function storeUpload(upload: UploadPayload): Promise<{ filename: string; path: string }> {
  const filename = generateStoredFilename(upload.originalFilename);

  if (env.storageBackend === 'supabase') {
    const { error } = await getSupabase()
      .storage.from(env.supabaseBucket)
      .upload(filename, upload.buffer, { contentType: upload.mimetype, upsert: false });
    if (error) throw new ApiError(500, `Failed to upload to storage: ${error.message}`);
    return { filename, path: `${env.supabaseBucket}/${filename}` };
  }

  ensureDir(env.uploadDir);
  fs.writeFileSync(path.join(env.uploadDir, filename), upload.buffer);
  return { filename, path: `${path.basename(env.uploadDir)}/${filename}` };
}

/** Deletes a stored file by its storage path (no DB record involved). */
export async function removeStored(storagePath: string): Promise<void> {
  const filename = path.basename(storagePath);
  if (env.storageBackend === 'supabase') {
    const { error } = await getSupabase().storage.from(env.supabaseBucket).remove([filename]);
    if (error) console.error('Failed to delete from storage:', error.message);
    return;
  }
  deleteFileIfExists(path.join(env.uploadDir, filename));
}

/**
 * Resolves where a stored file can be read from.
 * Returns a signed URL (http) for the supabase backend, or an absolute path
 * for the local backend. Returns null when the file is missing.
 */
export async function resolveStored(storagePath: string): Promise<string | null> {
  const filename = path.basename(storagePath);
  if (env.storageBackend === 'supabase') {
    const { data, error } = await getSupabase()
      .storage.from(env.supabaseBucket)
      .createSignedUrl(filename, 3600);
    if (error || !data) return null;
    return data.signedUrl;
  }
  const abs = path.join(env.uploadDir, filename);
  if (!fs.existsSync(abs)) return null;
  return abs;
}