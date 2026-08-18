'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loading, ErrorBox } from '../../../../components/Status';
import { useGrades, useSubjects } from '../../../../hooks/useCatalog';
import { useMaterial } from '../../../../hooks/useMaterials';
import { materialsService } from '../../../../services/materials.service';
import { errorMessage } from '../../../../utils/format';

export default function MaterialFormPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const isNew = params.id === 'new';
  const existing = useMaterial(isNew ? undefined : params.id);

  const [title, setTitle] = useState('');
  const [gradeId, setGradeId] = useState<number | undefined>(undefined);
  const [subjectId, setSubjectId] = useState<number | undefined>(undefined);
  const [topic, setTopic] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const grades = useGrades();
  const subjects = useSubjects(gradeId);

  useEffect(() => {
    if (existing.data && !isNew) {
      setTitle(existing.data.title);
      setGradeId(existing.data.gradeId);
      setSubjectId(existing.data.subjectId);
      setTopic(existing.data.topic ?? '');
      setAuthor(existing.data.author ?? '');
      setDescription(existing.data.description ?? '');
      setTags(existing.data.tags.map((t) => t.name).join(', '));
    }
  }, [existing.data, isNew]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (!title.trim()) return setErr('Title is required.');
    if (!gradeId) return setErr('Grade is required.');
    if (!subjectId) return setErr('Subject is required.');

    const fd = new FormData();
    fd.set('title', title);
    fd.set('gradeId', String(gradeId));
    fd.set('subjectId', String(subjectId));
    fd.set('topic', topic);
    fd.set('author', author);
    fd.set('description', description);
    fd.set('tags', tags);
    if (file) fd.set('file', file);

    setBusy(true);
    try {
      if (isNew) {
        await materialsService.create(fd);
      } else {
        await materialsService.update(params.id, fd);
      }
      router.push('/admin/materials');
    } catch (e) {
      setErr(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  if (!isNew && existing.loading) return <Loading />;
  if (!isNew && existing.error) return <ErrorBox message={existing.error} onRetry={existing.reload} />;

  return (
    <div>
      <div className="breadcrumbs">
        <Link href="/admin">Manage</Link> / <Link href="/admin/materials">Materials</Link> / {isNew ? 'New' : `#${params.id}`}
      </div>
      <div className="page-header">
        <h1>{isNew ? 'New Material' : `Edit Material #${params.id}`}</h1>
        {!isNew && existing.data?.file && (
          <p className="muted">
            Current file: {existing.data.file.originalFilename} — upload a new file to replace it.
          </p>
        )}
      </div>

      {err && <div className="error-box">{err}</div>}

      <form className="form-box" onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-field full">
            <label htmlFor="title">Title *</label>
            <input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="form-field">
            <label htmlFor="grade">Grade *</label>
            <select
              id="grade"
              value={gradeId ?? ''}
              onChange={(e) => { setGradeId(e.target.value ? Number(e.target.value) : undefined); setSubjectId(undefined); }}
            >
              <option value="">Select grade</option>
              {grades.data?.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
          </div>
          <div className="form-field">
            <label htmlFor="subject">Subject *</label>
            <select
              id="subject"
              value={subjectId ?? ''}
              onChange={(e) => setSubjectId(e.target.value ? Number(e.target.value) : undefined)}
            >
              <option value="">Select subject</option>
              {subjects.data?.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="form-field">
            <label htmlFor="topic">Topic</label>
            <input id="topic" value={topic} onChange={(e) => setTopic(e.target.value)} />
          </div>
          <div className="form-field">
            <label htmlFor="author">Author</label>
            <input id="author" value={author} onChange={(e) => setAuthor(e.target.value)} />
          </div>
          <div className="form-field">
            <label htmlFor="tags">Tags (comma separated)</label>
            <input id="tags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="statistics, math" />
          </div>
          <div className="form-field">
            <label htmlFor="file">File (PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, PNG, JPG, JPEG — max 50 MB)</label>
            <input id="file" type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          </div>
          <div className="form-field full">
            <label htmlFor="description">Description</label>
            <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
        </div>
        <div className="form-actions">
          <button className="btn btn-primary" disabled={busy} type="submit">
            {busy ? 'Saving...' : isNew ? 'Create material' : 'Save changes'}
          </button>
          <Link href="/admin/materials" className="btn btn-secondary">Cancel</Link>
        </div>
      </form>
    </div>
  );
}