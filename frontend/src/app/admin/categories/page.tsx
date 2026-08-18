'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Loading, ErrorBox, EmptyState } from '../../../components/Status';
import { useCategories } from '../../../hooks/useCatalog';
import { categoriesService } from '../../../services/categories.service';
import { errorMessage } from '../../../utils/format';

export default function AdminCategoriesPage() {
  const { data, loading, error, reload } = useCategories();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (!name.trim() || !slug.trim()) return setErr('Name and slug are required.');
    setBusy(true);
    try {
      await categoriesService.create({ name: name.trim(), slug: slug.trim().toLowerCase().replace(/\s+/g, '-') });
      setName('');
      setSlug('');
      reload();
    } catch (e) {
      setErr(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this category? It must have no projects first.')) return;
    setErr(null);
    try {
      await categoriesService.remove(id);
      reload();
    } catch (e) {
      setErr(errorMessage(e));
    }
  };

  return (
    <div>
      <div className="breadcrumbs">
        <Link href="/admin">Manage</Link> / Research Categories
      </div>
      <div className="page-header">
        <h1>Research Categories</h1>
      </div>

      {err && <div className="error-box">{err}</div>}

      <form className="form-box" onSubmit={handleCreate}>
        <h2>Add category</h2>
        <div className="form-grid">
          <div className="form-field">
            <label htmlFor="name">Name</label>
            <input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Practical Research 3" />
          </div>
          <div className="form-field">
            <label htmlFor="slug">Slug</label>
            <input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="practical-research-3" />
          </div>
        </div>
        <div className="form-actions">
          <button className="btn btn-primary" disabled={busy} type="submit">Add category</button>
        </div>
      </form>

      {loading && <Loading />}
      {error && <ErrorBox message={error} onRetry={reload} />}
      {data && data.length === 0 && <EmptyState message="No categories yet." />}
      {data && data.length > 0 && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Slug</th>
                <th>Projects</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((c) => (
                <tr key={c.id}>
                  <td><strong>{c.name}</strong></td>
                  <td><code>{c.slug}</code></td>
                  <td>{c._count?.projects ?? 0}</td>
                  <td>
                    <div className="row-actions">
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(c.id)}>Delete</button>
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
