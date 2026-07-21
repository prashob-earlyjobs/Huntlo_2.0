import mongoose from 'mongoose';

export const BLOG_STATUSES = ['draft', 'published', 'archived'] as const;
export type BlogStatus = (typeof BLOG_STATUSES)[number];

/** Marketing blog categories (aligned with Frontend/lib/blog.ts). */
export const BLOG_CATEGORIES = [
  'ai-sourcing',
  'outbound-recruiting',
  'people-scout',
  'hiring-os',
  'integrations',
  'product-updates',
  'playbooks',
] as const;
export type BlogCategory = (typeof BLOG_CATEGORIES)[number];

const blogArticleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    slug: { type: String, required: true, trim: true, lowercase: true, unique: true, maxlength: 220 },
    category: { type: String, default: 'playbooks', trim: true, maxlength: 80 },
    author: { type: String, default: 'Huntlo Team', trim: true, maxlength: 120 },
    excerpt: { type: String, default: '', trim: true, maxlength: 500 },
    body: { type: String, default: '', maxlength: 100_000 },
    coverImageUrl: { type: String, default: '', trim: true, maxlength: 2000 },
    authorAvatarUrl: { type: String, default: '', trim: true, maxlength: 2000 },
    tags: { type: [String], default: [] },
    seoTitle: { type: String, default: '', trim: true, maxlength: 200 },
    seoDescription: { type: String, default: '', trim: true, maxlength: 320 },
    ogImageUrl: { type: String, default: '', trim: true, maxlength: 2000 },
    readTimeMinutes: { type: Number, default: 1, min: 1 },
    featured: { type: Boolean, default: false },
    viewCount: { type: Number, default: 0, min: 0 },
    status: { type: String, enum: BLOG_STATUSES, default: 'draft', index: true },
    seoStatus: { type: String, default: 'ok', trim: true, maxlength: 40 },
    publishedAt: { type: Date, default: null },
    createdByUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    updatedByUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    deletedAt: { type: Date, default: null, index: true },
  },
  { timestamps: true }
);

blogArticleSchema.index({ status: 1, publishedAt: -1 });
blogArticleSchema.index({ status: 1, featured: 1, publishedAt: -1 });

export type BlogArticleDocument = mongoose.InferSchemaType<typeof blogArticleSchema> & {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export const BlogArticleModel = (mongoose.models.BlogArticle ??
  mongoose.model('BlogArticle', blogArticleSchema)) as mongoose.Model<BlogArticleDocument>;

export function computeReadTimeMinutes(content: string): number {
  const text = String(content || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const words = text ? text.split(' ').length : 0;
  return Math.max(1, Math.ceil(words / 200));
}

/** Admin console shape (keeps existing field names). */
export function toPublicBlog(doc: BlogArticleDocument) {
  return {
    id: doc._id.toHexString(),
    title: doc.title,
    slug: doc.slug,
    category: doc.category,
    author: doc.author,
    excerpt: doc.excerpt,
    body: doc.body,
    coverImageUrl: doc.coverImageUrl || '',
    authorAvatarUrl: doc.authorAvatarUrl || '',
    tags: Array.isArray(doc.tags) ? doc.tags : [],
    seoTitle: doc.seoTitle || '',
    seoDescription: doc.seoDescription || '',
    ogImageUrl: doc.ogImageUrl || '',
    readTimeMinutes: Math.max(1, Number(doc.readTimeMinutes) || 1),
    featured: Boolean(doc.featured),
    viewCount: Math.max(0, Number(doc.viewCount) || 0),
    status: doc.status,
    seoStatus: doc.seoStatus,
    publishedAt: doc.publishedAt?.toISOString() ?? null,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

/** Marketing site shape expected by Frontend/lib/blog.ts. */
export function toMarketingBlogPost(
  doc: BlogArticleDocument | Record<string, unknown>,
  options: { includeContent?: boolean } = {}
) {
  const o = doc as BlogArticleDocument & { _id: mongoose.Types.ObjectId };
  const publishedAt = o.publishedAt ? new Date(o.publishedAt).toISOString() : null;
  return {
    id: String(o._id),
    title: o.title || '',
    slug: o.slug || '',
    excerpt: o.excerpt || '',
    ...(options.includeContent ? { content: o.body || '' } : {}),
    coverImageUrl: o.coverImageUrl || '',
    authorName: o.author || 'Huntlo Team',
    authorAvatarUrl: o.authorAvatarUrl || '',
    category: o.category || 'playbooks',
    tags: Array.isArray(o.tags) ? o.tags : [],
    status: (o.status || 'draft') as BlogStatus,
    publishedAt,
    seoTitle: o.seoTitle || '',
    seoDescription: o.seoDescription || '',
    ogImageUrl: o.ogImageUrl || '',
    readTimeMinutes: Math.max(1, Number(o.readTimeMinutes) || 1),
    featured: Boolean(o.featured),
    viewCount: Math.max(0, Number(o.viewCount) || 0),
    createdAt: o.createdAt ? new Date(o.createdAt).toISOString() : null,
    updatedAt: o.updatedAt ? new Date(o.updatedAt).toISOString() : null,
  };
}
