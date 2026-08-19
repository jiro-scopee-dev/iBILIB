'use client';

import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useCategories, useGrades } from '../hooks/useCatalog';
import styles from './home.module.css';

gsap.registerPlugin(ScrollTrigger);

const FALLBACK_GRADES = [
  { id: 1, name: 'Grade 7', level: 7, _count: { subjects: 17, materials: 166 } },
  { id: 2, name: 'Grade 8', level: 8, _count: { subjects: 17, materials: 150 } },
  { id: 3, name: 'Grade 9', level: 9, _count: { subjects: 13, materials: 147 } },
  { id: 4, name: 'Grade 10', level: 10, _count: { subjects: 14, materials: 157 } },
  { id: 5, name: 'Grade 11', level: 11, _count: { subjects: 48, materials: 596 } },
  { id: 6, name: 'Grade 12', level: 12, _count: { subjects: 48, materials: 595 } },
];

const RESEARCH_FALLBACK: Record<string, number> = {
  'research-project': 8,
  'practical-research-1': 4,
  'practical-research-2': 3,
  capstone: 46,
};

const RESEARCH_TABS: {
  slug: string;
  chapter: string;
  title: string;
  note: string;
  seed: string;
}[] = [
  {
    slug: 'research-project',
    chapter: 'Completed Studies',
    title: 'Research Project',
    note: 'Sustained inquiry from proposal to findings, bound and shelved whole.',
    seed: 'ibilib-rp',
  },
  {
    slug: 'practical-research-1',
    chapter: 'Field Notes',
    title: 'Practical Research 1',
    note: 'Qualitative groundwork — the first papers a researcher writes.',
    seed: 'ibilib-pr1',
  },
  {
    slug: 'practical-research-2',
    chapter: 'The Analysis',
    title: 'Practical Research 2',
    note: 'Quantitative work — data, instruments, and statistics in practice.',
    seed: 'ibilib-pr2',
  },
  {
    slug: 'capstone',
    chapter: 'The Final Bind',
    title: 'Capstone',
    note: 'Culminating papers — feasibility studies, prototypes, and theses in full.',
    seed: 'ibilib-capstone',
  },
];

interface ShelfTab {
  id: string;
  title: string;
  chapter: string;
  note: string;
  count: number;
  sub: string;
  seed: string;
  href: string;
}

function coverUrl(seed: string, tall: boolean) {
  return `https://picsum.photos/seed/${seed}/${tall ? 900 : 1200}/${tall ? 1200 : 900}`;
}

export default function HomePage() {
  const root = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);

  const { data } = useGrades();
  const grades = useMemo(() => (data && data.length ? data : FALLBACK_GRADES), [data]);
  const totalModules = useMemo(() => grades.reduce((s, g) => s + (g._count?.materials ?? 0), 0), [grades]);
  const totalSubjects = useMemo(() => grades.reduce((s, g) => s + (g._count?.subjects ?? 0), 0), [grades]);

  const { data: categories } = useCategories();
  const tabs = useMemo<ShelfTab[]>(() => {
    const researchCount = (slug: string) =>
      categories?.find((c) => c.slug === slug)?._count?.projects ?? RESEARCH_FALLBACK[slug] ?? 0;
    const materials: ShelfTab = {
      id: 'materials',
      title: 'Learning Materials',
      chapter: 'The Collection',
      note: 'The main archive — modules for grades 7 to 12, filed by subject, quarter, and module number.',
      count: totalModules,
      sub: `${grades.length} grade levels · ${totalSubjects} subjects`,
      seed: 'ibilib-materials',
      href: '/modules',
    };
    return [
      materials,
      ...RESEARCH_TABS.map<ShelfTab>((t) => ({
        id: t.slug,
        title: t.title,
        chapter: t.chapter,
        note: t.note,
        count: researchCount(t.slug),
        sub: 'research works',
        seed: t.seed,
        href: `/research/${t.slug}`,
      })),
    ];
  }, [categories, grades, totalModules, totalSubjects]);

  const totalResearch = useMemo(
    () => tabs.reduce((s, t) => (t.id === 'materials' ? s : s + t.count), 0),
    [tabs],
  );

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', () => {
        const coverEls = gsap.utils.toArray<HTMLElement>('[data-cover]');
        const bodyEls = gsap.utils.toArray<HTMLElement>('[data-body]');

        gsap.from('[data-hero-copy] > *', {
          y: 34,
          opacity: 0,
          stagger: 0.1,
          duration: 1,
          ease: 'power3.out',
          delay: 0.15,
        });
        gsap.from('[data-cover-tilt]', {
          y: 48,
          rotate: 0,
          opacity: 0,
          stagger: 0.14,
          duration: 1.1,
          ease: 'power3.out',
          delay: 0.35,
        });

        const viewport = document.querySelector<HTMLElement>('[data-shelf-viewport]');
        const track = trackRef.current;
        const count = tabs.length;
        if (!viewport || !track || count < 2) return;

        const scrollDist = () => track.scrollWidth - viewport.clientWidth;
        const tween = gsap.to(track, {
          x: () => -scrollDist(),
          ease: 'none',
          scrollTrigger: {
            trigger: viewport.parentElement,
            start: 'top top',
            end: () => '+=' + scrollDist(),
            scrub: 0.6,
            pin: true,
            snap: {
              snapTo: (v: number) => (1 / (count - 1)) * Math.round(v * (count - 1)),
              duration: { min: 0.25, max: 0.7 },
              ease: 'power2.inOut',
            },
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              setActive(Math.round(self.progress * (count - 1)));
              setProgress(self.progress);
            },
          },
        });
        tweenRef.current = tween;

        coverEls.forEach((el) => {
          gsap.fromTo(
            el,
            { scale: 0.84, opacity: 0.72 },
            {
              keyframes: [
                { scale: 1, opacity: 1 },
                { scale: 1.05, opacity: 0.2 },
              ],
              ease: 'none',
              scrollTrigger: {
                trigger: el.closest('[data-book]'),
                containerAnimation: tween,
                start: 'left center',
                end: 'right center',
                scrub: 0.4,
              },
            },
          );
        });

        bodyEls.forEach((el) => {
          gsap.fromTo(
            el,
            { x: 70 },
            {
              x: -70,
              ease: 'none',
              scrollTrigger: {
                trigger: el.closest('[data-book]'),
                containerAnimation: tween,
                start: 'left center',
                end: 'right center',
                scrub: 0.4,
              },
            },
          );
        });

        const words = gsap.utils.toArray<HTMLElement>('[data-tagline] .word');
        if (words.length) {
          gsap.fromTo(
            words,
            { opacity: 0.12 },
            {
              opacity: 1,
              stagger: 0.045,
              ease: 'none',
              scrollTrigger: {
                trigger: '[data-tagline]',
                start: 'top 78%',
                end: 'bottom 40%',
                scrub: 0.5,
              },
            },
          );
        }

        return () => {
          tweenRef.current = null;
        };
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  useLayoutEffect(() => {
    document.documentElement.dataset.hw = String(
      document.documentElement.scrollWidth <= document.documentElement.clientWidth,
    );
  }, []);

  const goTo = (index: number) => {
    const tween = tweenRef.current;
    const st = tween?.scrollTrigger;
    if (!st || !tween) return;
    const target = st.start + (st.end - st.start) * (index / Math.max(1, tabs.length - 1));
    const proxy = { v: st.scroll() };
    gsap.to(proxy, {
      v: target,
      duration: 0.8,
      ease: 'power2.inOut',
      onUpdate: () => st.scroll(proxy.v),
    });
  };

  return (
    <div className={styles.home} ref={root}>
      <section className={styles.hero}>
        <div className={styles['hero-copy']} data-hero-copy>
          <span className={styles['hero-eyebrow']}>iBILIB — K to 12 digital library</span>
          <h1>
            A quiet archive of the <em>K to 12</em> curriculum, shelved with care.
          </h1>
          <p className={styles['hero-sub']}>
            Learning materials and research projects for grades 7 through 12, shelved the way a
            library is meant to be shelved — one spine at a time.
          </p>
          <div className={styles['hero-ctas']}>
            <Link href="/library" className={styles['btn-gold']}>
              Browse the library
              <span aria-hidden="true">→</span>
            </Link>
            <Link href="/research" className={styles['btn-ghost']}>
              Research stacks
            </Link>
          </div>
        </div>
        <div className={styles['hero-covers']} aria-hidden="true">
          {[1, 2, 3].map((n) => (
            <div key={n} className={styles['cover-tilt']} data-cover-tilt>
              <img src={`https://picsum.photos/seed/ibilib-hero-${n}/900/1200`} alt="" />
              <span className={styles['cover-spine']}>iBILIB</span>
            </div>
          ))}
        </div>
        <div className={styles['progress-chrome']} aria-hidden="true">
          <strong>01</strong> / {String(tabs.length).padStart(2, '0')}
        </div>
      </section>

      <div className={styles.marquee} aria-hidden="true">
        <div className={styles['marquee-track']}>
          <div className={styles['marquee-row']}>
            {['Learning Materials', 'Research Project', 'Practical Research 1', 'Practical Research 2', 'Capstone', 'Mathematics', 'Science', 'English'].map((s) => (
              <span key={s}>
                {s} <i aria-hidden="true" />
              </span>
            ))}
          </div>
          <div className={styles['marquee-row']}>
            {['Learning Materials', 'Research Project', 'Practical Research 1', 'Practical Research 2', 'Capstone', 'Mathematics', 'Science', 'English'].map((s) => (
              <span key={`b-${s}`}>
                {s} <i aria-hidden="true" />
              </span>
            ))}
          </div>
        </div>
      </div>

      <section className={styles.stats}>
        <div className={styles.stat}>
          <b>{grades.length}</b>
          <span>Grade levels</span>
        </div>
        <div className={styles.stat}>
          <b>{totalModules.toLocaleString()}</b>
          <span>Learning modules</span>
        </div>
        <div className={styles.stat}>
          <b>{totalSubjects}</b>
          <span>Subjects shelved</span>
        </div>
        <div className={styles.stat}>
          <b>{totalResearch}</b>
          <span>Research works</span>
        </div>
      </section>

      <section className={styles['shelf-section']}>
        <div className={styles['shelf-header']}>
          <h2 className={styles['shelf-title']}>
            The <em>shelf</em>
          </h2>
          <span className={styles['shelf-count']}>
            <b>{String(active + 1).padStart(2, '0')}</b> / {String(tabs.length).padStart(2, '0')}
          </span>
        </div>
        <div className={styles['shelf-viewport']} data-shelf-viewport>
          <div className={styles['shelf-track']} ref={trackRef}>
            {tabs.map((tab) => (
              <article key={tab.id} className={styles.book} data-book>
                <div className={styles['book-cover']}>
                  <div className={styles['book-cover-frame']} data-cover>
                    <img src={coverUrl(tab.seed, true)} alt="" loading="lazy" />
                    <span className={styles['cover-spine']}>{tab.title}</span>
                  </div>
                </div>
                <div className={styles['book-body']} data-body>
                  <div className={styles['book-meta']}>{tab.chapter}</div>
                  <h3>{tab.title}</h3>
                  <p className={styles['book-tag']}>{tab.note}</p>
                  <p>
                    {tab.count.toLocaleString()} {tab.sub}, filed and ready to open.
                  </p>
                  <div className={styles['book-links']}>
                    <Link className={`${styles['book-link']} ${styles['book-link-primary']}`} href={tab.href}>
                      Open {tab.title}
                    </Link>
                    <Link className={`${styles['book-link']} ${styles['book-link-ghost']}`} href={tab.href}>
                      Browse the contents
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <div className={styles['shelf-progress']}>
            <div className={styles['shelf-progress-fill']} style={{ transform: `scaleX(${progress})` }} />
          </div>
        </div>
        <div className={styles['shelf-controls']}>
          <button
            type="button"
            className={styles['shelf-arrow']}
            aria-label="Previous collection"
            onClick={() => goTo(Math.max(0, active - 1))}
          >
            ←
          </button>
          <button
            type="button"
            className={styles['shelf-arrow']}
            aria-label="Next collection"
            onClick={() => goTo(Math.min(tabs.length - 1, active + 1))}
          >
            →
          </button>
          <div className={styles['shelf-dots']} role="tablist" aria-label="Collections">
            {tabs.map((t, i) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={i === active}
                aria-label={`Go to ${t.title}`}
                className={`${styles.dot}${i === active ? ` ${styles['is-active']}` : ''}`}
                onClick={() => goTo(i)}
              />
            ))}
          </div>
        </div>
      </section>

      <section className={styles.tagline} data-tagline>
        <p className={styles['tagline-text']}>
          {[
            'One',
            'thousand',
            'eight',
            'hundred',
            'and',
            'eleven',
            'modules,',
            'sixty-one',
            'research',
            'works,',
            'and',
            'every',
            'subject',
            'of',
            'the',
            'curriculum',
            '—',
            'filed',
            'by',
            <em key="care">care</em>,
            ',',
            'one',
            'shelf,',
            'quietly',
            'complete.',
          ].map((w, i) => (
            <span key={i} className={styles.word}>
              {w}{' '}
            </span>
          ))}
        </p>
        <p className={styles['tagline-sub']}>Field notes from the library floor</p>
      </section>

      <section className={styles.finale}>
        <h2>
          Choose a collection. Take a book
          <span
            className={styles['finale-inline-cover']}
            aria-hidden="true"
            style={{ backgroundImage: 'url(https://picsum.photos/seed/ibilib-materials/480/280)' }}
          />
          off the shelf.
        </h2>
        <p>
          Every module and paper is downloadable, searchable, and filed under its collection.
          The archive opens at the first spine.
        </p>
        <div className={styles['finale-ctas']}>
          <Link href="/library" className={styles['btn-gold']}>
            Open the library
            <span aria-hidden="true">→</span>
          </Link>
          <Link href="/search" className={styles['btn-ghost']}>
            Search the archive
          </Link>
        </div>
      </section>
    </div>
  );
}