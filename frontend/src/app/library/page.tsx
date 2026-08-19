import Link from 'next/link';
import styles from './library.module.css';

const COLLECTIONS = [
  {
    index: '01',
    chapter: 'The Collection',
    title: 'Learning Materials',
    tag: 'Modules for grades 7 to 12, filed by subject and quarter.',
    body: 'The main archive — modules for every grade level, filed by subject, quarter, and module number, ready to read or download.',
    meta: ['Grades 7–12', 'By subject and quarter', 'Read · download · print'],
    href: '/modules',
    cta: 'Open Learning Materials',
  },
  {
    index: '02',
    chapter: 'The Stacks',
    title: 'Research Papers',
    tag: 'Projects bound and shelved whole, filed by category and chapter.',
    body: 'Research projects from proposal to findings — research project, practical research, and capstone, each with its chapters and references.',
    meta: ['Research Project', 'Practical Research 1 & 2', 'Capstone'],
    href: '/research',
    cta: 'Open Research Papers',
  },
];

export default function LibraryPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>
          The <em>library</em>
        </h1>
        <p className={styles.lede}>
          Every module and paper lives under one of two collections. Choose where to begin.
        </p>
      </header>

      <div className={styles.index}>
        {COLLECTIONS.map((c) => (
          <section key={c.index} className={styles.row}>
            <span className={styles.indexNumber}>{c.index}</span>
            <div className={styles.copy}>
              <div className={styles.chapter}>{c.chapter}</div>
              <h2 className={styles.rowTitle}>{c.title}</h2>
              <p className={styles.tag}>{c.tag}</p>
              <p className={styles.body}>{c.body}</p>
            </div>
            <div className={styles.rail}>
              <ul className={styles.meta}>
                {c.meta.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
              <Link href={c.href} className={styles.cta}>
                {c.cta}
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </section>
        ))}
      </div>

      <footer className={styles.outro}>
        <span className={styles.outroRule} aria-hidden="true" />
        <p>Two collections, one shelf.</p>
      </footer>
    </div>
  );
}