import { ApiError } from '../middleware/errorHandler';
import prisma from '../models/db';
import { materialWhere } from '../repositories/material.repository';
import { researchWhere } from '../repositories/research.repository';
import { statsRepository } from '../repositories/stats.repository';
import { paginate } from '../utils/helpers';

export interface SearchOptions {
  q?: string;
  grade?: number;
  subjectId?: number;
  categoryId?: number;
  categorySlug?: string;
  strand?: string;
  type?: 'material' | 'research';
  sort?: 'relevance' | 'recent' | 'title' | 'views' | 'downloads';
  page?: number;
  limit?: number;
}

function scoreMaterial(m: any, q: string): number {
  if (!q) return 1;
  const lower = q.toLowerCase();
  let score = 0;
  if (m.title.toLowerCase().includes(lower)) score += 10;
  if ((m.topic ?? '').toLowerCase().includes(lower)) score += 5;
  if (m.tags.some((t: any) => t.name.toLowerCase().includes(lower))) score += 5;
  if ((m.subject.name).toLowerCase().includes(lower)) score += 3;
  if ((m.description ?? '').toLowerCase().includes(lower)) score += 2;
  if ((m.author ?? '').toLowerCase().includes(lower)) score += 1;
  if (m.grade.name.toLowerCase().includes(lower)) score += 1;
  return score;
}

function scoreResearch(r: any, q: string): number {
  if (!q) return 1;
  const lower = q.toLowerCase();
  let score = 0;
  if (r.title.toLowerCase().includes(lower)) score += 10;
  if ((r.keywords ?? '').toLowerCase().includes(lower)) score += 5;
  if ((r.category.name).toLowerCase().includes(lower)) score += 3;
  if ((r.abstract ?? '').toLowerCase().includes(lower)) score += 2;
  if ((r.authors ?? '').toLowerCase().includes(lower)) score += 1;
  if ((r.strand ?? '').toLowerCase().includes(lower)) score += 1;
  return score;
}

async function materialResults(opts: SearchOptions) {
  const { q = '', grade, subjectId, sort = 'relevance', page = 1, limit = 12 } = opts;
  const gradeRecord = grade ? await prisma.grade.findUnique({ where: { level: grade } }) : null;
  const filters = {
    q: q || undefined,
    gradeId: gradeRecord?.id,
    subjectId,
  };
  const total = await prisma.learningMaterial.count({ where: materialWhere(filters) });

  let items: any[];
  if (sort === 'views' || sort === 'downloads') {
    const ids = (await prisma.learningMaterial.findMany({
      where: materialWhere(filters),
      select: { id: true },
    })).map((m) => m.id);
    const counts = await statsRepository.countForResources('material', ids);
    const sorted = ids
      .map((id) => ({ id, n: sort === 'views' ? counts.viewsOf(id) : counts.downloadsOf(id) }))
      .sort((a, b) => b.n - a.n || a.id - b.id)
      .map((e) => e.id);
    const pageIds = sorted.slice((page - 1) * limit, page * limit);
    const fetched = await prisma.learningMaterial.findMany({
      where: { id: { in: pageIds } },
      include: { grade: true, subject: true, tags: true, file: true },
    });
    const byId = new Map(fetched.map((m) => [m.id, m]));
    items = pageIds.map((id) => byId.get(id)).filter(Boolean) as any[];
  } else {
    items = await prisma.learningMaterial.findMany({
      where: materialWhere(filters),
      orderBy: sort === 'title' ? { title: 'asc' } : { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: { grade: true, subject: true, tags: true, file: true },
    });
  }

  if (sort === 'relevance') {
    items = items.map((m) => ({ m, score: scoreMaterial(m, q) }));
    items.sort((a: any, b: any) => b.score - a.score);
    items = items.map((e: any) => e.m);
  }

  const ids = items.map((m: any) => m.id);
  const counts = await statsRepository.countForResources('material', ids);
  const enriched = items.map((m: any) => ({
    ...m,
    viewCount: counts.viewsOf(m.id),
    downloadCount: counts.downloadsOf(m.id),
  }));

  return paginate(enriched, total, page, limit);
}

async function researchResults(opts: SearchOptions) {
  const { q = '', grade, categoryId, categorySlug, strand, sort = 'relevance', page = 1, limit = 12 } = opts;
  let resolvedCategoryId = categoryId;
  if (!resolvedCategoryId && categorySlug) {
    const category = await prisma.researchCategory.findUnique({ where: { slug: categorySlug } });
    resolvedCategoryId = category?.id;
  }
  const filters = {
    q: q || undefined,
    categoryId: resolvedCategoryId,
    gradeLevel: grade ? `Grade ${grade}` : undefined,
    strand,
  };
  const total = await prisma.researchProject.count({ where: researchWhere(filters) });

  let items: any[];
  if (sort === 'views' || sort === 'downloads') {
    const ids = (await prisma.researchProject.findMany({
      where: researchWhere(filters),
      select: { id: true },
    })).map((r) => r.id);
    const counts = await statsRepository.countForResources('research', ids);
    const sorted = ids
      .map((id) => ({ id, n: sort === 'views' ? counts.viewsOf(id) : counts.downloadsOf(id) }))
      .sort((a, b) => b.n - a.n || a.id - b.id)
      .map((e) => e.id);
    const pageIds = sorted.slice((page - 1) * limit, page * limit);
    const fetched = await prisma.researchProject.findMany({
      where: { id: { in: pageIds } },
      include: { category: true, chapters: { orderBy: { sortOrder: 'asc' } }, file: true },
    });
    const byId = new Map(fetched.map((r) => [r.id, r]));
    items = pageIds.map((id) => byId.get(id)).filter(Boolean) as any[];
  } else {
    items = await prisma.researchProject.findMany({
      where: researchWhere(filters),
      orderBy: sort === 'title' ? { title: 'asc' } : { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: { category: true, chapters: { orderBy: { sortOrder: 'asc' } }, file: true },
    });
  }

  if (sort === 'relevance') {
    items = items.map((r) => ({ r, score: scoreResearch(r, q) }));
    items.sort((a: any, b: any) => b.score - a.score);
    items = items.map((e: any) => e.r);
  }

  const ids = items.map((r: any) => r.id);
  const counts = await statsRepository.countForResources('research', ids);
  const enriched = items.map((r: any) => ({
    ...r,
    viewCount: counts.viewsOf(r.id),
    downloadCount: counts.downloadsOf(r.id),
  }));

  return paginate(enriched, total, page, limit);
}

export async function search(opts: SearchOptions) {
  const { type, q, page, limit } = opts;
  if (!q && !opts.grade && !opts.subjectId && !opts.categoryId && !opts.categorySlug && !opts.strand) {
    return {
      query: q ?? '',
      materials: paginate([], 0, page ?? 1, limit ?? 12),
      research: paginate([], 0, page ?? 1, limit ?? 12),
    };
  }

  const [materials, research] = await Promise.all([
    type !== 'research' ? materialResults(opts) : Promise.resolve(paginate([], 0, 1, limit ?? 12)),
    type !== 'material' ? researchResults(opts) : Promise.resolve(paginate([], 0, 1, limit ?? 12)),
  ]);

  return { query: q ?? '', materials, research };
}
