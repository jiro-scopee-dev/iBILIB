import { api } from '../utils/api';
import { Tag } from '../types';

export const tagsService = {
  list(): Promise<Tag[]> {
    return api('/tags');
  },
  create(name: string): Promise<Tag> {
    return api('/tags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
  },
  remove(id: number): Promise<void> {
    return api(`/tags/${id}`, { method: 'DELETE' });
  },
};
