import { search } from '../services/search.service';

export const searchController = {
  async search(req: any, res: any) {
    const q = req.validatedQuery;
    res.json(
      await search({
        q: q.q || undefined,
        grade: q.grade,
        subjectId: q.subjectId,
        categoryId: q.categoryId,
        categorySlug: q.categorySlug,
        strand: q.strand,
        type: q.type,
        sort: q.sort,
        page: q.page,
        limit: q.limit,
      })
    );
  },
};
