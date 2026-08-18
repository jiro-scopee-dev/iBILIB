import { subjectService } from '../services/subject.service';

export const subjectsController = {
  async list(req: any, res: any) {
    const gradeId = req.query.gradeId ? Number(req.query.gradeId) : undefined;
    res.json(await subjectService.list({ gradeId }));
  },
  async get(req: any, res: any) {
    res.json(await subjectService.get(Number(req.params.id)));
  },
  async create(req: any, res: any) {
    res.status(201).json(await subjectService.create(req.validatedBody));
  },
  async update(req: any, res: any) {
    res.json(await subjectService.update(Number(req.params.id), req.validatedBody));
  },
  async remove(req: any, res: any) {
    await subjectService.remove(Number(req.params.id));
    res.status(204).send();
  },
};
