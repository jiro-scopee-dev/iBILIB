import Link from 'next/link';

export const metadata = { title: 'Page not found' };

export default function NotFound() {
  return (
    <div className="notfound">
      <div className="nf-code" aria-hidden="true">
        404
      </div>
      <h1>This page is missing from the shelf</h1>
      <p>The page you are looking for may have moved, or never existed.</p>
      <Link href="/" className="btn btn-primary">
        Back to the library
      </Link>
    </div>
  );
}
