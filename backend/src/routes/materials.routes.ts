import { Router } from 'express';
import { asyncHandler } from '../utils/helpers';
import { validate } from '../middleware/validate';
import { uploadOptional } from '../config/multer';
import { materialsController, filesController } from '../controllers/files.controller';
import {
  idParamSchema,
  materialCreateSchema,
  materialListQuerySchema,
  materialUpdateSchema,
  paginationSchema,
} from '../validators/schemas';

export const materialsRouter = Router();

materialsRouter.get(
  '/',
  validate(materialListQuerySchema, 'query'),
  asyncHandler(materialsController.list)
);
materialsRouter.get(
  '/:id/related',
  validate(idParamSchema, 'params'),
  asyncHandler(materialsController.related)
);
materialsRouter.get('/:id', validate(idParamSchema, 'params'), asyncHandler(materialsController.get));
materialsRouter.post('/', uploadOptional, asyncHandler(materialsController.create));
materialsRouter.patch(
  '/:id',
  validate(idParamSchema, 'params'),
  uploadOptional,
  asyncHandler(materialsController.update)
);
materialsRouter.delete('/:id', validate(idParamSchema, 'params'), asyncHandler(materialsController.remove));

export const filesRouter = Router();

filesRouter.get('/', asyncHandler(filesController.list));
filesRouter.post('/', uploadOptional, asyncHandler(filesController.upload));
filesRouter.get('/:id', validate(idParamSchema, 'params'), asyncHandler(filesController.get));
filesRouter.get('/:id/raw', validate(idParamSchema, 'params'), asyncHandler(filesController.raw));
filesRouter.delete('/:id', validate(idParamSchema, 'params'), asyncHandler(filesController.remove));

export const fileUploadRouter = Router();
fileUploadRouter.post('/upload', uploadOptional, asyncHandler(filesController.upload));
