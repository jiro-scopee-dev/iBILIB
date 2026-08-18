'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMaterials } from '../../../hooks/useMaterials';
import { materialsService } from '../../../services/materials.service';
import { LearningMaterial } from '../../../types';
import { fileExtension, formatDate, errorMessage } from '../../../utils/format';
import { Loading, ErrorBox, EmptyState } from '../../../components/Status';

export default function AdminMaterialsPage() {
  const { data, loading, error, reload } = useMaterials({ limit: 100 });
  const [busy, setBusy] = useState<number | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const handleDelete = async (material: LearningMaterial) => {
    if (!window.confirm(`Delete "${material.title}"? This also removes its file and stats.`)) return;
    setBusy(material.id);
    setErr(null);
    setNotice(null);
    try {
      await materialsService.remove(material.id);
      setNotice('Material deleted.');
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
        <Link href="/admin">Manage</Link> / Learning Materials
      </div>
      <div className="page-header">
        <h1>Learning Materials</h1>
        <p>{data?.total ?? 0} materials.</p>
      </div>
      <Link href="/admin/materials/new" className="btn btn-primary" style={{ marginBottom: 16 }}>
        + New material
      </Link>
      {notice && <p className="success-text">{notice}</p>}
      {err && <div className="error-box">{err}</div>}
      {loading && <Loading />}
      {error && <ErrorBox message={error} onRetry={reload} />}
      {data && data.items.length === 0 && <EmptyState message="No materials yet." />}
      {data && data.items.length > 0 && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Grade / Subject</th>
                <th>File</th>
                <th>Stats</th>
                <th>Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((m) => (
                <tr key={m.id}>
                  <td>
                    <Link href={`/materials/${m.id}`}>{m.title}</Link>
                  </td>
                  <td>{m.grade.name} Ã‚Â· {m.subject.name}</td>
                  <td>
                    {m.file ? (
                      <span className="badge badge-file">{fileExtension(m.file.originalFilename)}</span>
                    ) : (
                      <span className="muted">Ã¢â‚¬â€</span>
                    )}
                  </td>
                  <td className="muted">{m.viewCount ?? 0}v / {m.downloadCount ?? 0}d</td>
                  <td className="muted">{formatDate(m.updatedAt)}</td>
                  <td>
                    <div className="row-actions">
                      <Link href={`/admin/materials/${m.id}`} className="btn btn-sm btn-secondary">Edit</Link>
                      <button
                        className="btn btn-sm btn-danger"
                        disabled={busy === m.id}
                        onClick={() => handleDelete(m)}
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
