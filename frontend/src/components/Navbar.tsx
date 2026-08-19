'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import anhsLogo from '../../assets/ANHSLogo.png';
import bilibLogo from '../../assets/Bilib.png';

const links = [
  { href: '/', label: 'Home' },
  { href: '/library', label: 'Library' },
  { href: '/research', label: 'Research' },
  { href: '/modules', label: 'Learning Materials' },
  { href: '/search', label: 'Search' },
];

export default function Navbar() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <nav className="navbar" aria-label="Main">
      <div className="container navbar-inner">
        <Link href="/" className="navbar-brand">
          <Image src={anhsLogo} alt="ANHS logo" width={40} height={56} className="navbar-logo" priority />
          iBILIB
          <Image src={bilibLogo} alt="Bilib logo" width={28} height={28} className="navbar-logo navbar-logo-tile" priority />
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