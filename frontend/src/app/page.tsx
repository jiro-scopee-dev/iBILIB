'use client';

import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="home">
      <div className="home-header">
        <span className="home-eyebrow">A digital library for grades 7–12</span>
        <h1>iBILIB</h1>
        <p>Educational Library & Research</p>
      </div>
      <div className="home-choices">
        <Link href="/library" className="home-choice">
          <span className="choice-index">01</span>
          <h2>Learning Materials</h2>
          <p>Browse learning materials by grade level.</p>
          <span className="choice-arrow" aria-hidden="true">
            →
          </span>
        </Link>
        <Link href="/research" className="home-choice">
          <span className="choice-index">02</span>
          <h2>Research</h2>
          <p>Browse research projects by category.</p>
          <span className="choice-arrow" aria-hidden="true">
            →
          </span>
        </Link>
      </div>
    </div>
  );
}
