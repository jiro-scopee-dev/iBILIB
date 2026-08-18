'use client';

import { gradesService } from '../services/grades.service';
import { subjectsService } from '../services/subjects.service';
import { categoriesService } from '../services/categories.service';
import { tagsService } from '../services/tags.service';
import { useAsync } from './useAsync';

export function useGrades() {
  return useAsync(() => gradesService.list(), []);
}

export function useSubjects(gradeId?: number) {
  return useAsync(() => subjectsService.list(gradeId ? { gradeId } : {}), [gradeId]);
}

export function useCategories() {
  return useAsync(() => categoriesService.list(), []);
}

export function useTags() {
  return useAsync(() => tagsService.list(), []);
}
