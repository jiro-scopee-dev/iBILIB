'use client';

import { useEffect, useState } from 'react';

export type ViewMode = 'grid' | 'list';

const STORAGE_KEY = 'ibilib-view';

export function useViewMode(): [ViewMode, (mode: ViewMode) => void] {
  const [mode, setMode] = useState<ViewMode>('grid');

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'grid' || saved === 'list') setMode(saved);
  }, []);

  const change = (next: ViewMode) => {
    setMode(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* storage unavailable */
    }
  };

  return [mode, change];
}

export default function ViewToggle({
  mode,
  onChange,
}: {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
}) {
  return (
    <div className="view-toggle" role="group" aria-label="View layout">
      <button
        type="button"
        className={mode === 'grid' ? 'is-active' : ''}
        onClick={() => onChange('grid')}
        aria-pressed={mode === 'grid'}
        aria-label="Grid view"
        title="Grid view"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
          <rect x="1" y="1" width="6" height="6" rx="1.5" />
          <rect x="9" y="1" width="6" height="6" rx="1.5" />
          <rect x="1" y="9" width="6" height="6" rx="1.5" />
          <rect x="9" y="9" width="6" height="6" rx="1.5" />
        </svg>
      </button>
      <button
        type="button"
        className={mode === 'list' ? 'is-active' : ''}
        onClick={() => onChange('list')}
        aria-pressed={mode === 'list'}
        aria-label="List view"
        title="List view"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
          <rect x="1" y="1.5" width="4" height="2.5" rx="1" />
          <rect x="7" y="1.7" width="8" height="1.6" rx="0.8" />
          <rect x="1" y="6.75" width="4" height="2.5" rx="1" />
          <rect x="7" y="6.95" width="8" height="1.6" rx="0.8" />
          <rect x="1" y="12" width="4" height="2.5" rx="1" />
          <rect x="7" y="12.2" width="8" height="1.6" rx="0.8" />
        </svg>
      </button>
    </div>
  );
}