import type { Metadata } from 'next';
import styles from '../legal.module.css';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'How iBILIB handles the content and information stored in the library, and what data never leaves this machine.',
};

const SECTIONS: { title: string; body: React.ReactNode }[] = [
  {
    title: 'What iBILIB is',
    body: (
      <p>
        iBILIB is a local educational library platform. It keeps learning materials and research
        projects organized on the machine where it runs, and serves them over the network to
        browsers. This policy explains what information the platform stores, how it is used, and
        what it never does.
      </p>
    ),
  },
  {
    title: 'Information we store',
    body: (
      <>
        <p>iBILIB stores the following, on the machine that runs it:</p>
        <ul>
          <li>
            <strong>Content added through the manage section</strong> — grades, subjects,
            categories, tags, learning materials, research projects, chapters, references, and any
            files uploaded with them.
          </li>
          <li>
            <strong>Usage statistics</strong> — view and download counts for materials, research
            projects, and chapters, used for “most viewed” and “most downloaded” lists.
          </li>
          <li>
            <strong>A browser preference</strong> — whether you choose the card or list view is
            saved in your own browser’s local storage on your device. It never leaves your device.
          </li>
        </ul>
      </>
    ),
  },
  {
    title: 'How this information is used',
    body: (
      <p>
        Stored content is used to display the library, power search and filtering, compute
        statistics, and suggest related materials and research — all locally. Nothing is sold,
        shared, or sent anywhere else.
      </p>
    ),
  },
  {
    title: 'Personal information',
    body: (
      <p>
        iBILIB does not collect names, email addresses, or other personal information. There are
        no user accounts and no sign-up process. If a file you upload accidentally contains
        personal information, you stay in control — you can remove it through the manage section
        at any time.
      </p>
    ),
  },
  {
    title: 'Cookies and local storage',
    body: (
      <p>
        iBILIB uses no tracking cookies, no analytics scripts, and no advertising. The only thing
        stored on your device is the card/list view preference mentioned above, in your browser’s
        local storage.
      </p>
    ),
  },
  {
    title: 'Third-party requests',
    body: (
      <p>
        The home page displays decorative sample cover images loaded from
        <code> picsum.photos</code>. Loading them sends a basic page request to that third-party
        service — it contains no personal data. All other content is served from this machine.
      </p>
    ),
  },
  {
    title: 'Where data lives',
    body: (
      <p>
        All stored content lives in a local SQLite database and an uploads folder on the machine
        running iBILIB. There is no cloud storage and no data replication.
      </p>
    ),
  },
  {
    title: 'Access and security',
    body: (
      <p>
        This version of iBILIB has no login or user accounts. Anyone who can reach the app over
        the network — for example, someone on the same network as this machine — may be able to
        view and modify its contents. Do not upload anything you need to keep private, and
        consider who else has access to the network the app runs on.
      </p>
    ),
  },
  {
    title: 'Retention and deletion',
    body: (
      <p>
        Content you delete through the manage section is removed from the library and its files
        are deleted from the uploads folder. Resetting the database removes everything at once.
        iBILIB makes no automatic backups — keep your own copies of anything important.
      </p>
    ),
  },
  {
    title: 'Children',
    body: (
      <p>
        iBILIB is designed for school use, but it collects no personal information from anyone —
        including children — because it has no accounts and no data collection of any kind.
      </p>
    ),
  },
  {
    title: 'Changes to this policy',
    body: (
      <p>
        If this policy changes, the updated version will be posted on this page with a new date.
      </p>
    ),
  },
  {
    title: 'Contact',
    body: (
      <p>
        If you have questions about this policy or about privacy on your iBILIB instance, contact
        the administrator who set it up.
      </p>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>
          Privacy <em>Policy</em>
        </h1>
        <p className={styles.lede}>How iBILIB handles the information it stores.</p>
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
          Questions about this policy? Contact the administrator who set up your iBILIB instance.
        </p>
      </footer>
    </div>
  );
}