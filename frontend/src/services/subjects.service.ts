import { api, buildQuery } from '../utils/api';
import { Subject } from '../types';

export const subjectsService = {
  list(params: { gradeId?: number } = {}): Promise<Subject[]> {
    return api(`/subjects${buildQuery({ ...params })}`);
  },
  get(id: number): Promise<Subject> {
    return api(`/subjects/${id}`);
  },
  create(data: { name: string; gradeId: number }): Promise<Subject> {
    return api('/subjects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },
  update(id: number, data: Partial<{ name: string; gradeId: number }>): Promise<Subject> {
    return api(`/subjects/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },
  remove(id: number): Promise<void> {
    return api(`/subjects/${id}`, { method: 'DELETE' });
  },
};
