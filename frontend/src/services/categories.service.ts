import { api } from '../utils/api';
import { ResearchCategory } from '../types';

export const categoriesService = {
  list(): Promise<ResearchCategory[]> {
    return api('/research/categories');
  },
  create(data: { name: string; slug: string }): Promise<ResearchCategory> {
    return api('/research/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },
  update(id: number, data: Partial<{ name: string; slug: string }>): Promise<ResearchCategory> {
    return api(`/research/categories/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },
  remove(id: number): Promise<void> {
    return api(`/research/categories/${id}`, { method: 'DELETE' });
  },
};
