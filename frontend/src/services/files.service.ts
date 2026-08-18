import { api } from '../utils/api';
import { FileInfo } from '../types';
import { API_URL } from '../utils/api';

export const filesService = {
  list(): Promise<FileInfo[]> {
    return api('/files');
  },
  get(id: number): Promise<FileInfo> {
    return api(`/files/${id}`);
  },
  remove(id: number): Promise<void> {
    return api(`/files/${id}`, { method: 'DELETE' });
  },
  rawUrl(fileId: number | string): string {
    return `${API_URL}/files/${fileId}/raw`;
  },
  downloadUrl(fileId: number | string): string {
    return `${API_URL}/files/${fileId}/raw?download=1`;
  },
};
