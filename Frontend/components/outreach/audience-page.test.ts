import { describe, expect, it, vi } from "vitest";

import {
  AUDIENCE_ID_LIMIT,
  chunkAudienceIds,
  collectPoolPages,
  POOL_PAGE_SIZE,
} from "./audience-page";

function person(id: string) {
  return { id };
}

/** Same clamp the pool API uses: a page past the end repeats the last page. */
function clampedList(ids: string[], page: number, pageSize: number) {
  const total = ids.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;
  return {
    items: ids.slice(start, start + pageSize).map(person),
    pagination: { page: safePage, totalPages },
  };
}

describe("collectPoolPages", () => {
  it("loads a 200-person list once and does not repeat the last page", async () => {
    const ids = Array.from({ length: 200 }, (_, index) => `c${index}`);
    const fetchPage = vi.fn(async (page: number, pageSize: number) =>
      clampedList(ids, page, pageSize)
    );

    const rows = await collectPoolPages(fetchPage, POOL_PAGE_SIZE);

    expect(fetchPage).toHaveBeenCalledTimes(1);
    expect(rows).toHaveLength(200);
    expect(new Set(rows.map((row) => row.id)).size).toBe(200);
  });

  it("still stops if a later page repeats ids and claims more pages exist", async () => {
    const ids = Array.from({ length: 200 }, (_, index) => `c${index}`);
    const fetchPage = vi.fn(async (page: number) => ({
      items: ids.map(person),
      pagination: { page, totalPages: 50 },
    }));

    const rows = await collectPoolPages(fetchPage, POOL_PAGE_SIZE);

    expect(fetchPage).toHaveBeenCalledTimes(2);
    expect(rows).toHaveLength(200);
  });

  it("keeps a short last page", async () => {
    const ids = Array.from({ length: 250 }, (_, index) => `c${index}`);
    const rows = await collectPoolPages(
      async (page, pageSize) => clampedList(ids, page, pageSize),
      POOL_PAGE_SIZE
    );

    expect(rows).toHaveLength(250);
  });

  it("keeps two full pages when the list is exactly 400", async () => {
    const ids = Array.from({ length: 400 }, (_, index) => `c${index}`);
    const fetchPage = vi.fn(async (page: number, pageSize: number) =>
      clampedList(ids, page, pageSize)
    );

    const rows = await collectPoolPages(fetchPage, POOL_PAGE_SIZE);

    expect(fetchPage).toHaveBeenCalledTimes(2);
    expect(rows).toHaveLength(400);
  });
});

describe("chunkAudienceIds", () => {
  it("sends one batch when the list is under the API limit", () => {
    const chunks = chunkAudienceIds(["a", "b", "a"]);
    expect(chunks).toEqual([["a", "b"]]);
  });

  it("splits a list that would be rejected as more than 5000 ids", () => {
    const ids = Array.from({ length: AUDIENCE_ID_LIMIT + 1 }, (_, index) =>
      String(index)
    );
    const chunks = chunkAudienceIds(ids);
    expect(chunks).toHaveLength(2);
    expect(chunks[0]).toHaveLength(AUDIENCE_ID_LIMIT);
    expect(chunks[1]).toHaveLength(1);
    expect(chunks.every((chunk) => chunk.length <= AUDIENCE_ID_LIMIT)).toBe(
      true
    );
  });
});
