import { gradeService } from '../services/grade.service';

export const gradesController = {
  async list(_req: any, res: any) {
    res.json(await gradeService.list());
  },
  async get(req: any, res: any) {
    res.json(await gradeService.get(Number(req.params.id)));
  },
  async create(req: any, res: any) {
    res.status(201).json(await gradeService.create(req.validatedBody));
  },
  async update(req: any, res: any) {
    res.json(await gradeService.update(Number(req.params.id), req.validatedBody));
  },
  async remove(req: any, res: any) {
    await gradeService.remove(Number(req.params.id));
    res.status(204).send();
  },
};
