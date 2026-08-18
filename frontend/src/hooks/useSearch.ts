'use client';

import { searchService, SearchParams } from '../services/search.service';
import { useAsync } from './useAsync';

export function useSearch(params: SearchParams) {
  const key = JSON.stringify(params);
  return useAsync(() => searchService.search(params), [key]);
}
