import mongoose from 'mongoose';

export const BLOG_STATUSES = ['draft', 'published', 'archived'] as const;
export type BlogStatus = (typeof BLOG_STATUSES)[number];

const blogArticleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    slug: { type: String, required: true, trim: true, lowercase: true, unique: true, maxlength: 220 },
    category: { type: String, default: 'Product', trim: true, maxlength: 80 },
    author: { type: String, default: 'Huntlo', trim: true, maxlength: 120 },
    excerpt: { type: String, default: '', trim: true, maxlength: 500 },
    body: { type: String, default: '', maxlength: 100_000 },
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

export type BlogArticleDocument = mongoose.InferSchemaType<typeof blogArticleSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const BlogArticleModel = (mongoose.models.BlogArticle ??
  mongoose.model('BlogArticle', blogArticleSchema)) as mongoose.Model<BlogArticleDocument>;

export function toPublicBlog(doc: BlogArticleDocument) {
  return {
    id: doc._id.toHexString(),
    title: doc.title,
    slug: doc.slug,
    category: doc.category,
    author: doc.author,
    excerpt: doc.excerpt,
    body: doc.body,
    status: doc.status,
    seoStatus: doc.seoStatus,
    publishedAt: doc.publishedAt?.toISOString() ?? null,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}
