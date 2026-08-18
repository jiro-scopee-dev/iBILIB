'use client';

import { researchService, ResearchListParams } from '../services/research.service';
import { useAsync } from './useAsync';

export function useResearch(params: ResearchListParams = {}) {
  const key = JSON.stringify(params);
  return useAsync(() => researchService.list(params), [key]);
}

export function useResearchProject(id: number | string | undefined) {
  return useAsync(
    () => (id ? researchService.get(id) : Promise.reject(new Error('No id'))),
    [id]
  );
}

export function useRelatedResearch(id: number | string | undefined) {
  return useAsync(() => (id ? researchService.related(id) : Promise.resolve([])), [id]);
}

export function useChapters(projectId: number | string | undefined) {
  return useAsync(() => (projectId ? researchService.chapters(projectId) : Promise.resolve([])), [
    projectId,
  ]);
}
