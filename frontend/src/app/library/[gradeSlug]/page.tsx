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

export default function GradeLibraryPage() {
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

  return (
    <div>
      <div className="breadcrumbs">
        <Link href="/library">Library</Link> / Grade {level}
      </div>
      <div className="page-header">
        <h1>Grade {level} — Learning Materials</h1>
        <p>{grade ? `${grade._count?.subjects ?? 0} subjects, ${grade._count?.materials ?? 0} materials` : 'Loading grade...'}</p>
      </div>

      <div className="toolbar">
        <button
          className={`btn btn-sm ${subjectId === undefined ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setSubjectId(undefined)}
        >
          All subjects
        </button>
        {subjects.data?.map((s) => (
          <button
            key={s.id}
            className={`btn btn-sm ${subjectId === s.id ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setSubjectId(s.id)}
          >
            {s.name}
          </button>
        ))}
      </div>

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
        <ViewToggle mode={view} onChange={setView} />
      </div>

      {materials.loading && <Loading />}
      {materials.error && <ErrorBox message={materials.error} onRetry={materials.reload} />}
      {materials.data && materials.data.items.length === 0 && (
        <EmptyState message="No learning materials in this grade yet." />
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
    </div>
  );
}