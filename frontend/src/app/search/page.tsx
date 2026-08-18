'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import MaterialCard from '../../components/MaterialCard';
import ResearchCard from '../../components/ResearchCard';
import Pagination from '../../components/Pagination';
import { Loading, ErrorBox, EmptyState } from '../../components/Status';
import { useSearch } from '../../hooks/useSearch';
import { useCategories } from '../../hooks/useCatalog';
import { SearchSortOption } from '../../types';

const PAGE_SIZE = 8;

export default function SearchPage() {
  return (
    <Suspense fallback={<Loading />}>
      <SearchContent />
    </Suspense>
  );
}

function SearchContent() {
  const searchParams = useSearchParams();
  const [q, setQ] = useState(searchParams.get('q') ?? '');
  const [input, setInput] = useState(searchParams.get('q') ?? '');
  const [grade, setGrade] = useState<number | undefined>(
    searchParams.get('grade') ? Number(searchParams.get('grade')) : undefined
  );
  const [categoryId, setCategoryId] = useState<number | undefined>(
    searchParams.get('category') ? Number(searchParams.get('category')) : undefined
  );
  const [type, setType] = useState<'material' | 'research' | undefined>(
    (searchParams.get('type') as 'material' | 'research') || undefined
  );
  const [sort, setSort] = useState<SearchSortOption>('relevance');
  const [page, setPage] = useState(1);

  const categories = useCategories();
  const results = useSearch({ q, grade, categoryId, type, sort, page, limit: PAGE_SIZE });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setQ(input.trim());
  };

  const materials = results.data?.materials;
  const research = results.data?.research;
  const hasQuery = q.trim().length > 0 || grade !== undefined || categoryId !== undefined;

  return (
    <div>
      <div className="page-header">
        <h1>Search</h1>
        <p>Search learning materials and research projects.</p>
      </div>

      <form className="form-box" onSubmit={submit}>
        <div className="form-grid">
          <div className="form-field full">
            <label htmlFor="q">Search terms</label>
            <input
              id="q"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g. statistics, methodology, online learning..."
            />
          </div>
          <div className="form-field">
            <label htmlFor="grade">Grade</label>
            <select
              id="grade"
              value={grade ?? ''}
              onChange={(e) => { setPage(1); setGrade(e.target.value ? Number(e.target.value) : undefined); }}
            >
              <option value="">All grades</option>
              {[7, 8, 9, 10, 11, 12].map((g) => <option key={g} value={g}>Grade {g}</option>)}
            </select>
          </div>
          <div className="form-field">
            <label htmlFor="category">Research category</label>
            <select
              id="category"
              value={categoryId ?? ''}
              onChange={(e) => { setPage(1); setCategoryId(e.target.value ? Number(e.target.value) : undefined); }}
            >
              <option value="">All categories</option>
              {categories.data?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="form-field">
            <label htmlFor="type">Type</label>
            <select
              id="type"
              value={type ?? ''}
              onChange={(e) => { setPage(1); setType((e.target.value as 'material' | 'research') || undefined); }}
            >
              <option value="">Materials + Research</option>
              <option value="material">Learning materials only</option>
              <option value="research">Research only</option>
            </select>
          </div>
          <div className="form-field">
            <label htmlFor="sort">Sort</label>
            <select id="sort" value={sort} onChange={(e) => setSort(e.target.value as SearchSortOption)}>
              <option value="relevance">Relevance</option>
              <option value="recent">Newest</option>
              <option value="title">Title Aâ€“Z</option>
              <option value="views">Most viewed</option>
              <option value="downloads">Most downloaded</option>
            </select>
          </div>
        </div>
        <div className="form-actions">
          <button className="btn btn-primary" type="submit">Search</button>
        </div>
      </form>

      {!hasQuery && <EmptyState message="Enter a search term or apply a filter to begin." />}

      {hasQuery && results.loading && <Loading label="Searching..." />}
      {hasQuery && results.error && <ErrorBox message={results.error} onRetry={results.reload} />}

      {hasQuery && results.data && (
        <>
          {type !== 'research' && (
            <>
              <h2 className="section-title">
                Learning Materials ({materials?.total ?? 0})
              </h2>
              {materials && materials.items.length === 0 && (
                <EmptyState message="No matching learning materials." />
              )}
              <div className="grid">
                {materials?.items.map((m) => <MaterialCard key={m.id} material={m} />)}
              </div>
              {materials && (
                <Pagination page={materials.page} totalPages={materials.totalPages} onChange={setPage} />
              )}
            </>
          )}

          {type !== 'material' && (
            <>
              <h2 className="section-title">
                Research Projects ({research?.total ?? 0})
              </h2>
              {research && research.items.length === 0 && (
                <EmptyState message="No matching research projects." />
              )}
              <div className="grid">
                {research?.items.map((r) => <ResearchCard key={r.id} project={r} />)}
              </div>
              {research && (
                <Pagination page={research.page} totalPages={research.totalPages} onChange={setPage} />
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
