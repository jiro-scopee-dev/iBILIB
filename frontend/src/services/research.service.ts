import { api, buildQuery } from '../utils/api';
import { Paginated, ResearchChapter, ResearchProject, SortOption } from '../types';

export interface ResearchListParams {
  categoryId?: number;
  categorySlug?: string;
  grade?: number;
  strand?: string;
  q?: string;
  sort?: SortOption;
  page?: number;
  limit?: number;
}

export const researchService = {
  list(params: ResearchListParams = {}): Promise<Paginated<ResearchProject>> {
    return api(`/research${buildQuery({ ...params })}`);
  },

  get(id: number | string): Promise<ResearchProject> {
    return api(`/research/${id}`);
  },

  related(id: number | string): Promise<ResearchProject[]> {
    return api(`/research/${id}/related`);
  },

  create(formData: FormData): Promise<ResearchProject> {
    return api('/research', { method: 'POST', body: formData });
  },

  update(id: number | string, formData: FormData): Promise<ResearchProject> {
    return api(`/research/${id}`, { method: 'PATCH', body: formData });
  },

  remove(id: number | string): Promise<void> {
    return api(`/research/${id}`, { method: 'DELETE' });
  },

  chapters(projectId: number | string): Promise<ResearchChapter[]> {
    return api(`/research/${projectId}/chapters`);
  },

  addChapter(projectId: number | string, formData: FormData): Promise<ResearchChapter> {
    return api(`/research/${projectId}/chapters`, { method: 'POST', body: formData });
  },

  updateChapter(chapterId: number | string, formData: FormData): Promise<ResearchChapter> {
    return api(`/research/chapters/${chapterId}`, { method: 'PATCH', body: formData });
  },

  removeChapter(chapterId: number | string): Promise<void> {
    return api(`/research/chapters/${chapterId}`, { method: 'DELETE' });
  },
};
