'use client';

import Link from 'next/link';
import { LearningMaterial } from '../types';
import { formatDate } from '../utils/format';
import { fileExtension } from '../utils/format';

export default function MaterialCard({ material }: { material: LearningMaterial }) {
  return (
    <article className="card">
      <div className="card-header">
        <span className="badge">{material.subject?.name ?? 'Subject'}</span>
        <span className="badge badge-muted">{material.grade?.name ?? 'Grade'}</span>
        {material.file && <span className="badge badge-file">{fileExtension(material.file.originalFilename)}</span>}
      </div>
      <Link href={`/materials/${material.id}`} className="card-title">
        {material.title}
      </Link>
      <p className="card-desc">
        {material.topic && <strong>{material.topic}. </strong>}
        {material.description}
      </p>
      <div className="card-footer">
        {material.author && <span className="muted">by {material.author}</span>}
        <span className="muted">
          {material.viewCount ?? 0} views · {material.downloadCount ?? 0} downloads
        </span>
        <span className="muted">{formatDate(material.createdAt)}</span>
      </div>
    </article>
  );
}
