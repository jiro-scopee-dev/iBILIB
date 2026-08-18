import { categoryService } from '../services/category.service';

export const categoriesController = {
  async list(_req: any, res: any) {
    res.json(await categoryService.list());
  },
  async create(req: any, res: any) {
    res.status(201).json(await categoryService.create(req.validatedBody));
  },
  async update(req: any, res: any) {
    res.json(await categoryService.update(Number(req.params.id), req.validatedBody));
  },
  async remove(req: any, res: any) {
    await categoryService.remove(Number(req.params.id));
    res.status(204).send();
  },
};
