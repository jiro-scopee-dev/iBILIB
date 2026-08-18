import { ApiError } from '../middleware/errorHandler';
import prisma from '../models/db';
import {
  researchRepository,
  researchWhere,
  ResearchFilters,
  ResearchSort,
} from '../repositories/research.repository';
import { chapterRepository } from '../repositories/chapter.repository';
import { categoryRepository } from '../repositories/category.repository';
import { statsRepository } from '../repositories/stats.repository';
import { assertExists, paginate, PageResult, parseListField } from '../utils/helpers';
import { createFileFromUpload, deleteFile, deleteFileFromDisk } from './file.service';

export interface ResearchInput {
  title?: string;
  abstract?: string | null;
  authors?: string[];
  categoryId?: number;
  gradeLevel?: string | null;
  strand?: string | null;
  adviser?: string | null;
  school?: string | null;
  year?: number | null;
  keywords?: string[];
  description?: string | null;
  references?: string | null;
  fileId?: number | null;
  uploadedFile?: Express.Multer.File | null;
}

export interface ChapterInput {
  title?: string;
  content?: string | null;
  sortOrder?: number;
  fileId?: number | null;
  uploadedFile?: Express.Multer.File | null;
}

export async function listResearch(opts: {
  filters: ResearchFilters;
  sort: ResearchSort;
  page: number;
  limit: number;
}): Promise<PageResult<any>> {
  const { filters, sort, page, limit } = opts;
  const total = await researchRepository.count(filters);

  let items: any[];
  if (sort === 'views' || sort === 'downloads') {
    const ids = (await researchRepository.findAllIds(filters)).map((r) => r.id);
    const counts = await statsRepository.countForResources('research', ids);
    const sorted = ids
      .map((id) => ({
        id,
        n: sort === 'views' ? counts.viewsOf(id) : counts.downloadsOf(id),
      }))
      .sort((a, b) => b.n - a.n || a.id - b.id)
      .map((e) => e.id);
    const pageIds = sorted.slice((page - 1) * limit, page * limit);
    const fetched = await researchRepository.findByIds(pageIds);
    const byId = new Map(fetched.map((r) => [r.id, r]));
    items = pageIds.map((id) => byId.get(id)).filter(Boolean) as any[];
  } else {
    items = await researchRepository.findMany({ filters, sort, page, limit });
  }

  const ids = items.map((r) => r.id);
  const counts = await statsRepository.countForResources('research', ids);

  const enriched = items.map((r) => ({
    ...r,
    viewCount: counts.viewsOf(r.id),
    downloadCount: counts.downloadsOf(r.id),
  }));

  return paginate(enriched, total, page, limit);
}

export async function getResearch(id: number) {
  const project = assertExists(await researchRepository.findById(id), 'Research project not found');
  const counts = await statsRepository.countForResource('research', id);
  return { ...project, viewCount: counts.views, downloadCount: counts.downloads };
}

export async function createResearch(input: ResearchInput) {
  const { title, categoryId } = input;
  if (!title || !categoryId) throw new ApiError(400, 'title and categoryId are required');

  const category = await categoryRepository.findById(categoryId);
  if (!category) throw new ApiError(400, 'Research category does not exist');

  let fileId: number | null = null;
  if (input.uploadedFile) fileId = (await createFileFromUpload(input.uploadedFile)).id;
  else fileId = input.fileId ?? null;

  return researchRepository.create({
    title,
    abstract: input.abstract ?? null,
    authors: input.authors ? JSON.stringify(input.authors) : null,
    categoryId,
    gradeLevel: input.gradeLevel ?? null,
    strand: input.strand ?? null,
    adviser: input.adviser ?? null,
    school: input.school ?? null,
    year: input.year ?? null,
    keywords: input.keywords ? JSON.stringify(input.keywords) : null,
    description: input.description ?? null,
    references: input.references ?? null,
    fileId,
  });
}

export async function updateResearch(id: number, input: ResearchInput) {
  const existing = assertExists(await researchRepository.findById(id), 'Research project not found');

  let fileId: number | null | undefined = undefined;
  if (input.uploadedFile) {
    if (existing.file) await deleteFile(existing.file.id);
    await researchRepository.disconnectFile(id);
    fileId = (await createFileFromUpload(input.uploadedFile)).id;
  } else if (input.fileId === null) {
    if (existing.file) await deleteFile(existing.file.id);
    await researchRepository.disconnectFile(id);
    fileId = null;
  } else if (input.fileId !== undefined && existing.file?.id !== input.fileId) {
    if (existing.file) await deleteFile(existing.file.id);
    await researchRepository.disconnectFile(id);
    fileId = input.fileId;
  }

  return researchRepository.update(id, {
    title: input.title,
    abstract: input.abstract === undefined ? undefined : input.abstract,
    authors: input.authors ? JSON.stringify(input.authors) : input.authors === null ? null : undefined,
    categoryId: input.categoryId,
    gradeLevel: input.gradeLevel === undefined ? undefined : input.gradeLevel,
    strand: input.strand === undefined ? undefined : input.strand,
    adviser: input.adviser === undefined ? undefined : input.adviser,
    school: input.school === undefined ? undefined : input.school,
    year: input.year === undefined ? undefined : input.year,
    keywords: input.keywords ? JSON.stringify(input.keywords) : input.keywords === null ? null : undefined,
    description: input.description === undefined ? undefined : input.description,
    references: input.references === undefined ? undefined : input.references,
    ...(fileId !== undefined ? { fileId } : {}),
  });
}

export async function deleteResearch(id: number) {
  const project = assertExists(await researchRepository.findById(id), 'Research project not found');

  const diskFilenames = [
    ...project.chapters.filter((c) => c.file).map((c) => c.file!.filename),
    ...(project.file ? [project.file.filename] : []),
  ];

  await researchRepository.delete(id);

  for (const filename of diskFilenames) deleteFileFromDisk(filename);
  await statsRepository.deleteForResource('research', id);
  return project;
}

/* ------------------------- Chapters ------------------------- */

export async function listChapters(projectId: number) {
  const project = assertExists(await researchRepository.findById(projectId), 'Research project not found');
  const chapters = await chapterRepository.findManyByProject(projectId);
  const ids = chapters.map((c) => c.id);
  const counts = await statsRepository.countForResources('chapter', ids);
  return chapters.map((c) => ({
    ...c,
    viewCount: counts.viewsOf(c.id),
    downloadCount: counts.downloadsOf(c.id),
  }));
}

export async function createChapter(projectId: number, input: ChapterInput) {
  const project = assertExists(await researchRepository.findById(projectId), 'Research project not found');
  if (!input.title) throw new ApiError(400, 'title is required');

  let fileId: number | null = null;
  if (input.uploadedFile) fileId = (await createFileFromUpload(input.uploadedFile)).id;
  else fileId = input.fileId ?? null;

  const sortOrder =
    input.sortOrder ?? (await chapterRepository.maxSortOrder(projectId)) + 1;

  return chapterRepository.create({
    title: input.title,
    content: input.content ?? null,
    sortOrder,
    projectId,
    fileId,
  });
}

export async function updateChapter(chapterId: number, input: ChapterInput) {
  const chapter = assertExists(await chapterRepository.findById(chapterId), 'Chapter not found');

  let fileId: number | null | undefined = undefined;
  if (input.uploadedFile) {
    if (chapter.file) await deleteFile(chapter.file.id);
    await chapterRepository.disconnectFile(chapterId);
    fileId = (await createFileFromUpload(input.uploadedFile)).id;
  } else if (input.fileId === null) {
    if (chapter.file) await deleteFile(chapter.file.id);
    await chapterRepository.disconnectFile(chapterId);
    fileId = null;
  } else if (input.fileId !== undefined && chapter.file?.id !== input.fileId) {
    if (chapter.file) await deleteFile(chapter.file.id);
    await chapterRepository.disconnectFile(chapterId);
    fileId = input.fileId;
  }

  return chapterRepository.update(chapterId, {
    title: input.title,
    content: input.content === undefined ? undefined : input.content,
    sortOrder: input.sortOrder,
    ...(fileId !== undefined ? { fileId } : {}),
  });
}

export async function deleteChapter(chapterId: number) {
  const chapter = assertExists(await chapterRepository.findById(chapterId), 'Chapter not found');
  const diskFilename = chapter.file?.filename;
  await chapterRepository.delete(chapterId);
  if (diskFilename) deleteFileFromDisk(diskFilename);
  await statsRepository.deleteForResource('chapter', chapterId);
  return chapter;
}

/* ------------------------- Related ------------------------- */

/** Rule-based related research: same category, same grade, same strand, shared keywords. */
export async function getRelatedResearch(id: number, limit = 6) {
  const project = assertExists(await researchRepository.findById(id), 'Research project not found');
  const candidates = await prisma.researchProject.findMany({
    where: {
      id: { not: id },
      OR: [{ categoryId: project.categoryId }, { gradeLevel: project.gradeLevel ?? undefined }],
    },
    include: { category: true, chapters: { take: 1 } },
    take: 200,
  });

  const keywords = new Set(parseListField(project.keywords).map((k) => k.toLowerCase()));

  const scored = candidates.map((c) => {
    let score = 0;
    if (c.categoryId === project.categoryId) score += 5;
    if (c.gradeLevel && project.gradeLevel && c.gradeLevel === project.gradeLevel) score += 3;
    if (c.strand && project.strand && c.strand === project.strand) score += 2;
    const cKeywords = parseListField(c.keywords).map((k) => k.toLowerCase());
    score += cKeywords.filter((k) => keywords.has(k)).length * 2;
    return { item: c, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score || b.item.createdAt.getTime() - a.item.createdAt.getTime())
    .slice(0, limit)
    .map((s) => s.item);
}
