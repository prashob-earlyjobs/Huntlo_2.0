/** Must stay in step with audienceBodySchema candidateIds.max(5000). */
export const AUDIENCE_ID_LIMIT = 5000;

export const POOL_PAGE_SIZE = 200;
export const MAX_POOL_PAGES = 50;

export type PoolPageResult<T extends { id: string }> = {
  items: T[];
  pagination: {
    page: number;
    totalPages: number;
  };
};

/**
 * Stop when the page is short, when the server repeats an earlier page,
 * or when this page added nobody new. A full page is not proof that
 * another page exists: the pool API echoes the last page past the end.
 */
export function shouldStopPoolPaging(input: {
  requestedPage: number;
  pageSize: number;
  itemsReturned: number;
  newIds: number;
  reportedPage: number | null;
  totalPages: number | null;
}): boolean {
  if (input.itemsReturned < input.pageSize) return true;
  if (input.newIds === 0) return true;
  if (
    input.reportedPage != null &&
    input.reportedPage < input.requestedPage
  ) {
    return true;
  }
  if (
    input.totalPages != null &&
    Number.isFinite(input.totalPages) &&
    input.totalPages >= 1 &&
    input.requestedPage >= input.totalPages
  ) {
    return true;
  }
  return false;
}

export async function collectPoolPages<T extends { id: string }>(
  fetchPage: (page: number, pageSize: number) => Promise<PoolPageResult<T>>,
  pageSize = POOL_PAGE_SIZE
): Promise<T[]> {
  const all: T[] = [];
  const seen = new Set<string>();

  for (let page = 1; page <= MAX_POOL_PAGES; page += 1) {
    const { items, pagination } = await fetchPage(page, pageSize);
    let newIds = 0;
    for (const row of items) {
      if (!row.id || seen.has(row.id)) continue;
      seen.add(row.id);
      all.push(row);
      newIds += 1;
    }

    const totalPages = Number.isFinite(pagination?.totalPages)
      ? pagination.totalPages
      : null;
    const stop = shouldStopPoolPaging({
      requestedPage: page,
      pageSize,
      itemsReturned: items.length,
      newIds,
      reportedPage: Number.isFinite(pagination?.page) ? pagination.page : null,
      totalPages,
    });
    if (stop) break;
    if (page >= MAX_POOL_PAGES) {
      throw new Error(
        "This audience is larger than 10,000 people. Split the list before launching."
      );
    }
  }

  return all;
}

export function chunkAudienceIds(
  ids: string[],
  limit = AUDIENCE_ID_LIMIT
): string[][] {
  const unique = [...new Set(ids.filter(Boolean))];
  if (limit < 1) throw new Error("Audience batch size must be at least 1.");
  const chunks: string[][] = [];
  for (let index = 0; index < unique.length; index += limit) {
    chunks.push(unique.slice(index, index + limit));
  }
  return chunks;
}
