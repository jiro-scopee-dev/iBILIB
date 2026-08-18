import { Router } from 'express';
import { asyncHandler } from '../utils/helpers';
import { validate } from '../middleware/validate';
import { gradesController } from '../controllers/grades.controller';
import { subjectsController } from '../controllers/subjects.controller';
import { tagsController } from '../controllers/tags.controller';
import { searchController } from '../controllers/search.controller';
import { statsController } from '../controllers/stats.controller';
import {
  gradeCreateSchema,
  gradeUpdateSchema,
  idParamSchema,
  searchQuerySchema,
  statsRecordSchema,
  subjectCreateSchema,
  subjectUpdateSchema,
  tagCreateSchema,
  tagUpdateSchema,
} from '../validators/schemas';

export const catalogRouter = Router();

catalogRouter.get('/grades', asyncHandler(gradesController.list));
catalogRouter.get('/grades/:id', validate(idParamSchema, 'params'), asyncHandler(gradesController.get));
catalogRouter.post('/grades', validate(gradeCreateSchema), asyncHandler(gradesController.create));
catalogRouter.patch(
  '/grades/:id',
  validate(idParamSchema, 'params'),
  validate(gradeUpdateSchema),
  asyncHandler(gradesController.update)
);
catalogRouter.delete(
  '/grades/:id',
  validate(idParamSchema, 'params'),
  asyncHandler(gradesController.remove)
);

catalogRouter.get('/subjects', asyncHandler(subjectsController.list));
catalogRouter.get('/subjects/:id', validate(idParamSchema, 'params'), asyncHandler(subjectsController.get));
catalogRouter.post('/subjects', validate(subjectCreateSchema), asyncHandler(subjectsController.create));
catalogRouter.patch(
  '/subjects/:id',
  validate(idParamSchema, 'params'),
  validate(subjectUpdateSchema),
  asyncHandler(subjectsController.update)
);
catalogRouter.delete(
  '/subjects/:id',
  validate(idParamSchema, 'params'),
  asyncHandler(subjectsController.remove)
);

catalogRouter.get('/tags', asyncHandler(tagsController.list));
catalogRouter.post('/tags', validate(tagCreateSchema), asyncHandler(tagsController.create));
catalogRouter.patch(
  '/tags/:id',
  validate(idParamSchema, 'params'),
  validate(tagUpdateSchema),
  asyncHandler(tagsController.update)
);
catalogRouter.delete('/tags/:id', validate(idParamSchema, 'params'), asyncHandler(tagsController.remove));

catalogRouter.get('/search', validate(searchQuerySchema, 'query'), asyncHandler(searchController.search));

catalogRouter.post('/views', validate(statsRecordSchema), asyncHandler(statsController.view));
catalogRouter.post('/downloads', validate(statsRecordSchema), asyncHandler(statsController.download));
