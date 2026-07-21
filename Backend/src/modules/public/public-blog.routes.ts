import { Router } from 'express';

import { asyncHandler } from '../../shared/http/async-handler.js';
import { publicBlogService } from './public-blog.service.js';

/**
 * Public marketing blog API — matches old EJHunterLanding `/api/blog` shape
 * expected by Frontend/lib/blog.ts (flat `{ success, posts, ... }`, not `/api/v1` envelope).
 */
export const publicBlogRouter = Router();

publicBlogRouter.get(
  '/posts',
  asyncHandler(async (req, res) => {
    const data = await publicBlogService.listPosts({
      page: req.query.page as string | undefined,
      limit: req.query.limit as string | undefined,
      category: req.query.category as string | undefined,
      tag: req.query.tag as string | undefined,
      q: req.query.q as string | undefined,
      includeFeatured: req.query.featured !== '0',
    });
    res.status(200).json({ success: true, ...data });
  })
);

publicBlogRouter.get(
  '/posts/:slug',
  asyncHandler(async (req, res) => {
    const data = await publicBlogService.getPostBySlug(String(req.params.slug || ''));
    res.status(200).json({ success: true, ...data });
  })
);

publicBlogRouter.get(
  '/sitemap',
  asyncHandler(async (_req, res) => {
    const posts = await publicBlogService.listSitemapEntries();
    res.status(200).json({ success: true, posts });
  })
);
