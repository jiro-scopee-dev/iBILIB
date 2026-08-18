export interface Grade {
  id: number;
  name: string;
  level: number;
  createdAt: string;
  updatedAt: string;
  subjects?: Subject[];
  _count?: { subjects: number; materials: number };
}

export interface Subject {
  id: number;
  name: string;
  gradeId: number;
  grade?: Grade;
  createdAt: string;
  updatedAt: string;
  _count?: { materials: number };
}

export interface Tag {
  id: number;
  name: string;
  createdAt?: string;
  updatedAt?: string;
  _count?: { materials: number };
}

export interface FileInfo {
  id: number;
  filename: string;
  originalFilename: string;
  fileType: string;
  fileSize: number;
  path: string;
  createdAt: string;
  updatedAt: string;
  material?: { id: number; title: string } | null;
  researchProject?: { id: number; title: string } | null;
  researchChapter?: { id: number; title: string } | null;
}

export interface LearningMaterial {
  id: number;
  title: string;
  description: string | null;
  topic: string | null;
  author: string | null;
  gradeId: number;
  subjectId: number;
  grade: Grade;
  subject: Subject;
  tags: Tag[];
  file: FileInfo | null;
  createdAt: string;
  updatedAt: string;
  viewCount?: number;
  downloadCount?: number;
}

export interface ResearchCategory {
  id: number;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  _count?: { projects: number };
}

export interface ResearchChapter {
  id: number;
  title: string;
  content: string | null;
  sortOrder: number;
  projectId: number;
  file: FileInfo | null;
  createdAt: string;
  updatedAt: string;
  viewCount?: number;
  downloadCount?: number;
}

export interface ResearchProject {
  id: number;
  title: string;
  abstract: string | null;
  authors: string | null; // JSON array string
  categoryId: number;
  category: ResearchCategory;
  gradeLevel: string | null;
  strand: string | null;
  adviser: string | null;
  school: string | null;
  year: number | null;
  keywords: string | null; // JSON array string
  description: string | null;
  references: string | null;
  file: FileInfo | null;
  chapters: ResearchChapter[];
  createdAt: string;
  updatedAt: string;
  viewCount?: number;
  downloadCount?: number;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SearchResults {
  query: string;
  materials: Paginated<LearningMaterial>;
  research: Paginated<ResearchProject>;
}

export type SortOption = 'recent' | 'oldest' | 'title' | 'views' | 'downloads';
export type SearchSortOption = 'relevance' | SortOption;

export type ResourceType = 'material' | 'research' | 'chapter';
