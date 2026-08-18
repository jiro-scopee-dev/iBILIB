import { api } from '../utils/api';
import { ResourceType } from '../types';

export const statsService = {
  recordView(resourceType: ResourceType, resourceId: number | string): Promise<{ ok: boolean }> {
    return api('/views', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resourceType, resourceId }),
    });
  },
  recordDownload(resourceType: ResourceType, resourceId: number | string): Promise<{ ok: boolean }> {
    return api('/downloads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resourceType, resourceId }),
    });
  },
};
