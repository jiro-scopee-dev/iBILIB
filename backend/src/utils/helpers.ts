import { ApiError } from '../middleware/errorHandler';

/** Wraps an async route handler so rejections reach the error middleware. */
export const asyncHandler =
  (fn: (req: any, res: any, next: any) => Promise<any>) =>
  (req: any, res: any, next: any) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

/** Pagination helpers. */
export interface PageResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function paginate<T>(items: T[], total: number, page: number, limit: number): PageResult<T> {
  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}

/** Parses a field that may be a JSON array string, a plain comma string, or an array. */
export function parseListField(value: unknown): string[] {
  if (value == null || value === '') return [];
  if (Array.isArray(value)) {
    return value.map((v) => String(v)).filter(Boolean);
  }
  const s = String(value).trim();
  if (s.startsWith('[')) {
    try {
      const parsed = JSON.parse(s);
      if (Array.isArray(parsed)) return parsed.map((v) => String(v)).filter(Boolean);
    } catch {
      /* fall through to comma split */
    }
  }
  return s
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
}

export function assertExists<T>(value: T | null | undefined, message = 'Record not found'): T {
  if (value == null) throw new ApiError(404, message);
  return value;
}
