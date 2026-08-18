import { ApiError } from '../middleware/errorHandler';
import { fileService } from '../services/file.service';
import { materialService } from '../services/material.service';
import { parseListField } from '../utils/helpers';

function materialInputFromRequest(req: any): any {
  const body = req.body ?? {};
  return {
    title: body.title || undefined,
    description: body.description ?? undefined,
    topic: body.topic ?? undefined,
    author: body.author ?? undefined,
    gradeId: body.gradeId !== undefined ? Number(body.gradeId) : undefined,
    subjectId: body.subjectId !== undefined ? Number(body.subjectId) : undefined,
    tags: body.tags !== undefined ? parseListField(body.tags) : undefined,
    fileId: body.fileId ? Number(body.fileId) : undefined,
    uploadedFile: req.file ?? null,
  };
}

export const materialsController = {
  async list(req: any, res: any) {
    const q = req.validatedQuery;
    const filters: any = {
      gradeId: q.gradeId,
      subjectId: q.subjectId,
      tag: q.tag,
      q: q.q,
    };
    if (q.grade && !filters.gradeId) {
      const grade = await materialService.findGradeByLevel(q.grade);
      filters.gradeId = grade?.id;
    }
    res.json(await materialService.list({ filters, sort: q.sort, page: q.page, limit: q.limit }));
  },

  async get(req: any, res: any) {
    res.json(await materialService.get(Number(req.params.id)));
  },

  async related(req: any, res: any) {
    const limit = req.query.limit ? Number(req.query.limit) : 6;
    res.json(await materialService.related(Number(req.params.id), limit));
  },

  async create(req: any, res: any) {
    res.status(201).json(await materialService.create(materialInputFromRequest(req)));
  },

  async update(req: any, res: any) {
    res.json(await materialService.update(Number(req.params.id), materialInputFromRequest(req)));
  },

  async remove(req: any, res: any) {
    await materialService.remove(Number(req.params.id));
    res.status(204).send();
  },
};

export const filesController = {
  async upload(req: any, res: any) {
    if (!req.file) throw new ApiError(400, 'No file uploaded. Use multipart/form-data with field "file".');
    const file = await fileService.createFromUpload(req.file);
    res.status(201).json(file);
  },

  async list(_req: any, res: any) {
    res.json(await fileService.list());
  },

  async get(req: any, res: any) {
    res.json(await fileService.getById(Number(req.params.id)));
  },

  async raw(req: any, res: any) {
    const file = await fileService.getById(Number(req.params.id));
    const abs = fileService.readFromDisk(file);
    if (req.query.download !== undefined) {
      res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(file.originalFilename)}`);
    }
    res.setHeader('Content-Type', file.fileType);
    res.setHeader('Content-Length', String(file.fileSize));
    res.sendFile(abs);
  },

  async remove(req: any, res: any) {
    await fileService.remove(Number(req.params.id));
    res.status(204).send();
  },
};
