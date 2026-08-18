'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loading, ErrorBox } from '../../../../components/Status';
import { useCategories } from '../../../../hooks/useCatalog';
import { useResearchProject } from '../../../../hooks/useResearch';
import { researchService } from '../../../../services/research.service';
import { filesService } from '../../../../services/files.service';
import { statsService } from '../../../../services/stats.service';
import { errorMessage, formatBytes } from '../../../../utils/format';

export default function ResearchFormPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const isNew = params.id === 'new';
  const { data: existing, loading, error, reload } = useResearchProject(isNew ? undefined : params.id);

  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined);
  const [authors, setAuthors] = useState('');
  const [gradeLevel, setGradeLevel] = useState('');
  const [strand, setStrand] = useState('');
  const [adviser, setAdviser] = useState('');
  const [school, setSchool] = useState('');
  const [year, setYear] = useState('');
  const [keywords, setKeywords] = useState('');
  const [abstract, setAbstract] = useState('');
  const [description, setDescription] = useState('');
  const [references, setReferences] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Chapter form state
  const [chapterTitle, setChapterTitle] = useState('');
  const [chapterContent, setChapterContent] = useState('');
  const [chapterSort, setChapterSort] = useState('');
  const [chapterFile, setChapterFile] = useState<File | null>(null);
  const [chapterBusy, setChapterBusy] = useState(false);
  const [chapterErr, setChapterErr] = useState<string | null>(null);

  const categories = useCategories();

  useEffect(() => {
    if (existing && !isNew) {
      setTitle(existing.title);
      setCategoryId(existing.categoryId);
      setAuthors(existing.authors ? JSON.parse(existing.authors).join(', ') : '');
      setGradeLevel(existing.gradeLevel ?? '');
      setStrand(existing.strand ?? '');
      setAdviser(existing.adviser ?? '');
      setSchool(existing.school ?? '');
      setYear(existing.year ? String(existing.year) : '');
      setKeywords(existing.keywords ? JSON.parse(existing.keywords).join(', ') : '');
      setAbstract(existing.abstract ?? '');
      setDescription(existing.description ?? '');
      setReferences(existing.references ?? '');
    }
  }, [existing, isNew]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (!title.trim()) return setErr('Title is required.');
    if (!categoryId) return setErr('Category is required.');

    const fd = new FormData();
    fd.set('title', title);
    fd.set('categoryId', String(categoryId));
    fd.set('authors', authors.split(',').map((a) => a.trim()).filter(Boolean).join(','));
    fd.set('gradeLevel', gradeLevel);
    fd.set('strand', strand);
    fd.set('adviser', adviser);
    fd.set('school', school);
    fd.set('year', year);
    fd.set('keywords', keywords.split(',').map((k) => k.trim()).filter(Boolean).join(','));
    fd.set('abstract', abstract);
    fd.set('description', description);
    fd.set('references', references);
    if (file) fd.set('file', file);

    setBusy(true);
    try {
      if (isNew) {
        await researchService.create(fd);
      } else {
        await researchService.update(params.id, fd);
      }
      router.push('/admin/research');
    } catch (e) {
      setErr(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const handleAddChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    setChapterErr(null);
    if (!existing) return;
    if (!chapterTitle.trim()) return setChapterErr('Chapter title is required.');
    const fd = new FormData();
    fd.set('title', chapterTitle);
    fd.set('content', chapterContent);
    if (chapterSort) fd.set('sortOrder', chapterSort);
    if (chapterFile) fd.set('file', chapterFile);
    setChapterBusy(true);
    try {
      await researchService.addChapter(existing.id, fd);
      setChapterTitle('');
      setChapterContent('');
      setChapterSort('');
      setChapterFile(null);
      reload();
    } catch (e) {
      setChapterErr(errorMessage(e));
    } finally {
      setChapterBusy(false);
    }
  };

  const handleDeleteChapter = async (chapterId: number) => {
    if (!existing) return;
    if (!window.confirm('Delete this chapter and its file?')) return;
    try {
      await researchService.removeChapter(chapterId);
      reload();
    } catch (e) {
      setChapterErr(errorMessage(e));
    }
  };

  if (!isNew && loading) return <Loading />;
  if (!isNew && error) return <ErrorBox message={error} onRetry={reload} />;

  return (
    <div>
      <div className="breadcrumbs">
        <Link href="/admin">Manage</Link> / <Link href="/admin/research">Research</Link> / {isNew ? 'New' : `#${params.id}`}
      </div>
      <div className="page-header">
        <h1>{isNew ? 'New Research Project' : `Edit Research Project #${params.id}`}</h1>
      </div>

      {err && <div className="error-box">{err}</div>}

      <form className="form-box" onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-field full">
            <label htmlFor="title">Research title *</label>
            <input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="form-field">
            <label htmlFor="category">Category *</label>
            <select id="category" value={categoryId ?? ''} onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : undefined)}>
              <option value="">Select category</option>
              {categories.data?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="form-field">
            <label htmlFor="year">Year</label>
            <input id="year" type="number" value={year} onChange={(e) => setYear(e.target.value)} placeholder="2025" />
          </div>
          <div className="form-field">
            <label htmlFor="authors">Authors (comma separated)</label>
            <input id="authors" value={authors} onChange={(e) => setAuthors(e.target.value)} placeholder="M. Reyes, A. Cruz" />
          </div>
          <div className="form-field">
            <label htmlFor="gradeLevel">Grade level</label>
            <select id="gradeLevel" value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)}>
              <option value="">Select grade</option>
              {[7, 8, 9, 10, 11, 12].map((g) => <option key={g} value={`Grade ${g}`}>Grade {g}</option>)}
            </select>
          </div>
          <div className="form-field">
            <label htmlFor="strand">Strand / Program</label>
            <input id="strand" value={strand} onChange={(e) => setStrand(e.target.value)} placeholder="STEM, HUMSS, ICT..." />
          </div>
          <div className="form-field">
            <label htmlFor="adviser">Research adviser</label>
            <input id="adviser" value={adviser} onChange={(e) => setAdviser(e.target.value)} />
          </div>
          <div className="form-field">
            <label htmlFor="school">School / Organization</label>
            <input id="school" value={school} onChange={(e) => setSchool(e.target.value)} />
          </div>
          <div className="form-field">
            <label htmlFor="keywords">Keywords (comma separated)</label>
            <input id="keywords" value={keywords} onChange={(e) => setKeywords(e.target.value)} />
          </div>
          <div className="form-field full">
            <label htmlFor="file">Research document (complete paper)</label>
            <input id="file" type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            {!isNew && existing?.file && <p className="hint">Current: {existing.file.originalFilename} ({formatBytes(existing.file.fileSize)}). Upload a new file to replace it.</p>}
          </div>
          <div className="form-field full">
            <label htmlFor="abstract">Abstract</label>
            <textarea id="abstract" value={abstract} onChange={(e) => setAbstract(e.target.value)} />
          </div>
          <div className="form-field full">
            <label htmlFor="description">Description</label>
            <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="form-field full">
            <label htmlFor="references">References</label>
            <textarea id="references" value={references} onChange={(e) => setReferences(e.target.value)} />
          </div>
        </div>
        <div className="form-actions">
          <button className="btn btn-primary" disabled={busy} type="submit">
            {busy ? 'Saving...' : isNew ? 'Create project' : 'Save changes'}
          </button>
          <Link href="/admin/research" className="btn btn-secondary">Cancel</Link>
        </div>
      </form>

      {!isNew && existing && (
        <div className="form-box">
          <h2>Chapters ({existing.chapters.length})</h2>
          {existing.chapters.length > 0 && (
            <ul className="chapter-list" style={{ marginBottom: 16 }}>
              {existing.chapters.map((ch) => (
                <li key={ch.id}>
                  <span>
                    <span className="num">{ch.sortOrder}.</span> {ch.title}
                    {ch.file && (
                      <span className="badge badge-file" style={{ marginLeft: 8 }}>
                        {ch.file.originalFilename}
                      </span>
                    )}
                  </span>
                  <span className="row-actions">
                    <a
                      className="btn btn-sm btn-secondary"
                      href={ch.file ? filesService.rawUrl(ch.file.id) : '#'}
                      onClick={(e) => {
                        e.preventDefault();
                        if (ch.file) {
                          statsService.recordDownload('chapter', ch.id).catch(() => {});
                          window.open(filesService.rawUrl(ch.file.id), '_blank');
                        }
                      }}
                    >
                      Preview
                    </a>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDeleteChapter(ch.id)}>
                      Delete
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          )}
          {chapterErr && <div className="error-box">{chapterErr}</div>}
          <form onSubmit={handleAddChapter}>
            <div className="form-grid">
              <div className="form-field">
                <label htmlFor="chapterTitle">Chapter title *</label>
                <input id="chapterTitle" value={chapterTitle} onChange={(e) => setChapterTitle(e.target.value)} placeholder="Chapter 6: ..." />
              </div>
              <div className="form-field">
                <label htmlFor="chapterSort">Order</label>
                <input id="chapterSort" type="number" value={chapterSort} onChange={(e) => setChapterSort(e.target.value)} placeholder="auto" />
              </div>
              <div className="form-field full">
                <label htmlFor="chapterFile">Chapter file</label>
                <input id="chapterFile" type="file" onChange={(e) => setChapterFile(e.target.files?.[0] ?? null)} />
              </div>
              <div className="form-field full">
                <label htmlFor="chapterContent">Chapter notes / summary</label>
                <textarea id="chapterContent" value={chapterContent} onChange={(e) => setChapterContent(e.target.value)} />
              </div>
            </div>
            <div className="form-actions">
              <button className="btn btn-primary" disabled={chapterBusy} type="submit">
                {chapterBusy ? 'Adding...' : '+ Add chapter'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}