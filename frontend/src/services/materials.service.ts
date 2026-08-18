import { api, buildQuery } from '../utils/api';
import { LearningMaterial, Paginated, SortOption } from '../types';

export interface MaterialListParams {
  grade?: number;
  gradeId?: number;
  subjectId?: number;
  tag?: string;
  q?: string;
  sort?: SortOption;
  page?: number;
  limit?: number;
}

export const materialsService = {
  list(params: MaterialListParams = {}): Promise<Paginated<LearningMaterial>> {
    return api(`/materials${buildQuery({ ...params })}`);
  },

  get(id: number | string): Promise<LearningMaterial> {
    return api(`/materials/${id}`);
  },

  related(id: number | string): Promise<LearningMaterial[]> {
    return api(`/materials/${id}/related`);
  },

  create(formData: FormData): Promise<LearningMaterial> {
    return api('/materials', {
      method: 'POST',
      body: formData,
    });
  },

  update(id: number | string, formData: FormData): Promise<LearningMaterial> {
    return api(`/materials/${id}`, {
      method: 'PATCH',
      body: formData,
    });
  },

  remove(id: number | string): Promise<void> {
    return api(`/materials/${id}`, { method: 'DELETE' });
  },
};
