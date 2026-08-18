'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Loading, ErrorBox, EmptyState } from '../../../components/Status';
import { useTags } from '../../../hooks/useCatalog';
import { tagsService } from '../../../services/tags.service';
import { errorMessage } from '../../../utils/format';

export default function AdminTagsPage() {
  const { data, loading, error, reload } = useTags();
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (!name.trim()) return setErr('Tag name is required.');
    setBusy(true);
    try {
      await tagsService.create(name.trim());
      setName('');
      reload();
    } catch (e) {
      setErr(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this tag? It will be removed from all materials.')) return;
    setErr(null);
    try {
      await tagsService.remove(id);
      reload();
    } catch (e) {
      setErr(errorMessage(e));
    }
  };

  return (
    <div>
      <div className="breadcrumbs">
        <Link href="/admin">Manage</Link> / Tags
      </div>
      <div className="page-header">
        <h1>Tags</h1>
      </div>

      {err && <div className="error-box">{err}</div>}

      <form className="form-box" onSubmit={handleCreate}>
        <h2>Add tag</h2>
        <div className="form-field">
          <label htmlFor="name">Tag name</label>
          <input id="name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="form-actions">
          <button className="btn btn-primary" disabled={busy} type="submit">Add tag</button>
        </div>
      </form>

      {loading && <Loading />}
      {error && <ErrorBox message={error} onRetry={reload} />}
      {data && data.length === 0 && <EmptyState message="No tags yet." />}
      {data && data.length > 0 && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Tag</th>
                <th>Materials</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((t) => (
                <tr key={t.id}>
                  <td><strong>{t.name}</strong></td>
                  <td>{t._count?.materials ?? 0}</td>
                  <td>
                    <div className="row-actions">
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(t.id)}>Delete</button>
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
