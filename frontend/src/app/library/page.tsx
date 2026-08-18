'use client';

import Link from 'next/link';
import { Loading, ErrorBox } from '../../components/Status';
import ViewToggle, { useViewMode } from '../../components/ViewToggle';
import { useGrades } from '../../hooks/useCatalog';

export default function LibraryPage() {
  const grades = useGrades();
  const [view, setView] = useViewMode();

  return (
    <div>
      <div className="page-header">
        <h1>Learning Materials Library</h1>
        <p>Browse learning materials organized by grade level.</p>
      </div>
      {grades.loading && <Loading />}
      {grades.error && <ErrorBox message={grades.error} onRetry={grades.reload} />}
      <div className="toolbar">
        <ViewToggle mode={view} onChange={setView} />
      </div>
      <div className={`grid${view === 'list' ? ' is-list' : ''}`}>
        {grades.data?.map((grade) => (
          <Link key={grade.id} href={`/library/grade-${grade.level}`} className="card card-title">
            {grade.name}
            <span className="muted" style={{ fontWeight: 400, fontSize: 13 }}>
              {grade._count?.subjects ?? 0} subjects Â· {grade._count?.materials ?? 0} materials
            </span>
          </Link>
        ))}
      </div>
      <Link href="/search" className="btn btn-secondary">
        Search all materials
      </Link>
    </div>
  );
}
