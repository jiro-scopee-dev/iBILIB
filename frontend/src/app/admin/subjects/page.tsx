'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Loading, ErrorBox } from '../../../components/Status';
import { useGrades, useSubjects } from '../../../hooks/useCatalog';
import { subjectsService } from '../../../services/subjects.service';
import { errorMessage } from '../../../utils/format';

export default function AdminSubjectsPage() {
  const [gradeId, setGradeId] = useState<number | undefined>(undefined);
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const grades = useGrades();
  const subjects = useSubjects(gradeId);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setNotice(null);
    if (!name.trim() || !gradeId) return setErr('Subject name and grade are required.');
    setBusy(true);
    try {
      await subjectsService.create({ name: name.trim(), gradeId });
      setName('');
      setNotice('Subject created.');
      subjects.reload();
    } catch (e) {
      setErr(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this subject? It must have no materials first.')) return;
    setErr(null);
    try {
      await subjectsService.remove(id);
      subjects.reload();
    } catch (e) {
      setErr(errorMessage(e));
    }
  };

  return (
    <div>
      <div className="breadcrumbs">
        <Link href="/admin">Manage</Link> / Subjects
      </div>
      <div className="page-header">
        <h1>Subjects</h1>
      </div>

      {err && <div className="error-box">{err}</div>}
      {notice && <p className="success-text">{notice}</p>}

      <div className="toolbar">
        <label className="muted" htmlFor="grade">Grade:</label>
        <select
          id="grade"
          value={gradeId ?? ''}
          onChange={(e) => setGradeId(e.target.value ? Number(e.target.value) : undefined)}
        >
          <option value="">Select grade</option>
          {grades.data?.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
        </select>
      </div>

      <form className="form-box" onSubmit={handleCreate}>
        <h2>Add subject</h2>
        <div className="form-grid">
          <div className="form-field">
            <label htmlFor="name">Subject name</label>
            <input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Mathematics" />
          </div>
          <div className="form-field">
            <label htmlFor="gradeSel">Grade</label>
            <select id="gradeSel" value={gradeId ?? ''} onChange={(e) => setGradeId(e.target.value ? Number(e.target.value) : undefined)}>
              <option value="">Select grade</option>
              {grades.data?.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
          </div>
        </div>
        <div className="form-actions">
          <button className="btn btn-primary" disabled={busy || !gradeId} type="submit">Add subject</button>
        </div>
      </form>

      {subjects.loading && <Loading />}
      {subjects.error && <ErrorBox message={subjects.error} onRetry={subjects.reload} />}
      {subjects.data && subjects.data.length > 0 && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Grade</th>
                <th>Materials</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {subjects.data.map((s) => (
                <tr key={s.id}>
                  <td><strong>{s.name}</strong></td>
                  <td>{s.grade?.name ?? s.gradeId}</td>
                  <td>{s._count?.materials ?? 0}</td>
                  <td>
                    <div className="row-actions">
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(s.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {subjects.data && subjects.data.length === 0 && <p className="muted">No subjects for this grade.</p>}
    </div>
  );
}
