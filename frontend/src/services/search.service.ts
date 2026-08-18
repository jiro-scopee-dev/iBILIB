import { api, buildQuery } from '../utils/api';
import { SearchResults, SearchSortOption } from '../types';

export interface SearchParams {
  q?: string;
  grade?: number;
  subjectId?: number;
  categoryId?: number;
  categorySlug?: string;
  strand?: string;
  type?: 'material' | 'research';
  sort?: SearchSortOption;
  page?: number;
  limit?: number;
}

export const searchService = {
  search(params: SearchParams): Promise<SearchResults> {
    return api(`/search${buildQuery({ ...params })}`);
  },
};
