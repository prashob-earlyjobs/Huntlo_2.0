import { z } from 'zod';

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.string().optional(),
});

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;

export type PaginatedResult<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export function parsePaginationQuery(query: unknown): PaginationQuery {
  return paginationQuerySchema.parse(query);
}

export function buildPaginationMeta(result: PaginatedResult<unknown>) {
  return {
    page: result.page,
    limit: result.limit,
    total: result.total,
    totalPages: result.totalPages,
  };
}

export function paginateArray<T>(
  items: T[],
  page: number,
  limit: number
): PaginatedResult<T> {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * limit;
  const pagedItems = items.slice(start, start + limit);

  return {
    items: pagedItems,
    total,
    page: safePage,
    limit,
    totalPages,
  };
}

export function getSkip(page: number, limit: number): number {
  return (page - 1) * limit;
}

export function parseSortParam(
  sort: string | undefined,
  allowedFields: readonly string[],
  defaultSort = '-createdAt'
): Record<string, 1 | -1> {
  const raw = sort ?? defaultSort;
  const descending = raw.startsWith('-');
  const field = descending ? raw.slice(1) : raw;

  if (!allowedFields.includes(field)) {
    throw new Error(`Invalid sort field: ${field}`);
  }

  return { [field]: descending ? -1 : 1 };
}
