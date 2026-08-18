import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Terms' };

export default function TermsPage() {
  return (
    <div>
      <div className="page-header">
        <h1>Terms</h1>
        <p>What you can expect from iBILIB, and what it expects from you.</p>
      </div>
      <div className="form-box">
        <h2>Use of content</h2>
        <p>
          Materials and research projects stored in iBILIB should only be used for study and
          research. Respect the authors — cite sources properly and do not pass off work as your
          own.
        </p>
        <h2>Your contributions</h2>
        <p>
          Anything you add through the manage section is stored locally on this machine and is
          visible to anyone who can open this app. Only upload files you have the right to share.
        </p>
        <h2>Availability</h2>
        <p>
          iBILIB is provided as-is for educational use. There is no guarantee of uptime, and data
          may be lost if the database is deleted. Keep backups of anything important.
        </p>
      </div>
    </div>
  );
}
