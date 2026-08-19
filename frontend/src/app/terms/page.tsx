import type { Metadata } from 'next';
import styles from '../legal.module.css';

export const metadata: Metadata = {
  title: 'Terms of Use',
  description:
    'The terms for using iBILIB — acceptable use, what you may upload, and what to expect from the service.',
};

const SECTIONS: { title: string; body: React.ReactNode }[] = [
  {
    title: 'Acceptance of these terms',
    body: (
      <p>
        By using iBILIB you agree to these terms. If you do not agree, do not use the platform.
        If you are a student using iBILIB through your school, these terms apply together with
        your school’s own rules and policies.
      </p>
    ),
  },
  {
    title: 'What the service is',
    body: (
      <p>
        iBILIB is a digital library of learning materials for grades 7–12 and a research archive
        of projects, practical research, and capstone papers. It is provided for study, teaching,
        and research.
      </p>
    ),
  },
  {
    title: 'Acceptable use',
    body: (
      <>
        <p>When you use iBILIB you agree to:</p>
        <ul>
          <li>Use stored materials and research only for study, teaching, and research.</li>
          <li>Cite sources properly and never pass off stored work as your own.</li>
          <li>
            Upload only content you have the right to share — your own work, or work you have
            permission to redistribute.
          </li>
          <li>Keep the platform free of unlawful, abusive, or harmful content.</li>
          <li>
            Not attempt to disrupt the platform, damage its data, or interfere with other users’
            access.
          </li>
        </ul>
        <p>You must not:</p>
        <ul>
          <li>
            Upload files you do not have rights to, including copyrighted work without permission.
          </li>
          <li>
            Upload malicious files, malware, or content designed to compromise other machines.
          </li>
          <li>
            Use stored content commercially without the permission of its authors.
          </li>
        </ul>
      </>
    ),
  },
  {
    title: 'Content you add',
    body: (
      <>
        <p>
          Anything you add through the manage section is visible to anyone who can open this app —
          this version has no login, accounts, or permissions. By adding content you represent that
          you have the right to share it, and you grant the instance the limited permission needed
          to store, display, and let users view and download it. You keep all of your own rights to
          your work.
        </p>
        <p>Uploads are limited to 50 MB per file and to these formats:</p>
        <ul>
          <li>Documents: PDF, DOC, DOCX</li>
          <li>Presentations: PPT, PPTX</li>
          <li>Spreadsheets: XLS, XLSX</li>
          <li>Images: PNG, JPG, JPEG</li>
        </ul>
      </>
    ),
  },
  {
    title: 'Intellectual property',
    body: (
      <p>
        The works stored in iBILIB belong to their authors and rights holders. iBILIB itself —
        its name, logo, and interface — belongs to the school that operates it. Nothing in these
        terms transfers those rights.
      </p>
    ),
  },
  {
    title: 'Availability and disclaimer of warranties',
    body: (
      <p>
        iBILIB is provided “as is” for educational use, without warranties of any kind. There is
        no guarantee of uptime, and stored data may be lost if the database is deleted, reset, or
        corrupted. Keep backups of anything important.
      </p>
    ),
  },
  {
    title: 'Limitation of liability',
    body: (
      <p>
        To the fullest extent permitted by law, the operators of iBILIB are not liable for loss
        of data, loss of files, or any damages arising from the use or unavailability of the
        platform.
      </p>
    ),
  },
  {
    title: 'Removal and suspension',
    body: (
      <p>
        Content that violates these terms — for example, unauthorized copyrighted work — may be
        removed by the administrator at any time, without notice. You are responsible for what
        you upload.
      </p>
    ),
  },
  {
    title: 'Changes to these terms',
    body: (
      <p>
        These terms may be updated as the platform develops. The current version will always be
        published on this page with a date.
      </p>
    ),
  },
  {
    title: 'Contact',
    body: (
      <p>
        For questions about these terms, contact the administrator who set up your iBILIB
        instance.
      </p>
    ),
  },
];

export default function TermsPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>
          Terms of <em>Use</em>
        </h1>
        <p className={styles.lede}>What you can expect from iBILIB, and what it expects from you.</p>
        <div className={styles.dateMeta}>Last updated · August 19, 2026</div>
      </header>

      <div className={styles.doc}>
        {SECTIONS.map((section, i) => (
          <section key={section.title} className={styles.section}>
            <span className={styles.num}>{String(i + 1).padStart(2, '0')}</span>
            <div className={styles.content}>
              <h2>{section.title}</h2>
              {section.body}
            </div>
          </section>
        ))}
      </div>

      <footer className={styles.outro}>
        <span className={styles.outroRule} aria-hidden="true" />
        <p>
          Questions about these terms? Contact the administrator who set up your iBILIB instance.
        </p>
      </footer>
    </div>
  );
}