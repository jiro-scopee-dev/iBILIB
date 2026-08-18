'use client';

import { useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import MaterialCard from '../../../components/MaterialCard';
import DownloadButton from '../../../components/DownloadButton';
import { Loading, ErrorBox } from '../../../components/Status';
import { useMaterial, useRelatedMaterials } from '../../../hooks/useMaterials';
import { statsService } from '../../../services/stats.service';
import { formatDate } from '../../../utils/format';

export default function MaterialDetailPage() {
  const params = useParams<{ id: string }>();
  const { data: material, loading, error, reload } = useMaterial(params.id);
  const related = useRelatedMaterials(params.id);
  const viewRecorded = useRef(false);

  useEffect(() => {
    if (material && !viewRecorded.current) {
      viewRecorded.current = true;
      statsService.recordView('material', material.id).catch(() => {});
    }
  }, [material]);

  if (loading) return <Loading />;
  if (error) return <ErrorBox message={error} onRetry={reload} />;
  if (!material) return null;

  const tags = material.tags.map((t) => t.name);

  return (
    <div>
      <div className="breadcrumbs">
        <Link href="/library">Library</Link> /{' '}
        <Link href={`/library/grade-${material.grade.level}`}>{material.grade.name}</Link> / {material.title}
      </div>

      <div className="page-header">
        <h1>{material.title}</h1>
        <p>
          {material.grade.name} Â· {material.subject.name}
          {material.topic ? ` Â· ${material.topic}` : ''}
        </p>
      </div>

      <div className="stat-row">
        <div className="stat-box">
          <div className="num">{material.viewCount ?? 0}</div>
          <div className="label">Views</div>
        </div>
        <div className="stat-box">
          <div className="num">{material.downloadCount ?? 0}</div>
          <div className="label">Downloads</div>
        </div>
      </div>

      <div className="form-box">
        <h2>About this material</h2>
        <ul className="detail-list">
          <li><strong>Grade</strong> {material.grade.name}</li>
          <li><strong>Subject</strong> {material.subject.name}</li>
          {material.topic && <li><strong>Topic</strong> {material.topic}</li>}
          {material.author && <li><strong>Author</strong> {material.author}</li>}
          <li><strong>Added</strong> {formatDate(material.createdAt)}</li>
          <li><strong>Last updated</strong> {formatDate(material.updatedAt)}</li>
        </ul>
        {material.description && (
          <>
            <h3 style={{ margin: '14px 0 6px' }}>Description</h3>
            <p>{material.description}</p>
          </>
        )}
        {tags.length > 0 && (
          <div className="tag-list">
            {tags.map((t) => (
              <span key={t} className="badge">{t}</span>
            ))}
          </div>
        )}
        <div style={{ marginTop: 16 }}>
          {material.file ? (
            <DownloadButton
              resourceType="material"
              resourceId={material.id}
              file={material.file}
              label="Download material"
            />
          ) : (
            <span className="muted">No file attached to this material.</span>
          )}
        </div>
      </div>

      {related.data && related.data.length > 0 && (
        <>
          <h2 className="section-title">Related Materials</h2>
          <div className="grid">
            {related.data.map((m) => <MaterialCard key={m.id} material={m} />)}
          </div>
        </>
      )}
    </div>
  );
}
