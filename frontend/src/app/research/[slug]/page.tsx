'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import ResearchCard from '../../../components/ResearchCard';
import Pagination from '../../../components/Pagination';
import DownloadButton from '../../../components/DownloadButton';
import FileViewer from '../../../components/FileViewer';
import { Loading, ErrorBox, EmptyState } from '../../../components/Status';
import ViewToggle, { useViewMode } from '../../../components/ViewToggle';
import { useCategories } from '../../../hooks/useCatalog';
import { useResearch, useResearchProject, useRelatedResearch } from '../../../hooks/useResearch';
import { statsService } from '../../../services/stats.service';
import { filesService } from '../../../services/files.service';
import { formatDate, parseList } from '../../../utils/format';
import { SortOption } from '../../../types';

function ResearchDetail({ id }: { id: number }) {
  const { data: project, loading, error, reload } = useResearchProject(id);
  const related = useRelatedResearch(id);
  const viewRecorded = useRef(false);

  useEffect(() => {
    if (project && !viewRecorded.current) {
      viewRecorded.current = true;
      statsService.recordView('research', project.id).catch(() => {});
    }
  }, [project]);

  if (loading) return <Loading />;
  if (error) return <ErrorBox message={error} onRetry={reload} />;
  if (!project) return null;

  const authors = parseList(project.authors);
  const keywords = parseList(project.keywords);

  return (
    <div>
      <div className="breadcrumbs">
        <Link href="/research">Research</Link> /{' '}
        <Link href={`/research/${project.category.slug}`}>{project.category.name}</Link> / {project.title}
      </div>

      <div className="page-header">
        <h1>{project.title}</h1>
        <p>
          {authors.length > 0 && `${authors.join(', ')} Â· `}
          {project.gradeLevel ?? ''}
          {project.strand ? ` Â· ${project.strand}` : ''}
        </p>
      </div>

      <div className="stat-row">
        <div className="stat-box">
          <div className="num">{project.viewCount ?? 0}</div>
          <div className="label">Views</div>
        </div>
        <div className="stat-box">
          <div className="num">{project.downloadCount ?? 0}</div>
          <div className="label">Downloads</div>
        </div>
        <div className="stat-box">
          <div className="num">{project.chapters?.length ?? 0}</div>
          <div className="label">Chapters</div>
        </div>
      </div>

      <FileViewer
        resourceType="research"
        resourceId={project.id}
        file={project.file}
        downloadLabel="Download complete research document"
      />

      <div className="form-box">
        <h2>Research Information</h2>
        <ul className="detail-list">
          <li><strong>Category</strong> {project.category.name}</li>
          {authors.length > 0 && <li><strong>Authors</strong> {authors.join(', ')}</li>}
          {project.gradeLevel && <li><strong>Grade level</strong> {project.gradeLevel}</li>}
          {project.strand && <li><strong>Strand / Program</strong> {project.strand}</li>}
          {project.adviser && <li><strong>Research adviser</strong> {project.adviser}</li>}
          {project.school && <li><strong>School / Organization</strong> {project.school}</li>}
          {project.year && <li><strong>Year</strong> {project.year}</li>}
          <li><strong>Added</strong> {formatDate(project.createdAt)}</li>
          <li><strong>Last updated</strong> {formatDate(project.updatedAt)}</li>
        </ul>

        {project.abstract && (
          <>
            <h3 style={{ margin: '14px 0 6px' }}>Abstract</h3>
            <p>{project.abstract}</p>
          </>
        )}
        {project.description && (
          <>
            <h3 style={{ margin: '14px 0 6px' }}>Description</h3>
            <p>{project.description}</p>
          </>
        )}
        {keywords.length > 0 && (
          <div className="tag-list">
            {keywords.map((k) => <span key={k} className="badge">{k}</span>)}
          </div>
        )}

        {!project.file && <span className="muted">No complete research document attached.</span>}
      </div>

      <h2 className="section-title">Chapters</h2>
      {project.chapters && project.chapters.length > 0 ? (
        <div className="form-box">
          <ul className="chapter-list">
            {project.chapters.map((chapter) => (
              <li key={chapter.id}>
                <span>
                  <span className="num">{chapter.sortOrder}.</span> {chapter.title}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  {chapter.file && (
                    <DownloadButton
                      resourceType="chapter"
                      resourceId={chapter.id}
                      file={chapter.file}
                      label="Download"
                    />
                  )}
                  {!chapter.file && <span className="muted">No file</span>}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <EmptyState message="No chapters attached yet." />
      )}

      {project.references && (
        <>
          <h2 className="section-title">References</h2>
          <div className="form-box">
            <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{project.references}</pre>
          </div>
        </>
      )}

      {related.data && related.data.length > 0 && (
        <>
          <h2 className="section-title">Related Research</h2>
          <div className="grid">
            {related.data.map((r) => <ResearchCard key={r.id} project={r} />)}
          </div>
        </>
      )}
    </div>
  );
}

function ResearchCategoryList({ slug, categoryName }: { slug: string; categoryName: string }) {
  const [grade, setGrade] = useState<number | undefined>(undefined);
  const [sort, setSort] = useState<SortOption>('recent');
  const [page, setPage] = useState(1);
  const [view, setView] = useViewMode();
  const { data, loading, error, reload } = useResearch({ categorySlug: slug, grade, sort, page, limit: 9 });

  return (
    <div>
      <div className="breadcrumbs">
        <Link href="/research">Research</Link> / {categoryName}
      </div>
      <div className="page-header">
        <h1>{categoryName}</h1>
        <p>Research projects in this category.</p>
      </div>

      <div className="toolbar">
        <label className="muted" htmlFor="grade">Grade:</label>
        <select id="grade" value={grade ?? ''} onChange={(e) => { setPage(1); setGrade(e.target.value ? Number(e.target.value) : undefined); }}>
          <option value="">All grades</option>
          {[7, 8, 9, 10, 11, 12].map((g) => <option key={g} value={g}>Grade {g}</option>)}
        </select>
        <label className="muted" htmlFor="sort">Sort:</label>
<select id="sort" value={sort} onChange={(e) => setSort(e.target.value as SortOption)}>
          <option value="recent">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="title">Title A–Z</option>
          <option value="views">Most viewed</option>
          <option value="downloads">Most downloaded</option>
        </select>
        <ViewToggle mode={view} onChange={setView} />
      </div>

      {loading && <Loading />}
      {error && <ErrorBox message={error} onRetry={reload} />}
      {data && data.items.length === 0 && <EmptyState message="No research projects in this category." />}
      <div className={`grid${view === 'list' ? ' is-list' : ''}`}>
        {data?.items.map((r) => <ResearchCard key={r.id} project={r} />)}
      </div>
      {data && <Pagination page={data.page} totalPages={data.totalPages} onChange={setPage} />}
    </div>
  );
}

export default function ResearchSlugPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const categories = useCategories();

  if (categories.loading) return <Loading />;
  if (categories.error) return <ErrorBox message={categories.error} onRetry={categories.reload} />;

  const category = categories.data?.find((c) => c.slug === slug);
  if (category) return <ResearchCategoryList slug={category.slug} categoryName={category.name} />;

  const numericId = Number(slug);
  if (Number.isInteger(numericId) && numericId > 0) return <ResearchDetail id={numericId} />;

  return <EmptyState message="Research category or project not found." />;
}
