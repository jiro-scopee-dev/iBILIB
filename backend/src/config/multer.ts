import multer from 'multer';
import { ApiError } from '../middleware/errorHandler';
import { ALLOWED_MIME_TYPES, assertAllowedFile, ensureDir, generateStoredFilename } from '../utils/fileUtils';
import { env } from './env';

ensureDir(env.uploadDir);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, env.uploadDir),
  filename: (_req, file, cb) => {
    try {
      assertAllowedFile(file.originalname);
      cb(null, generateStoredFilename(file.originalname));
    } catch (err) {
      cb(err as Error, '');
    }
  },
});

const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const okMime = ALLOWED_MIME_TYPES.includes(file.mimetype);
  let okExt = false;
  try {
    assertAllowedFile(file.originalname);
    okExt = true;
  } catch {
    okExt = false;
  }
  if (okMime && okExt) return cb(null, true);
  return cb(new ApiError(415, `Unsupported file type. Allowed: pdf, doc, docx, ppt, pptx, xls, xlsx, png, jpg, jpeg`));
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
});

/** Optional single-file upload middleware (field "file"). Fails gracefully if no file. */
export const uploadOptional = upload.single('file');
