import { z } from 'zod';

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const chapterIdParamSchema = z.object({
  chapterId: z.coerce.number().int().positive(),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(12),
});

export const materialCreateSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(300),
  description: z.string().trim().max(10000).optional().nullable(),
  topic: z.string().trim().max(300).optional().nullable(),
  author: z.string().trim().max(300).optional().nullable(),
  gradeId: z.coerce.number().int().positive('gradeId is required'),
  subjectId: z.coerce.number().int().positive('subjectId is required'),
  tags: z.array(z.string().trim().min(1).max(100)).max(20).optional().default([]),
  fileId: z.coerce.number().int().positive().optional().nullable(),
});

export const materialUpdateSchema = materialCreateSchema.partial();

export const researchCreateSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(500),
  abstract: z.string().trim().max(20000).optional().nullable(),
  authors: z.array(z.string().trim().min(1).max(200)).max(50).optional().default([]),
  categoryId: z.coerce.number().int().positive('categoryId is required'),
  gradeLevel: z.string().trim().max(100).optional().nullable(),
  strand: z.string().trim().max(100).optional().nullable(),
  adviser: z.string().trim().max(300).optional().nullable(),
  school: z.string().trim().max(300).optional().nullable(),
  year: z.coerce.number().int().min(1900).max(2100).optional().nullable(),
  keywords: z.array(z.string().trim().min(1).max(100)).max(30).optional().default([]),
  description: z.string().trim().max(10000).optional().nullable(),
  references: z.string().trim().max(50000).optional().nullable(),
  fileId: z.coerce.number().int().positive().optional().nullable(),
});

export const researchUpdateSchema = researchCreateSchema.partial();

export const chapterCreateSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(300),
  content: z.string().trim().max(20000).optional().nullable(),
  sortOrder: z.coerce.number().int().min(0).max(999).optional(),
  fileId: z.coerce.number().int().positive().optional().nullable(),
});

export const chapterUpdateSchema = chapterCreateSchema.partial();

export const gradeCreateSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  level: z.coerce.number().int().min(1).max(20),
});

export const gradeUpdateSchema = gradeCreateSchema.partial();

export const subjectCreateSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  gradeId: z.coerce.number().int().positive('gradeId is required'),
});

export const subjectUpdateSchema = subjectCreateSchema.partial();

export const categoryCreateSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  slug: z.string().trim().min(1).max(100).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with dashes'),
});

export const categoryUpdateSchema = categoryCreateSchema.partial();

export const tagCreateSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
});

export const tagUpdateSchema = tagCreateSchema.partial();

export const statsRecordSchema = z.object({
  resourceType: z.enum(['material', 'research', 'chapter']),
  resourceId: z.coerce.number().int().positive(),
});

export const searchQuerySchema = z.object({
  q: z.string().trim().max(300).optional().default(''),
  grade: z.coerce.number().int().min(1).max(20).optional(),
  subjectId: z.coerce.number().int().positive().optional(),
  categoryId: z.coerce.number().int().positive().optional(),
  categorySlug: z.string().trim().max(100).optional(),
  strand: z.string().trim().max(100).optional(),
  type: z.enum(['material', 'research']).optional(),
  sort: z.enum(['relevance', 'recent', 'title', 'views', 'downloads']).default('relevance'),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

export const materialListQuerySchema = z.object({
  grade: z.coerce.number().int().min(1).max(20).optional(),
  gradeId: z.coerce.number().int().positive().optional(),
  subjectId: z.coerce.number().int().positive().optional(),
  tag: z.string().trim().max(100).optional(),
  q: z.string().trim().max(300).optional(),
  sort: z.enum(['recent', 'oldest', 'title', 'views', 'downloads']).default('recent'),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(12),
});

export const researchListQuerySchema = z.object({
  categoryId: z.coerce.number().int().positive().optional(),
  categorySlug: z.string().trim().max(100).optional(),
  grade: z.coerce.number().int().min(1).max(20).optional(),
  strand: z.string().trim().max(100).optional(),
  q: z.string().trim().max(300).optional(),
  sort: z.enum(['recent', 'oldest', 'title', 'views', 'downloads']).default('recent'),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(12),
});
