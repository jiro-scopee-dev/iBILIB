import { Prisma } from '@prisma/client';
import prisma from '../models/db';

export interface ResearchFilters {
  categoryId?: number;
  gradeLevel?: string;
  strand?: string;
  q?: string;
}

export type ResearchSort = 'recent' | 'oldest' | 'title' | 'views' | 'downloads';

const researchInclude = {
  category: true,
  chapters: { orderBy: { sortOrder: 'asc' }, include: { file: true } },
  file: true,
} satisfies Prisma.ResearchProjectInclude;

export function researchWhere(filters: ResearchFilters): Prisma.ResearchProjectWhereInput {
  const where: Prisma.ResearchProjectWhereInput = {};
  if (filters.categoryId) where.categoryId = filters.categoryId;
  if (filters.gradeLevel) where.gradeLevel = { contains: filters.gradeLevel };
  if (filters.strand) where.strand = { contains: filters.strand };
  if (filters.q) {
    where.OR = [
      { title: { contains: filters.q } },
      { abstract: { contains: filters.q } },
      { description: { contains: filters.q } },
      { authors: { contains: filters.q } },
      { keywords: { contains: filters.q } },
      { strand: { contains: filters.q } },
      { category: { name: { contains: filters.q } } },
    ];
  }
  return where;
}

export const researchRepository = {
  count(filters: ResearchFilters) {
    return prisma.researchProject.count({ where: researchWhere(filters) });
  },

  findMany(opts: {
    filters: ResearchFilters;
    sort: ResearchSort;
    page: number;
    limit: number;
  }) {
    return prisma.researchProject.findMany({
      where: researchWhere(opts.filters),
      orderBy: opts.sort === 'oldest' ? { createdAt: 'asc' } : { createdAt: 'desc' },
      skip: (opts.page - 1) * opts.limit,
      take: opts.limit,
      include: researchInclude,
    });
  },

  findAllIds(filters: ResearchFilters) {
    return prisma.researchProject.findMany({
      where: researchWhere(filters),
      select: { id: true },
    });
  },

  findById(id: number) {
    return prisma.researchProject.findUnique({
      where: { id },
      include: researchInclude,
    });
  },

  findByIds(ids: number[]) {
    return prisma.researchProject.findMany({
      where: { id: { in: ids } },
      include: researchInclude,
    });
  },

  create(data: {
    title: string;
    abstract?: string | null;
    authors?: string | null;
    categoryId: number;
    gradeLevel?: string | null;
    strand?: string | null;
    adviser?: string | null;
    school?: string | null;
    year?: number | null;
    keywords?: string | null;
    description?: string | null;
    references?: string | null;
    fileId?: number | null;
  }) {
    return prisma.researchProject.create({
      data: {
        title: data.title,
        abstract: data.abstract ?? null,
        authors: data.authors ?? null,
        categoryId: data.categoryId,
        gradeLevel: data.gradeLevel ?? null,
        strand: data.strand ?? null,
        adviser: data.adviser ?? null,
        school: data.school ?? null,
        year: data.year ?? null,
        keywords: data.keywords ?? null,
        description: data.description ?? null,
        references: data.references ?? null,
        ...(data.fileId ? { file: { connect: { id: data.fileId } } } : {}),
      },
      include: researchInclude,
    });
  },

  update(id: number, data: {
    title?: string;
    abstract?: string | null;
    authors?: string | null;
    categoryId?: number;
    gradeLevel?: string | null;
    strand?: string | null;
    adviser?: string | null;
    school?: string | null;
    year?: number | null;
    keywords?: string | null;
    description?: string | null;
    references?: string | null;
    fileId?: number | null;
  }) {
    const update: Prisma.ResearchProjectUpdateInput = {};
    if (data.title !== undefined) update.title = data.title;
    if (data.abstract !== undefined) update.abstract = data.abstract;
    if (data.authors !== undefined) update.authors = data.authors;
    if (data.categoryId !== undefined) update.category = { connect: { id: data.categoryId } };
    if (data.gradeLevel !== undefined) update.gradeLevel = data.gradeLevel;
    if (data.strand !== undefined) update.strand = data.strand;
    if (data.adviser !== undefined) update.adviser = data.adviser;
    if (data.school !== undefined) update.school = data.school;
    if (data.year !== undefined) update.year = data.year;
    if (data.keywords !== undefined) update.keywords = data.keywords;
    if (data.description !== undefined) update.description = data.description;
    if (data.references !== undefined) update.references = data.references;
    if (data.fileId !== undefined) {
      update.file = data.fileId ? { connect: { id: data.fileId } } : { disconnect: true };
    }
    return prisma.researchProject.update({ where: { id }, data: update, include: researchInclude });
  },

  disconnectFile(projectId: number) {
    return prisma.researchProject.update({
      where: { id: projectId },
      data: { file: { disconnect: true } },
    });
  },

  delete(id: number) {
    return prisma.researchProject.delete({ where: { id } });
  },
};
