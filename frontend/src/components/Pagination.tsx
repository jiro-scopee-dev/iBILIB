'use client';

export default function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;
  const pages: number[] = [];
  const start = Math.max(1, Math.min(page - 2, totalPages - 4));
  for (let i = start; i <= Math.min(totalPages, start + 4); i++) pages.push(i);

  return (
    <nav className="pagination" aria-label="Pagination">
      <button
        className="btn btn-secondary"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        aria-label="Previous page"
      >
        Prev
      </button>
      {pages.map((p) => (
        <button
          key={p}
          className={`btn ${p === page ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => onChange(p)}
          aria-current={p === page ? 'page' : undefined}
          aria-label={`Page ${p}`}
        >
          {p}
        </button>
      ))}
      <button
        className="btn btn-secondary"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
        aria-label="Next page"
      >
        Next
      </button>
    </nav>
  );
}
