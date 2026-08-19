import multer from 'multer';
import { ApiError } from '../middleware/errorHandler';
import { ALLOWED_MIME_TYPES, assertAllowedFile } from '../utils/fileUtils';

const memoryStorage = multer.memoryStorage();

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
  storage: memoryStorage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
});

/** Optional single-file upload middleware (field "file"). Fails gracefully if no file. */
export const uploadOptional = upload.single('file');