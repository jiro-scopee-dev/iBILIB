'use client';

import Link from 'next/link';
import { ResearchProject } from '../types';
import { fileExtension, formatDate, parseList } from '../utils/format';

export default function ResearchCard({ project }: { project: ResearchProject }) {
  const authors = parseList(project.authors);
  return (
    <article className="card">
      <div className="card-header">
        <span className="badge">{project.category?.name ?? 'Research'}</span>
        {project.strand && <span className="badge badge-muted">{project.strand}</span>}
        {project.gradeLevel && <span className="badge badge-muted">{project.gradeLevel}</span>}
        {project.file && <span className="badge badge-file">{fileExtension(project.file.originalFilename)}</span>}
      </div>
      <Link href={`/research/${project.id}`} className="card-title">
        {project.title}
      </Link>
      <p className="card-desc">
        {authors.length > 0 && <strong>{authors.join(', ')}. </strong>}
        {project.abstract}
      </p>
      <div className="card-footer">
        <span className="muted">
          {project.year ?? '—'} · {project.chapters?.length ?? 0} chapters
        </span>
        <span className="muted">
          {project.viewCount ?? 0} views · {project.downloadCount ?? 0} downloads
        </span>
        <span className="muted">{formatDate(project.createdAt)}</span>
      </div>
    </article>
  );
}
