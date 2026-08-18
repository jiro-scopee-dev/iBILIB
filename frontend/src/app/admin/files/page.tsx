'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Loading, ErrorBox, EmptyState } from '../../../components/Status';
import { filesService } from '../../../services/files.service';
import { useAsync } from '../../../hooks/useAsync';
import { FileInfo } from '../../../types';
import { errorMessage, formatBytes } from '../../../utils/format';

export default function AdminFilesPage() {
  const { data, loading, error, reload } = useAsync(() => filesService.list(), []);
  const [err, setErr] = useState<string | null>(null);

  const ownerLabel = (f: FileInfo) => {
    if (f.material) return `Material: ${f.material.title}`;
    if (f.researchProject) return `Research: ${f.researchProject.title}`;
    if (f.researchChapter) return `Chapter: ${f.researchChapter.title}`;
    return 'Unlinked';
  };

  const handleDelete = async (f: FileInfo) => {
    if (!window.confirm(`Delete file "${f.originalFilename}"?`)) return;
    setErr(null);
    try {
      await filesService.remove(f.id);
      reload();
    } catch (e) {
      setErr(errorMessage(e));
    }
  };

  return (
    <div>
      <div className="breadcrumbs">
        <Link href="/admin">Manage</Link> / Files
      </div>
      <div className="page-header">
        <h1>Files</h1>
        <p>Uploaded file records stored in the <code>uploads/</code> directory.</p>
      </div>

      {err && <div className="error-box">{err}</div>}
      {loading && <Loading />}
      {error && <ErrorBox message={error} onRetry={reload} />}
      {data && data.length === 0 && <EmptyState message="No files uploaded yet." />}
      {data && data.length > 0 && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Original name</th>
                <th>Size</th>
                <th>Type</th>
                <th>Linked to</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((f) => (
                <tr key={f.id}>
                  <td><strong>{f.originalFilename}</strong></td>
                  <td>{formatBytes(f.fileSize)}</td>
                  <td className="muted">{f.fileType}</td>
                  <td className="muted">{ownerLabel(f)}</td>
                  <td>
                    <div className="row-actions">
                      <a className="btn btn-sm btn-secondary" href={filesService.rawUrl(f.id)} target="_blank" rel="noreferrer">
                        View
                      </a>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(f)}>Delete</button>
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
