'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useResearch } from '../../../hooks/useResearch';
import { researchService } from '../../../services/research.service';
import { ResearchProject } from '../../../types';
import { fileExtension, formatDate, errorMessage, parseList } from '../../../utils/format';
import { Loading, ErrorBox, EmptyState } from '../../../components/Status';

export default function AdminResearchPage() {
  const { data, loading, error, reload } = useResearch({ limit: 100 });
  const [busy, setBusy] = useState<number | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const handleDelete = async (project: ResearchProject) => {
    if (!window.confirm(`Delete "${project.title}"? Chapters and files will be removed too.`)) return;
    setBusy(project.id);
    setErr(null);
    setNotice(null);
    try {
      await researchService.remove(project.id);
      setNotice('Research project deleted.');
      reload();
    } catch (e) {
      setErr(errorMessage(e));
    } finally {
      setBusy(null);
    }
  };

  return (
    <div>
      <div className="breadcrumbs">
        <Link href="/admin">Manage</Link> / Research Projects
      </div>
      <div className="page-header">
        <h1>Research Projects</h1>
        <p>{data?.total ?? 0} projects.</p>
      </div>
      <Link href="/admin/research/new" className="btn btn-primary" style={{ marginBottom: 16 }}>
        + New research project
      </Link>
      {notice && <p className="success-text">{notice}</p>}
      {err && <div className="error-box">{err}</div>}
      {loading && <Loading />}
      {error && <ErrorBox message={error} onRetry={reload} />}
      {data && data.items.length === 0 && <EmptyState message="No research projects yet." />}
      {data && data.items.length > 0 && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Authors</th>
                <th>Chapters</th>
                <th>Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((r) => (
                <tr key={r.id}>
                  <td>
                    <Link href={`/research/${r.id}`}>{r.title}</Link>
                  </td>
                  <td>{r.category.name}</td>
                  <td className="muted">{parseList(r.authors).join(', ') || 'Ã¢â‚¬â€'}</td>
                  <td>
                    {r.chapters.length > 0 && (
                      <span className="badge">{r.chapters.length} chapters</span>
                    )}
                    {r.file && (
                      <span className="badge badge-file">{fileExtension(r.file.originalFilename)}</span>
                    )}
                  </td>
                  <td className="muted">{formatDate(r.updatedAt)}</td>
                  <td>
                    <div className="row-actions">
                      <Link href={`/admin/research/${r.id}`} className="btn btn-sm btn-secondary">Edit</Link>
                      <button
                        className="btn btn-sm btn-danger"
                        disabled={busy === r.id}
                        onClick={() => handleDelete(r)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
