import {
  createChapter,
  createResearch,
  deleteChapter,
  deleteResearch,
  getResearch,
  listChapters,
  listResearch,
  updateChapter,
  updateResearch,
  getRelatedResearch,
} from '../services/research.service';
import { parseListField } from '../utils/helpers';
import { categoryRepository } from '../repositories/category.repository';

function researchInputFromRequest(req: any): any {
  const body = req.body ?? {};
  return {
    title: body.title || undefined,
    abstract: body.abstract ?? undefined,
    authors: body.authors !== undefined ? parseListField(body.authors) : undefined,
    categoryId: body.categoryId !== undefined ? Number(body.categoryId) : undefined,
    gradeLevel: body.gradeLevel ?? undefined,
    strand: body.strand ?? undefined,
    adviser: body.adviser ?? undefined,
    school: body.school ?? undefined,
    year: body.year !== undefined && body.year !== '' ? Number(body.year) : undefined,
    keywords: body.keywords !== undefined ? parseListField(body.keywords) : undefined,
    description: body.description ?? undefined,
    references: body.references ?? undefined,
    fileId: body.fileId ? Number(body.fileId) : undefined,
    uploadedFile: req.file ?? null,
  };
}

function chapterInputFromRequest(req: any): any {
  const body = req.body ?? {};
  return {
    title: body.title || undefined,
    content: body.content ?? undefined,
    sortOrder: body.sortOrder !== undefined && body.sortOrder !== '' ? Number(body.sortOrder) : undefined,
    fileId: body.fileId ? Number(body.fileId) : undefined,
    uploadedFile: req.file ?? null,
  };
}

export const researchController = {
  async list(req: any, res: any) {
    const q = req.validatedQuery;
    let categoryId = q.categoryId;
    if (q.categorySlug && !categoryId) {
      const category = await categoryRepository.findBySlug(q.categorySlug);
      categoryId = category?.id;
    }
    const filters: any = {
      categoryId,
      strand: q.strand,
      q: q.q,
    };
    if (q.grade) filters.gradeLevel = `Grade ${q.grade}`;
    res.json(await listResearch({ filters, sort: q.sort, page: q.page, limit: q.limit }));
  },

  async get(req: any, res: any) {
    res.json(await getResearch(Number(req.params.id)));
  },

  async related(req: any, res: any) {
    const limit = req.query.limit ? Number(req.query.limit) : 6;
    res.json(await getRelatedResearch(Number(req.params.id), limit));
  },

  async create(req: any, res: any) {
    res.status(201).json(await createResearch(researchInputFromRequest(req)));
  },

  async update(req: any, res: any) {
    res.json(await updateResearch(Number(req.params.id), researchInputFromRequest(req)));
  },

  async remove(req: any, res: any) {
    await deleteResearch(Number(req.params.id));
    res.status(204).send();
  },
};

export const chaptersController = {
  async list(req: any, res: any) {
    res.json(await listChapters(Number(req.params.id)));
  },

  async create(req: any, res: any) {
    res.status(201).json(await createChapter(Number(req.params.id), chapterInputFromRequest(req)));
  },

  async update(req: any, res: any) {
    res.json(await updateChapter(Number(req.params.chapterId), chapterInputFromRequest(req)));
  },

  async remove(req: any, res: any) {
    await deleteChapter(Number(req.params.chapterId));
    res.status(204).send();
  },
};
