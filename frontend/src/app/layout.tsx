import type { Metadata } from 'next';
import Link from 'next/link';
import { Fraunces, Outfit } from 'next/font/google';
import './globals.css';
import Navbar from '../components/Navbar';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'iBILIB — Educational Library & Research',
    template: '%s · iBILIB',
  },
  description:
    'A digital library of learning materials for grades 7–12 and a research archive of projects, practical research and capstone papers.',
  metadataBase: new URL('http://localhost:3000'),
  openGraph: {
    title: 'iBILIB — Educational Library & Research',
    description:
      'A digital library of learning materials for grades 7–12 and a research archive of projects, practical research and capstone papers.',
    type: 'website',
  },
  twitter: { card: 'summary' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${outfit.variable} ${fraunces.variable}`}>
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <Navbar />
        <main id="main" className="container page">
          {children}
        </main>
        <footer className="container">
          <div className="footer">
            <p className="footer-note">iBILIB — educational library & research platform</p>
            <nav className="footer-links" aria-label="Footer">
              <Link href="/privacy">Privacy</Link>
              <Link href="/terms">Terms</Link>
            </nav>
          </div>
        </footer>
      </body>
    </html>
  );
}
