'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/library', label: 'Library' },
  { href: '/research', label: 'Research' },
  { href: '/search', label: 'Search' },
  { href: '/admin', label: 'Manage' },
];

export default function Navbar() {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <nav className="navbar" aria-label="Main">
      <div className="container navbar-inner">
        <Link href="/" className="navbar-brand">
          iBILIB
        </Link>
        <div className="navbar-links">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={isActive(link.href) ? 'is-active' : undefined}
              aria-current={isActive(link.href) ? 'page' : undefined}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
