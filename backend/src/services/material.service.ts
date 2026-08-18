import { ApiError } from '../middleware/errorHandler';
import prisma from '../models/db';
import {
  materialRepository,
  MaterialFilters,
  MaterialSort,
} from '../repositories/material.repository';
import { gradeRepository } from '../repositories/grade.repository';
import { statsRepository } from '../repositories/stats.repository';
import { tagRepository } from '../repositories/tag.repository';
import { assertExists, paginate, PageResult } from '../utils/helpers';
import { createFileFromUpload, deleteFile, deleteFileFromDisk, fileService } from './file.service';

export interface MaterialInput {
  title?: string;
  description?: string | null;
  topic?: string | null;
  author?: string | null;
  gradeId?: number;
  subjectId?: number;
  tags?: string[];
  fileId?: number | null;
  uploadedFile?: Express.Multer.File | null;
}

const entityInclude = {
  grade: true,
  subject: true,
  tags: { orderBy: { name: 'asc' } },
  file: true,
} as const;

async function resolveFile(input: MaterialInput): Promise<number | null> {
  if (input.uploadedFile) {
    const file = await createFileFromUpload(input.uploadedFile);
    return file.id;
  }
  return input.fileId ?? null;
}

async function clearCurrentFile(materialId: number) {
  const material = await materialRepository.findById(materialId);
  if (!material) throw new ApiError(404, 'Material not found');
  if (material.file) await deleteFile(material.file.id);
  await materialRepository.disconnectFile(materialId);
}

export const materialService = {
  async list(opts: {
    filters: MaterialFilters;
    sort: MaterialSort;
    page: number;
    limit: number;
  }): Promise<PageResult<any>> {
    const { filters, sort, page, limit } = opts;
    const total = await materialRepository.count(filters);

    let items: any[];
    if (sort === 'views' || sort === 'downloads') {
      const ids = (await materialRepository.findAllIds(filters)).map((m) => m.id);
      const counts = await statsRepository.countForResources('material', ids);
      const sorted = ids
        .map((id) => ({
          id,
          n: sort === 'views' ? counts.viewsOf(id) : counts.downloadsOf(id),
        }))
        .sort((a, b) => b.n - a.n || a.id - b.id)
        .map((e) => e.id);
      const pageIds = sorted.slice((page - 1) * limit, page * limit);
      const fetched = await materialRepository.findByIds(pageIds);
      const byId = new Map(fetched.map((m) => [m.id, m]));
      items = pageIds.map((id) => byId.get(id)).filter(Boolean) as any[];
    } else {
      items = await materialRepository.findMany({ filters, sort, page, limit });
    }

    const ids = items.map((m) => m.id);
    const counts = await statsRepository.countForResources('material', ids);

    const enriched = items.map((m) => ({
      ...m,
      viewCount: counts.viewsOf(m.id),
      downloadCount: counts.downloadsOf(m.id),
    }));

    return paginate(enriched, total, page, limit);
  },

  async get(id: number) {
    const material = assertExists(await materialRepository.findById(id), 'Material not found');
    const counts = await statsRepository.countForResource('material', id);
    return { ...material, viewCount: counts.views, downloadCount: counts.downloads };
  },

  async findGradeByLevel(level: number) {
    return gradeRepository.findByLevel(level);
  },

  async create(input: MaterialInput) {
    const { title, gradeId, subjectId } = input;
    if (!title || !gradeId || !subjectId) {
      throw new ApiError(400, 'title, gradeId and subjectId are required');
    }
    const tags = await tagRepository.findOrCreateMany(input.tags ?? []);
    const fileId = await resolveFile(input);
    return materialRepository.create({
      title,
      description: input.description ?? null,
      topic: input.topic ?? null,
      author: input.author ?? null,
      gradeId,
      subjectId,
      tags: tags.map((t) => ({ id: t.id })),
      fileId,
    });
  },

  async update(id: number, input: MaterialInput) {
    const existing = assertExists(await materialRepository.findById(id), 'Material not found');
    const tags = input.tags ? await tagRepository.findOrCreateMany(input.tags) : undefined;

    let fileId: number | null | undefined = undefined;
    if (input.uploadedFile) {
      await clearCurrentFile(id);
      fileId = (await createFileFromUpload(input.uploadedFile)).id;
    } else if (input.fileId !== undefined) {
      const file = input.fileId
        ? await prisma.file.findUnique({ where: { id: input.fileId } })
        : null;
      if (file && existing.file?.id !== input.fileId) {
        await clearCurrentFile(id);
        fileId = input.fileId;
      } else if (!file && input.fileId) {
        throw new ApiError(404, 'File not found');
      } else if (existing.file) {
        await clearCurrentFile(id);
      }
    }

    return materialRepository.update(id, {
      title: input.title,
      description: input.description === undefined ? undefined : input.description,
      topic: input.topic === undefined ? undefined : input.topic,
      author: input.author === undefined ? undefined : input.author,
      gradeId: input.gradeId,
      subjectId: input.subjectId,
      tags: tags ? tags.map((t) => ({ id: t.id })) : undefined,
      ...(fileId !== undefined ? { fileId } : {}),
    });
  },

  async remove(id: number) {
    const material = assertExists(await materialRepository.findById(id), 'Material not found');
    const diskFilenames = material.file ? [material.file.filename] : [];
    await materialRepository.delete(id);
    for (const filename of diskFilenames) fileService.removeFromDisk(filename);
    await statsRepository.deleteForResource('material', id);
    return material;
  },

  /** Rule-based related materials: same subject, same grade, shared tags, similar topic. */
  async related(id: number, limit = 6) {
    const material = assertExists(await materialRepository.findById(id), 'Material not found');
    const candidates = await prisma.learningMaterial.findMany({
      where: {
        id: { not: id },
        OR: [{ subjectId: material.subjectId }, { gradeId: material.gradeId }],
      },
      include: entityInclude,
      take: 200,
    });

    const materialTags = new Set(material.tags.map((t) => t.name.toLowerCase()));
    const topicWords = (material.topic ?? '')
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((w) => w.length > 2);

    const scored = candidates.map((c) => {
      let score = 0;
      if (c.subjectId === material.subjectId) score += 5;
      if (c.gradeId === material.gradeId) score += 3;
      for (const t of c.tags) if (materialTags.has(t.name.toLowerCase())) score += 2;
      const words = (c.topic ?? '')
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .filter((w) => w.length > 2);
      score += words.filter((w) => topicWords.includes(w)).length;
      return { item: c, score };
    });

    return scored
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score || b.item.createdAt.getTime() - a.item.createdAt.getTime())
      .slice(0, limit)
      .map((s) => s.item);
  },
};
