'use client';

export function Loading({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="grid" aria-busy="true" aria-label={label}>
      {[0, 1, 2].map((i) => (
        <div key={i} className="card is-skeleton">
          <div className="skeleton skeleton-sm" style={{ width: '34%' }} />
          <div className="skeleton skeleton-md" style={{ width: '88%' }} />
          <div className="skeleton skeleton-sm" style={{ width: '100%' }} />
          <div className="skeleton skeleton-sm" style={{ width: '72%' }} />
          <div className="skeleton skeleton-sm" style={{ width: '46%' }} />
        </div>
      ))}
    </div>
  );
}

export function ErrorBox({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="error-box" role="alert">
      <p>{message}</p>
      {onRetry && (
        <button className="btn btn-secondary" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}

export function EmptyState({
  message,
  title = 'Nothing here yet',
}: {
  message: string;
  title?: string;
}) {
  return (
    <div className="empty-state">
      <div className="empty-icon" aria-hidden="true">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      </div>
      <h2>{title}</h2>
      <p>{message}</p>
    </div>
  );
}
