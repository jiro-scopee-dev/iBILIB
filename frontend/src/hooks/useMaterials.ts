'use client';

import { materialsService, MaterialListParams } from '../services/materials.service';
import { useAsync } from './useAsync';

export function useMaterials(params: MaterialListParams = {}) {
  const key = JSON.stringify(params);
  return useAsync(() => materialsService.list(params), [key]);
}

export function useMaterial(id: number | string | undefined) {
  return useAsync(
    () => (id ? materialsService.get(id) : Promise.reject(new Error('No id'))),
    [id]
  );
}

export function useRelatedMaterials(id: number | string | undefined) {
  return useAsync(
    () => (id ? materialsService.related(id) : Promise.resolve([])),
    [id]
  );
}
