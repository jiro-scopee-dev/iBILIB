'use client';

import Link from 'next/link';
import ResearchCard from '../../components/ResearchCard';
import { Loading, ErrorBox } from '../../components/Status';
import ViewToggle, { useViewMode } from '../../components/ViewToggle';
import { useCategories } from '../../hooks/useCatalog';
import { useResearch } from '../../hooks/useResearch';

export default function ResearchPage() {
  const categories = useCategories();
  const recent = useResearch({ sort: 'recent', limit: 3 });
  const [view, setView] = useViewMode();

  return (
    <div>
      <div className="page-header">
        <h1>Research Library</h1>
        <p>Browse research projects by category.</p>
      </div>

      <h2 className="section-title">Categories</h2>
      <div className="toolbar">
        <ViewToggle mode={view} onChange={setView} />
      </div>
      {categories.loading && <Loading />}
      {categories.error && <ErrorBox message={categories.error} onRetry={categories.reload} />}
      <div className={`grid compact${view === 'list' ? ' is-list' : ''}`}>
        {categories.data?.map((cat) => (
          <Link key={cat.id} href={`/research/${cat.slug}`} className="card card-title">
            {cat.name}
            <span className="muted" style={{ fontWeight: 400, fontSize: 13 }}>
              {cat._count?.projects ?? 0} projects
            </span>
          </Link>
        ))}
      </div>

      <h2 className="section-title">Recent Research</h2>
      {recent.loading && <Loading />}
      {recent.error && <ErrorBox message={recent.error} onRetry={recent.reload} />}
      <div className={`grid${view === 'list' ? ' is-list' : ''}`}>
        {recent.data?.items.map((r) => <ResearchCard key={r.id} project={r} />)}
      </div>
      <Link href="/search?type=research" className="btn btn-secondary">
        Search all research
      </Link>
    </div>
  );
}
