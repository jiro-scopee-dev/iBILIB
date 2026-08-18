import { Prisma } from '@prisma/client';
import prisma from '../models/db';

export interface MaterialFilters {
  gradeId?: number;
  subjectId?: number;
  tag?: string;
  q?: string;
}

export type MaterialSort = 'recent' | 'oldest' | 'title' | 'views' | 'downloads';

const materialInclude = {
  grade: true,
  subject: true,
  tags: { orderBy: { name: 'asc' } },
  file: true,
} satisfies Prisma.LearningMaterialInclude;

export function materialWhere(filters: MaterialFilters): Prisma.LearningMaterialWhereInput {
  const where: Prisma.LearningMaterialWhereInput = {};
  if (filters.gradeId) where.gradeId = filters.gradeId;
  if (filters.subjectId) where.subjectId = filters.subjectId;
  if (filters.tag) where.tags = { some: { name: { contains: filters.tag } } };
  if (filters.q) {
    where.OR = [
      { title: { contains: filters.q } },
      { description: { contains: filters.q } },
      { topic: { contains: filters.q } },
      { author: { contains: filters.q } },
      { grade: { name: { contains: filters.q } } },
      { subject: { name: { contains: filters.q } } },
      { tags: { some: { name: { contains: filters.q } } } },
    ];
  }
  return where;
}

export const materialRepository = {
  count(filters: MaterialFilters) {
    return prisma.learningMaterial.count({ where: materialWhere(filters) });
  },

  findMany(opts: {
    filters: MaterialFilters;
    sort: MaterialSort;
    page: number;
    limit: number;
  }) {
    return prisma.learningMaterial.findMany({
      where: materialWhere(opts.filters),
      orderBy: opts.sort === 'oldest' ? { createdAt: 'asc' } : { createdAt: 'desc' },
      skip: (opts.page - 1) * opts.limit,
      take: opts.limit,
      include: materialInclude,
    });
  },

  /** Returns every matching id, used for stats-based sorting. */
  findAllIds(filters: MaterialFilters) {
    return prisma.learningMaterial.findMany({
      where: materialWhere(filters),
      select: { id: true },
    });
  },

  findById(id: number) {
    return prisma.learningMaterial.findUnique({
      where: { id },
      include: materialInclude,
    });
  },

  findByIds(ids: number[]) {
    return prisma.learningMaterial.findMany({
      where: { id: { in: ids } },
      include: materialInclude,
    });
  },

  create(data: {
    title: string;
    description?: string | null;
    topic?: string | null;
    author?: string | null;
    gradeId: number;
    subjectId: number;
    tags: { id: number }[];
    fileId?: number | null;
  }) {
    return prisma.learningMaterial.create({
      data: {
        title: data.title,
        description: data.description ?? null,
        topic: data.topic ?? null,
        author: data.author ?? null,
        gradeId: data.gradeId,
        subjectId: data.subjectId,
        tags: { connect: data.tags },
        ...(data.fileId ? { file: { connect: { id: data.fileId } } } : {}),
      },
      include: materialInclude,
    });
  },

  update(id: number, data: {
    title?: string;
    description?: string | null;
    topic?: string | null;
    author?: string | null;
    gradeId?: number;
    subjectId?: number;
    tags?: { id: number }[];
    fileId?: number | null;
  }) {
    const update: Prisma.LearningMaterialUpdateInput = {};
    if (data.title !== undefined) update.title = data.title;
    if (data.description !== undefined) update.description = data.description;
    if (data.topic !== undefined) update.topic = data.topic;
    if (data.author !== undefined) update.author = data.author;
    if (data.gradeId !== undefined) update.grade = { connect: { id: data.gradeId } };
    if (data.subjectId !== undefined) update.subject = { connect: { id: data.subjectId } };
    if (data.tags !== undefined) update.tags = { set: data.tags };
    if (data.fileId !== undefined) {
      update.file = data.fileId ? { connect: { id: data.fileId } } : { disconnect: true };
    }
    return prisma.learningMaterial.update({ where: { id }, data: update, include: materialInclude });
  },

  /** Detaches the material's file (call before deleting the file record). */
  disconnectFile(materialId: number) {
    return prisma.learningMaterial.update({
      where: { id: materialId },
      data: { file: { disconnect: true } },
    });
  },

  delete(id: number) {
    return prisma.learningMaterial.delete({ where: { id } });
  },
};
