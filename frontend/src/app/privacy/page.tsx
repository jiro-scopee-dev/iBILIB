import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Privacy' };

export default function PrivacyPage() {
  return (
    <div>
      <div className="page-header">
        <h1>Privacy</h1>
        <p>How iBILIB handles the information it stores.</p>
      </div>
      <div className="form-box">
        <p>
          iBILIB is a local research and learning tool. It stores the materials, research projects,
          files, and usage counts you add through the manage section. It does not collect personal
          information, does not use tracking cookies, and does not send data to third parties.
        </p>
        <p className="muted" style={{ marginTop: 14 }}>
          If you run iBILIB on a shared computer, consider who can see the uploaded files and
          delete anything sensitive when you are done.
        </p>
      </div>
    </div>
  );
}
