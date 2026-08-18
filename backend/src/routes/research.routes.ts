import { Router } from 'express';
import { asyncHandler } from '../utils/helpers';
import { validate } from '../middleware/validate';
import { uploadOptional } from '../config/multer';
import { chaptersController, researchController } from '../controllers/research.controller';
import { categoriesController } from '../controllers/categories.controller';
import {
  categoryCreateSchema,
  categoryUpdateSchema,
  chapterCreateSchema,
  chapterIdParamSchema,
  chapterUpdateSchema,
  idParamSchema,
  researchCreateSchema,
  researchListQuerySchema,
  researchUpdateSchema,
} from '../validators/schemas';

export const researchRouter = Router();

// Research categories (static routes registered before /:id)
researchRouter.get('/categories', asyncHandler(categoriesController.list));
researchRouter.post('/categories', validate(categoryCreateSchema), asyncHandler(categoriesController.create));
researchRouter.patch(
  '/categories/:id',
  validate(idParamSchema, 'params'),
  validate(categoryUpdateSchema),
  asyncHandler(categoriesController.update)
);
researchRouter.delete(
  '/categories/:id',
  validate(idParamSchema, 'params'),
  asyncHandler(categoriesController.remove)
);

// Research chapters (child routes of research, before /:id)
researchRouter.get(
  '/:id/chapters',
  validate(idParamSchema, 'params'),
  asyncHandler(chaptersController.list)
);
researchRouter.post(
  '/:id/chapters',
  validate(idParamSchema, 'params'),
  uploadOptional,
  asyncHandler(chaptersController.create)
);
researchRouter.patch(
  '/chapters/:chapterId',
  validate(chapterIdParamSchema, 'params'),
  uploadOptional,
  asyncHandler(chaptersController.update)
);
researchRouter.delete(
  '/chapters/:chapterId',
  validate(chapterIdParamSchema, 'params'),
  asyncHandler(chaptersController.remove)
);

// Main research routes
researchRouter.get(
  '/',
  validate(researchListQuerySchema, 'query'),
  asyncHandler(researchController.list)
);
researchRouter.get(
  '/:id/related',
  validate(idParamSchema, 'params'),
  asyncHandler(researchController.related)
);
researchRouter.get('/:id', validate(idParamSchema, 'params'), asyncHandler(researchController.get));
researchRouter.post('/', uploadOptional, asyncHandler(researchController.create));
researchRouter.patch(
  '/:id',
  validate(idParamSchema, 'params'),
  uploadOptional,
  asyncHandler(researchController.update)
);
researchRouter.delete('/:id', validate(idParamSchema, 'params'), asyncHandler(researchController.remove));
