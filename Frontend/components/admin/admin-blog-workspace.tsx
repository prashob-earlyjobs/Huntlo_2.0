"use client";

import Link from "next/link";
import { ExternalLink, Pencil, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { AdminBlogRichTextEditor } from "@/components/admin/admin-blog-rich-text-editor";
import { Field } from "@/components/outreach/builder-ui";
import { PageHeader } from "@/components/shared/page-header";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  BLOG_CATEGORIES,
  BLOG_CATEGORY_LABELS,
  type BlogCategory,
} from "@/lib/blog";
import { adminApi, type BlogArticle } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api/errors";
import { cn } from "@/lib/utils";

type BlogFormState = {
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  coverImageUrl: string;
  author: string;
  category: BlogCategory;
  tags: string;
  status: "draft" | "published" | "archived";
  seoTitle: string;
  seoDescription: string;
  ogImageUrl: string;
  featured: boolean;
};

type BlogFieldKey = keyof BlogFormState;
type BlogFieldErrors = Partial<Record<BlogFieldKey, string>>;

const BLOG_LIMITS = {
  title: 200,
  slug: 220,
  category: 80,
  author: 120,
  excerpt: 500,
  body: 100_000,
  coverImageUrl: 2000,
  tagsMax: 12,
  tagLength: 60,
  seoTitle: 200,
  seoDescription: 320,
  ogImageUrl: 2000,
} as const;

const EMPTY_FORM: BlogFormState = {
  title: "",
  slug: "",
  excerpt: "",
  body: "",
  coverImageUrl: "",
  author: "Huntlo Team",
  category: "playbooks",
  tags: "",
  status: "draft",
  seoTitle: "",
  seoDescription: "",
  ogImageUrl: "",
  featured: false,
};

const STATUS_CLASS: Record<BlogFormState["status"], string> = {
  draft: "bg-muted text-muted-foreground",
  published: "bg-success/10 text-success",
  archived: "bg-warning/10 text-warning",
};

function slugifyBlogTitle(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 200);
}

function deriveSeoStatus(seoTitle: string, seoDescription: string): string {
  const hasTitle = Boolean(seoTitle.trim());
  const hasDescription = Boolean(seoDescription.trim());
  if (hasTitle && hasDescription) return "ok";
  if (hasTitle || hasDescription) return "needs_work";
  return "missing";
}

function parseTags(raw: string): string[] {
  return raw
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function validateBlogForm(form: BlogFormState): BlogFieldErrors {
  const errors: BlogFieldErrors = {};
  const title = form.title.trim();
  const slug = form.slug.trim() || slugifyBlogTitle(form.title);
  const author = form.author.trim();
  const excerpt = form.excerpt.trim();
  const coverImageUrl = form.coverImageUrl.trim();
  const seoTitle = form.seoTitle.trim();
  const seoDescription = form.seoDescription.trim();
  const ogImageUrl = form.ogImageUrl.trim();
  const tags = parseTags(form.tags);

  if (!title) {
    errors.title = "Title is required.";
  } else if (title.length > BLOG_LIMITS.title) {
    errors.title = `Title must be at most ${BLOG_LIMITS.title} characters.`;
  }

  if (!slug) {
    errors.slug = "Slug is required (or enter a title to auto-generate).";
  } else if (slug.length > BLOG_LIMITS.slug) {
    errors.slug = `Slug must be at most ${BLOG_LIMITS.slug} characters.`;
  }

  if (form.category.length > BLOG_LIMITS.category) {
    errors.category = `Category must be at most ${BLOG_LIMITS.category} characters.`;
  }

  if (author.length > BLOG_LIMITS.author) {
    errors.author = `Author must be at most ${BLOG_LIMITS.author} characters.`;
  }

  if (excerpt.length > BLOG_LIMITS.excerpt) {
    errors.excerpt = `Excerpt must be at most ${BLOG_LIMITS.excerpt} characters.`;
  }

  if (form.body.length > BLOG_LIMITS.body) {
    errors.body = `Content must be at most ${BLOG_LIMITS.body.toLocaleString()} characters.`;
  }

  if (coverImageUrl.length > BLOG_LIMITS.coverImageUrl) {
    errors.coverImageUrl = `Cover image URL must be at most ${BLOG_LIMITS.coverImageUrl} characters.`;
  }

  if (tags.length > BLOG_LIMITS.tagsMax) {
    errors.tags = `At most ${BLOG_LIMITS.tagsMax} tags allowed.`;
  } else {
    const tooLong = tags.find((tag) => tag.length > BLOG_LIMITS.tagLength);
    if (tooLong) {
      errors.tags = `Each tag must be at most ${BLOG_LIMITS.tagLength} characters (“${tooLong.slice(0, 24)}${tooLong.length > 24 ? "…" : ""}”).`;
    }
  }

  if (seoTitle.length > BLOG_LIMITS.seoTitle) {
    errors.seoTitle = `SEO title must be at most ${BLOG_LIMITS.seoTitle} characters.`;
  }

  if (seoDescription.length > BLOG_LIMITS.seoDescription) {
    errors.seoDescription = `SEO description must be at most ${BLOG_LIMITS.seoDescription} characters.`;
  }

  if (ogImageUrl.length > BLOG_LIMITS.ogImageUrl) {
    errors.ogImageUrl = `OG image URL must be at most ${BLOG_LIMITS.ogImageUrl} characters.`;
  }

  if (
    form.status !== "draft" &&
    form.status !== "published" &&
    form.status !== "archived"
  ) {
    errors.status = "Status must be draft, published, or archived.";
  }

  return errors;
}

function articleToForm(article: BlogArticle): BlogFormState {
  const status =
    article.status === "published" || article.status === "archived"
      ? article.status
      : "draft";
  const category = BLOG_CATEGORIES.includes(article.category as BlogCategory)
    ? (article.category as BlogCategory)
    : "playbooks";
  return {
    title: article.title || "",
    slug: article.slug || "",
    excerpt: article.excerpt || "",
    body: article.body || "",
    coverImageUrl: article.coverImageUrl || "",
    author: article.author || "Huntlo Team",
    category,
    tags: Array.isArray(article.tags) ? article.tags.join(", ") : "",
    status,
    seoTitle: article.seoTitle || "",
    seoDescription: article.seoDescription || "",
    ogImageUrl: article.ogImageUrl || "",
    featured: Boolean(article.featured),
  };
}

export function AdminBlogWorkspace() {
  const [articles, setArticles] = useState<BlogArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<BlogFormState>(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState<BlogFieldErrors>({});
  const [slugTouched, setSlugTouched] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadArticles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await adminApi.listBlog({
        limit: 100,
        status: statusFilter === "all" ? undefined : statusFilter,
      });
      setArticles(result.items);
    } catch (err) {
      setArticles([]);
      setError(getApiErrorMessage(err, "Unable to load blog articles."));
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    void loadArticles();
  }, [loadArticles]);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(id);
  }, [toast]);

  function resetForm() {
    setEditingId(null);
    setFormOpen(false);
    setForm(EMPTY_FORM);
    setFieldErrors({});
    setSlugTouched(false);
  }

  function startCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFieldErrors({});
    setSlugTouched(false);
    setFormOpen(true);
    setError(null);
    setToast(null);
  }

  function startEdit(article: BlogArticle) {
    setEditingId(article.id);
    setSlugTouched(true);
    setForm(articleToForm(article));
    setFieldErrors({});
    setFormOpen(true);
    setError(null);
    setToast(null);
  }

  function patchForm(patch: Partial<BlogFormState>, clearKeys?: BlogFieldKey[]) {
    setForm((previous) => ({ ...previous, ...patch }));
    if (clearKeys?.length) {
      setFieldErrors((previous) => {
        const next = { ...previous };
        for (const key of clearKeys) delete next[key];
        return next;
      });
    }
  }

  async function handleSave() {
    const errors = validateBlogForm(form);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setError("Fix the highlighted fields before saving.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const tags = parseTags(form.tags);
      const slug = form.slug.trim() || slugifyBlogTitle(form.title);
      const payload = {
        title: form.title.trim(),
        slug,
        excerpt: form.excerpt.trim(),
        body: form.body,
        coverImageUrl: form.coverImageUrl.trim(),
        author: form.author.trim() || "Huntlo Team",
        category: form.category,
        tags,
        status: form.status,
        seoTitle: form.seoTitle.trim(),
        seoDescription: form.seoDescription.trim(),
        ogImageUrl: form.ogImageUrl.trim(),
        featured: form.featured,
        seoStatus: deriveSeoStatus(form.seoTitle, form.seoDescription),
      };

      if (editingId) {
        await adminApi.updateBlog(editingId, payload);
        setToast("Post updated.");
      } else {
        await adminApi.createBlog(payload);
        setToast("Post created.");
        resetForm();
      }
      await loadArticles();
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to save article."));
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    setError(null);
    try {
      await adminApi.deleteBlog(pendingDelete.id);
      if (editingId === pendingDelete.id) resetForm();
      setToast("Post deleted.");
      setPendingDelete(null);
      await loadArticles();
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to delete article."));
      setPendingDelete(null);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Blog management"
        description="Create and publish Huntlo articles with rich text, SEO fields, and featured placement."
        actions={
          <Button size="sm" onClick={startCreate}>
            <Plus aria-hidden />
            New post
          </Button>
        }
      />

      <p className="text-sm text-muted-foreground">
        Public index:{" "}
        <Link
          href="/blog"
          target="_blank"
          className="text-primary underline-offset-2 hover:underline"
        >
          /blog
        </Link>
      </p>
      {error ? (
        <div
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
        >
          {error}
        </div>
      ) : null}
      {toast ? (
        <div
          role="status"
          className="rounded-lg border border-border bg-card px-3 py-2 text-sm shadow-sm"
        >
          {toast}
        </div>
      ) : null}

      <div className="grid gap-6">
        {formOpen ? null : (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Filter
            </span>
            <Select
              value={statusFilter}
              onValueChange={(value) => value && setStatusFilter(value)}
            >
              <SelectTrigger className="w-42">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-lg border border-border bg-card">
            {loading ? (
              <p className="px-4 py-6 text-sm text-muted-foreground">
                Loading posts…
              </p>
            ) : articles.length === 0 ? (
              <p className="px-4 py-6 text-sm text-muted-foreground">
                No posts yet.
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {articles.map((article) => {
                  const status =
                    article.status === "published" ||
                    article.status === "archived"
                      ? article.status
                      : "draft";
                  return (
                    <li key={article.id} className="px-4 py-3">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-medium">{article.title}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            /blog/{article.slug}
                            {article.featured ? " · featured" : ""}
                          </p>
                          <span
                            className={cn(
                              "mt-2 inline-flex rounded-md px-2 py-0.5 text-xs font-medium",
                              STATUS_CLASS[status]
                            )}
                          >
                            {status}
                          </span>
                        </div>
                        <div className="flex shrink-0 flex-wrap gap-1.5">
                          {status === "published" ? (
                            <Button
                              variant="outline"
                              size="xs"
                              render={
                                <Link
                                  href={`/blog/${encodeURIComponent(article.slug)}`}
                                  target="_blank"
                                />
                              }
                            >
                              <ExternalLink aria-hidden />
                              View
                            </Button>
                          ) : null}
                          <Button
                            variant="outline"
                            size="xs"
                            onClick={() => startEdit(article)}
                          >
                            <Pencil aria-hidden />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="xs"
                            className="text-destructive hover:text-destructive"
                            onClick={() =>
                              setPendingDelete({
                                id: article.id,
                                title: article.title,
                              })
                            }
                          >
                            <Trash2 aria-hidden />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
        )}

        {formOpen ? (
        <div className="mx-auto w-full max-w-3xl rounded-lg border border-border bg-card p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {editingId ? "Edit post" : "New post"}
          </p>
          <div className="mt-3 space-y-3">
            <Field
              label="Title"
              htmlFor="blog-title"
              required
              error={fieldErrors.title}
              hint={`Max ${BLOG_LIMITS.title} characters`}
            >
              <Input
                id="blog-title"
                value={form.title}
                maxLength={BLOG_LIMITS.title}
                aria-invalid={Boolean(fieldErrors.title)}
                onChange={(event) => {
                  const title = event.target.value;
                  patchForm(
                    {
                      title,
                      ...(!slugTouched
                        ? { slug: slugifyBlogTitle(title) }
                        : {}),
                    },
                    slugTouched ? ["title"] : ["title", "slug"]
                  );
                }}
              />
            </Field>
            <Field
              label="Slug"
              htmlFor="blog-slug"
              error={fieldErrors.slug}
              hint={`Max ${BLOG_LIMITS.slug} characters · leave blank to auto-generate`}
            >
              <Input
                id="blog-slug"
                value={form.slug}
                maxLength={BLOG_LIMITS.slug}
                aria-invalid={Boolean(fieldErrors.slug)}
                onChange={(event) => {
                  setSlugTouched(true);
                  patchForm({ slug: event.target.value }, ["slug"]);
                }}
                placeholder="auto-from-title"
              />
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field
                label="Category"
                htmlFor="blog-category"
                error={fieldErrors.category}
              >
                <Select
                  value={form.category}
                  onValueChange={(value) =>
                    value &&
                    patchForm({ category: value as BlogCategory }, ["category"])
                  }
                >
                  <SelectTrigger
                    id="blog-category"
                    className="w-full"
                    aria-invalid={Boolean(fieldErrors.category)}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BLOG_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {BLOG_CATEGORY_LABELS[category]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field
                label="Status"
                htmlFor="blog-status"
                error={fieldErrors.status}
              >
                <Select
                  value={form.status}
                  onValueChange={(value) =>
                    value &&
                    patchForm(
                      { status: value as BlogFormState["status"] },
                      ["status"]
                    )
                  }
                >
                  <SelectTrigger
                    id="blog-status"
                    className="w-full"
                    aria-invalid={Boolean(fieldErrors.status)}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <Field
              label="Excerpt"
              htmlFor="blog-excerpt"
              error={fieldErrors.excerpt}
              hint={`${form.excerpt.trim().length}/${BLOG_LIMITS.excerpt}`}
            >
              <Textarea
                id="blog-excerpt"
                rows={2}
                value={form.excerpt}
                maxLength={BLOG_LIMITS.excerpt}
                aria-invalid={Boolean(fieldErrors.excerpt)}
                onChange={(event) =>
                  patchForm({ excerpt: event.target.value }, ["excerpt"])
                }
              />
            </Field>
            <Field
              label="Content"
              htmlFor="blog-content"
              error={fieldErrors.body}
              hint={`Max ${BLOG_LIMITS.body.toLocaleString()} characters`}
            >
              <AdminBlogRichTextEditor
                key={editingId || "new-post"}
                editorKey={editingId || "new-post"}
                value={form.body}
                onChange={(html) => patchForm({ body: html }, ["body"])}
                placeholder="Write your article…"
              />
            </Field>
            <Field
              label="Tags (comma-separated)"
              htmlFor="blog-tags"
              error={fieldErrors.tags}
              hint={`Up to ${BLOG_LIMITS.tagsMax} tags · ${BLOG_LIMITS.tagLength} chars each · ${parseTags(form.tags).length}/${BLOG_LIMITS.tagsMax}`}
            >
              <Input
                id="blog-tags"
                value={form.tags}
                aria-invalid={Boolean(fieldErrors.tags)}
                onChange={(event) =>
                  patchForm({ tags: event.target.value }, ["tags"])
                }
              />
            </Field>
            <Field
              label="Cover image URL"
              htmlFor="blog-cover"
              error={fieldErrors.coverImageUrl}
              hint={`Max ${BLOG_LIMITS.coverImageUrl} characters`}
            >
              <Input
                id="blog-cover"
                type="text"
                inputMode="url"
                value={form.coverImageUrl}
                maxLength={BLOG_LIMITS.coverImageUrl}
                aria-invalid={Boolean(fieldErrors.coverImageUrl)}
                onChange={(event) =>
                  patchForm({ coverImageUrl: event.target.value }, [
                    "coverImageUrl",
                  ])
                }
              />
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field
                label="SEO title"
                htmlFor="blog-seo-title"
                error={fieldErrors.seoTitle}
                hint={`${form.seoTitle.trim().length}/${BLOG_LIMITS.seoTitle}`}
              >
                <Input
                  id="blog-seo-title"
                  value={form.seoTitle}
                  maxLength={BLOG_LIMITS.seoTitle}
                  aria-invalid={Boolean(fieldErrors.seoTitle)}
                  onChange={(event) =>
                    patchForm({ seoTitle: event.target.value }, ["seoTitle"])
                  }
                />
              </Field>
              <Field
                label="Author"
                htmlFor="blog-author"
                error={fieldErrors.author}
                hint={`Max ${BLOG_LIMITS.author} characters`}
              >
                <Input
                  id="blog-author"
                  value={form.author}
                  maxLength={BLOG_LIMITS.author}
                  aria-invalid={Boolean(fieldErrors.author)}
                  onChange={(event) =>
                    patchForm({ author: event.target.value }, ["author"])
                  }
                />
              </Field>
            </div>
            <Field
              label="SEO description"
              htmlFor="blog-seo-description"
              error={fieldErrors.seoDescription}
              hint={`${form.seoDescription.trim().length}/${BLOG_LIMITS.seoDescription}`}
            >
              <Textarea
                id="blog-seo-description"
                rows={2}
                value={form.seoDescription}
                maxLength={BLOG_LIMITS.seoDescription}
                aria-invalid={Boolean(fieldErrors.seoDescription)}
                onChange={(event) =>
                  patchForm({ seoDescription: event.target.value }, [
                    "seoDescription",
                  ])
                }
              />
            </Field>
            <Field
              label="OG image URL"
              htmlFor="blog-og"
              error={fieldErrors.ogImageUrl}
              hint={`Max ${BLOG_LIMITS.ogImageUrl} characters`}
            >
              <Input
                id="blog-og"
                type="text"
                inputMode="url"
                value={form.ogImageUrl}
                maxLength={BLOG_LIMITS.ogImageUrl}
                aria-invalid={Boolean(fieldErrors.ogImageUrl)}
                onChange={(event) =>
                  patchForm({ ogImageUrl: event.target.value }, ["ogImageUrl"])
                }
              />
            </Field>
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                className="size-4 rounded border-border"
                checked={form.featured}
                onChange={(event) =>
                  patchForm({ featured: event.target.checked })
                }
              />
              Featured on blog index
            </label>
            <div className="flex flex-wrap gap-2 pt-1">
              <Button onClick={() => void handleSave()} disabled={saving}>
                {saving
                  ? "Saving…"
                  : editingId
                    ? "Update post"
                    : "Create post"}
              </Button>
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
        ) : null}
      </div>

      <AlertDialog
        open={!!pendingDelete}
        onOpenChange={(open) => {
          if (!open && !deleting) setPendingDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete post?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete
                ? `“${pendingDelete.title}” will be permanently deleted. This cannot be undone.`
                : "This post will be permanently deleted."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deleting}
              onClick={() => void confirmDelete()}
            >
              {deleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
