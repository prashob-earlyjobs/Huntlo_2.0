import {
  BLOG_CATEGORIES,
  BlogArticleModel,
  toMarketingBlogPost,
  type BlogArticleDocument,
} from '../admin/blog.model.js';
import { AppError } from '../../shared/errors/app-error.js';

function buildListFilter(input: {
  category?: string;
  tag?: string;
  q?: string;
}) {
  const filter: Record<string, unknown> = {
    status: 'published',
    deletedAt: null,
  };
  if (input.category?.trim()) {
    filter.category = input.category.trim();
  }
  if (input.tag?.trim()) {
    filter.tags = input.tag.trim().toLowerCase();
  }
  const query = input.q?.trim();
  if (query) {
    filter.$or = [
      { title: { $regex: query, $options: 'i' } },
      { excerpt: { $regex: query, $options: 'i' } },
      { tags: { $regex: query, $options: 'i' } },
    ];
  }
  return filter;
}

export const publicBlogService = {
  categories: BLOG_CATEGORIES,

  async listPosts(options: {
    page?: number | string;
    limit?: number | string;
    category?: string;
    tag?: string;
    q?: string;
    includeFeatured?: boolean;
  }) {
    const pageRaw = Number(options.page);
    const limitRaw = Number(options.limit);
    const page = Number.isFinite(pageRaw) && pageRaw > 0 ? Math.floor(pageRaw) : 1;
    const limit = Math.min(
      24,
      Math.max(1, Number.isFinite(limitRaw) ? Math.floor(limitRaw) : 12)
    );
    const skip = (page - 1) * limit;

    const filter = buildListFilter({
      category: options.category,
      tag: options.tag,
      q: options.q,
    });

    const includeFeatured =
      options.includeFeatured !== false &&
      page === 1 &&
      !options.category &&
      !options.tag &&
      !options.q;

    const [docs, total, featuredDoc] = await Promise.all([
      BlogArticleModel.find(filter)
        .sort({ publishedAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      BlogArticleModel.countDocuments(filter),
      includeFeatured
        ? BlogArticleModel.findOne({
            status: 'published',
            deletedAt: null,
            featured: true,
          })
            .sort({ publishedAt: -1 })
            .lean()
        : null,
    ]);

    const totalPages = Math.max(1, Math.ceil(total / limit) || 1);
    return {
      categories: [...BLOG_CATEGORIES],
      posts: docs.map((d) => toMarketingBlogPost(d as BlogArticleDocument)),
      featured: featuredDoc
        ? toMarketingBlogPost(featuredDoc as BlogArticleDocument)
        : null,
      pagination: {
        page: Math.min(page, totalPages),
        limit,
        total,
        totalPages,
        hasMore: page < totalPages,
      },
    };
  },

  async getPostBySlug(slug: string) {
    const key = String(slug || '').trim().toLowerCase();
    if (!key) throw AppError.validation('slug is required');

    const doc = await BlogArticleModel.findOneAndUpdate(
      { slug: key, status: 'published', deletedAt: null },
      { $inc: { viewCount: 1 } },
      { returnDocument: 'after' }
    ).lean();

    if (!doc) throw AppError.notFound('Blog post not found');

    const related = await BlogArticleModel.find({
      status: 'published',
      deletedAt: null,
      category: doc.category,
      _id: { $ne: doc._id },
    })
      .sort({ publishedAt: -1 })
      .limit(3)
      .lean();

    return {
      post: toMarketingBlogPost(doc as BlogArticleDocument, { includeContent: true }),
      relatedPosts: related.map((d) =>
        toMarketingBlogPost(d as BlogArticleDocument)
      ),
    };
  },

  async listSitemapEntries() {
    const docs = await BlogArticleModel.find({
      status: 'published',
      deletedAt: null,
    })
      .select('slug updatedAt publishedAt')
      .sort({ publishedAt: -1 })
      .lean();

    return docs.map((d) => ({
      slug: d.slug,
      updatedAt: (d.updatedAt || d.publishedAt || new Date()).toISOString(),
    }));
  },
};
