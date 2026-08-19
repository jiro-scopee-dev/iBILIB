'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Loading, ErrorBox } from '../../../components/Status';
import { useGrades } from '../../../hooks/useCatalog';
import { gradesService } from '../../../services/grades.service';
import { Grade } from '../../../types';
import { errorMessage } from '../../../utils/format';

export default function AdminGradesPage() {
  const { data, loading, error, reload } = useGrades();
  const [name, setName] = useState('');
  const [level, setLevel] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setNotice(null);
    if (!name.trim() || !level) return setErr('Name and level are required.');
    setBusy(true);
    try {
      await gradesService.create({ name: name.trim(), level: Number(level) });
      setName('');
      setLevel('');
      setNotice('Grade created.');
      reload();
    } catch (e) {
      setErr(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (grade: Grade) => {
    if (!window.confirm(`Delete ${grade.name}? Its subjects must be empty first.`)) return;
    setErr(null);
    try {
      await gradesService.remove(grade.id);
      reload();
    } catch (e) {
      setErr(errorMessage(e));
    }
  };

  return (
    <div>
      <div className="breadcrumbs">
        <Link href="/admin">Manage</Link> / Grades
      </div>
      <div className="page-header">
        <h1>Grades</h1>
      </div>

      {loading && <Loading />}
      {error && <ErrorBox message={error} onRetry={reload} />}
      {err && <div className="error-box">{err}</div>}
      {notice && <p className="success-text">{notice}</p>}

      <form className="form-box" onSubmit={handleCreate}>
        <h2>Add grade</h2>
        <div className="form-grid">
          <div className="form-field">
            <label htmlFor="name">Name</label>
            <input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Grade 13" />
          </div>
          <div className="form-field">
            <label htmlFor="level">Level number</label>
            <input id="level" type="number" value={level} onChange={(e) => setLevel(e.target.value)} placeholder="13" />
          </div>
        </div>
        <div className="form-actions">
          <button className="btn btn-primary" disabled={busy} type="submit">Add grade</button>
        </div>
      </form>

      {data && data.length > 0 && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Level</th>
                <th>Subjects</th>
                <th>Materials</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((g) => (
                <tr key={g.id}>
                  <td><strong>{g.name}</strong></td>
                  <td>{g.level}</td>
                  <td>{g._count?.subjects ?? 0}</td>
                  <td>{g._count?.materials ?? 0}</td>
                  <td>
                    <div className="row-actions">
                      <Link href={`/modules/grade-${g.level}`} className="btn btn-sm btn-secondary">View</Link>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(g)}>Delete</button>
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
