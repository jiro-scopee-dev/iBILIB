'use client';

import Link from 'next/link';

const links = [
  { href: '/admin/materials', title: 'Learning Materials', desc: 'Create, edit and delete learning materials' },
  { href: '/admin/research', title: 'Research Projects', desc: 'Manage research projects and chapters' },
  { href: '/admin/grades', title: 'Grades', desc: 'Manage grade levels' },
  { href: '/admin/subjects', title: 'Subjects', desc: 'Manage subjects per grade' },
  { href: '/admin/categories', title: 'Research Categories', desc: 'Manage research categories' },
  { href: '/admin/tags', title: 'Tags', desc: 'Manage tags' },
  { href: '/admin/files', title: 'Files', desc: 'Inspect and remove uploaded files' },
];

export default function AdminPage() {
  return (
    <div>
      <div className="page-header">
        <h1>Management</h1>
        <p>Development CRUD interfaces. Authentication and permissions will be added later.</p>
      </div>
      <div className="admin-links">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className="admin-link">
            <h3>{l.title}</h3>
            <p>{l.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
