'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import MaterialCard from '../../../components/MaterialCard';
import Pagination from '../../../components/Pagination';
import { Loading, ErrorBox, EmptyState } from '../../../components/Status';
import ViewToggle, { useViewMode } from '../../../components/ViewToggle';
import { useGrades, useSubjects } from '../../../hooks/useCatalog';
import { useMaterials } from '../../../hooks/useMaterials';
import { SortOption } from '../../../types';

export default function GradeModulesPage() {
  const params = useParams<{ gradeSlug: string }>();
  const match = params.gradeSlug.match(/^grade-(\d+)$/);
  const level = match ? Number(match[1]) : NaN;

  const [subjectId, setSubjectId] = useState<number | undefined>(undefined);
  const [sort, setSort] = useState<SortOption>('recent');
  const [page, setPage] = useState(1);
  const [view, setView] = useViewMode();

  const grades = useGrades();
  const grade = grades.data?.find((g) => g.level === level);

  const subjects = useSubjects(grade?.id);
  const materials = useMaterials({
    gradeId: grade?.id,
    subjectId,
    sort,
    page,
    limit: 9,
  });

  if (!Number.isFinite(level)) {
    return <EmptyState message="Grade level not found." />;
  }

  const selectSubject = (id: number | undefined) => {
    setSubjectId(id);
    setPage(1);
  };

  return (
    <div>
      <div className="breadcrumbs">
        <Link href="/modules">Modules</Link> / Grade {level}
      </div>
      <div className="page-header">
        <h1>Grade {level} — Learning Materials</h1>
        <p>{grade ? `${grade._count?.subjects ?? 0} subjects, ${grade._count?.materials ?? 0} materials` : 'Loading grade...'}</p>
      </div>

      <div className="library-layout">
        <aside className="category-sidebar">
          <h2 className="category-heading">Categories</h2>
          {subjects.loading && <Loading />}
          {subjects.error && <ErrorBox message={subjects.error} onRetry={subjects.reload} />}
          <nav className="category-list" aria-label="Subjects">
            <button
              type="button"
              className={`category-item ${subjectId === undefined ? 'is-active' : ''}`}
              onClick={() => selectSubject(undefined)}
            >
              <span>All subjects</span>
              <span className="category-count">{grade?._count?.materials ?? 0}</span>
            </button>
            {subjects.data?.map((s) => (
              <button
                key={s.id}
                type="button"
                className={`category-item ${subjectId === s.id ? 'is-active' : ''}`}
                onClick={() => selectSubject(s.id)}
              >
                <span>{s.name}</span>
                <span className="category-count">{s._count?.materials ?? 0}</span>
              </button>
            ))}
          </nav>
        </aside>

        <section>
          <div className="toolbar">
            <label className="muted" htmlFor="sort">
              Sort:
            </label>
            <select id="sort" value={sort} onChange={(e) => setSort(e.target.value as SortOption)}>
              <option value="recent">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="title">Title A–Z</option>
              <option value="views">Most viewed</option>
              <option value="downloads">Most downloaded</option>
            </select>
            {subjectId !== undefined && (
              <span className="muted" style={{ fontSize: 13 }}>
                {materials.data ? `${materials.data.total} of ` : ''}
                {subjects.data?.find((s) => s.id === subjectId)?.name}
              </span>
            )}
            <ViewToggle mode={view} onChange={setView} />
          </div>

          {materials.loading && <Loading />}
          {materials.error && <ErrorBox message={materials.error} onRetry={materials.reload} />}
          {materials.data && materials.data.items.length === 0 && (
            <EmptyState message="No learning materials in this folder yet." />
          )}
          <div className={`grid${view === 'list' ? ' is-list' : ''}`}>
            {materials.data?.items.map((m) => <MaterialCard key={m.id} material={m} />)}
          </div>
          {materials.data && (
            <Pagination
              page={materials.data.page}
              totalPages={materials.data.totalPages}
              onChange={setPage}
            />
          )}
        </section>
      </div>
    </div>
  );
}