import { tagService } from '../services/tag.service';

export const tagsController = {
  async list(_req: any, res: any) {
    res.json(await tagService.list());
  },
  async create(req: any, res: any) {
    res.status(201).json(await tagService.create(req.validatedBody.name));
  },
  async update(req: any, res: any) {
    res.json(await tagService.update(Number(req.params.id), req.validatedBody.name));
  },
  async remove(req: any, res: any) {
    await tagService.remove(Number(req.params.id));
    res.status(204).send();
  },
};
