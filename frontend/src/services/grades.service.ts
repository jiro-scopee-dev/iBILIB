import { api } from '../utils/api';
import { Grade } from '../types';

export const gradesService = {
  list(): Promise<Grade[]> {
    return api('/grades');
  },
  get(id: number): Promise<Grade> {
    return api(`/grades/${id}`);
  },
  create(data: { name: string; level: number }): Promise<Grade> {
    return api('/grades', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },
  update(id: number, data: Partial<{ name: string; level: number }>): Promise<Grade> {
    return api(`/grades/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },
  remove(id: number): Promise<void> {
    return api(`/grades/${id}`, { method: 'DELETE' });
  },
};
