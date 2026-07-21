import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { createApp } from '../src/app.js';
import { connectDatabase, disconnectDatabase } from '../src/config/database.js';
import { resetEnvCache } from '../src/config/env.js';
import { clearRateLimits } from '../src/middleware/rate-limit.js';
import { BlogArticleModel } from '../src/modules/admin/blog.model.js';
import { startMemoryMongo, stopMemoryMongo } from './helpers/memory-mongo.js';

describe('Public blog API', () => {
  const app = createApp();
  let agent: ReturnType<typeof request.agent>;

  beforeAll(async () => {
    await startMemoryMongo();
    resetEnvCache();
    await connectDatabase();
    agent = request.agent(app);
  }, 60_000);

  afterAll(async () => {
    await disconnectDatabase();
    await stopMemoryMongo();
  });

  beforeEach(async () => {
    clearRateLimits();
    await BlogArticleModel.deleteMany({});
  });

  it('lists published posts, featured, and sitemap; hides drafts', async () => {
    await BlogArticleModel.create([
      {
        title: 'Published AI sourcing guide',
        slug: 'ai-sourcing-guide',
        category: 'ai-sourcing',
        author: 'Huntlo Team',
        excerpt: 'How to source with AI',
        body: '<p>Full content about sourcing candidates with AI agents.</p>',
        status: 'published',
        featured: true,
        tags: ['ai', 'sourcing'],
        publishedAt: new Date('2026-01-10T00:00:00.000Z'),
        readTimeMinutes: 2,
      },
      {
        title: 'Draft only',
        slug: 'draft-only',
        category: 'playbooks',
        body: 'Secret draft',
        status: 'draft',
      },
      {
        title: 'Soft-deleted published',
        slug: 'deleted-post',
        category: 'playbooks',
        body: 'Gone',
        status: 'published',
        publishedAt: new Date(),
        deletedAt: new Date(),
      },
    ]);

    const list = await agent.get('/api/blog/posts');
    expect(list.status).toBe(200);
    expect(list.body.success).toBe(true);
    expect(list.body.posts).toHaveLength(1);
    expect(list.body.posts[0].slug).toBe('ai-sourcing-guide');
    expect(list.body.posts[0].authorName).toBe('Huntlo Team');
    expect(list.body.posts[0].content).toBeUndefined();
    expect(list.body.featured?.slug).toBe('ai-sourcing-guide');
    expect(list.body.pagination.total).toBe(1);
    expect(Array.isArray(list.body.categories)).toBe(true);

    const detail = await agent.get('/api/blog/posts/ai-sourcing-guide');
    expect(detail.status).toBe(200);
    expect(detail.body.success).toBe(true);
    expect(detail.body.post.content).toContain('sourcing candidates');
    expect(detail.body.post.viewCount).toBe(1);
    expect(detail.body.relatedPosts).toEqual([]);

    const missing = await agent.get('/api/blog/posts/draft-only');
    expect(missing.status).toBe(404);

    const sitemap = await agent.get('/api/blog/sitemap');
    expect(sitemap.status).toBe(200);
    expect(sitemap.body.success).toBe(true);
    expect(sitemap.body.posts).toEqual([
      expect.objectContaining({ slug: 'ai-sourcing-guide' }),
    ]);
  });

  it('filters by category and search query', async () => {
    await BlogArticleModel.create([
      {
        title: 'WhatsApp outreach tips',
        slug: 'whatsapp-tips',
        category: 'outbound-recruiting',
        excerpt: 'Reply rates',
        body: 'Content',
        status: 'published',
        publishedAt: new Date(),
        tags: ['whatsapp'],
      },
      {
        title: 'People Scout walkthrough',
        slug: 'people-scout-walkthrough',
        category: 'people-scout',
        excerpt: 'Lookup profiles',
        body: 'Content',
        status: 'published',
        publishedAt: new Date(),
      },
    ]);

    const byCategory = await agent.get('/api/blog/posts?category=people-scout');
    expect(byCategory.status).toBe(200);
    expect(byCategory.body.posts).toHaveLength(1);
    expect(byCategory.body.posts[0].slug).toBe('people-scout-walkthrough');
    expect(byCategory.body.featured).toBeNull();

    const byQ = await agent.get('/api/blog/posts?q=whatsapp');
    expect(byQ.status).toBe(200);
    expect(byQ.body.posts).toHaveLength(1);
    expect(byQ.body.posts[0].slug).toBe('whatsapp-tips');
  });
});
