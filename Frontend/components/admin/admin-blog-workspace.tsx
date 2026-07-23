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
    setSlugTouched(false);
  }

  function startCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setSlugTouched(false);
    setFormOpen(true);
    setError(null);
    setToast(null);
  }

  function startEdit(article: BlogArticle) {
    setEditingId(article.id);
    setSlugTouched(true);
    setForm(articleToForm(article));
    setFormOpen(true);
    setError(null);
    setToast(null);
  }

  async function handleSave() {
    if (!form.title.trim()) {
      setError("Title is required.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const tags = form.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);
      const slug = form.slug.trim() || slugifyBlogTitle(form.title);
      const payload = {
        title: form.title.trim(),
        slug,
        excerpt: form.excerpt,
        body: form.body,
        coverImageUrl: form.coverImageUrl,
        author: form.author || "Huntlo Team",
        category: form.category,
        tags,
        status: form.status,
        seoTitle: form.seoTitle,
        seoDescription: form.seoDescription,
        ogImageUrl: form.ogImageUrl,
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
            <Field label="Title" htmlFor="blog-title" required>
              <Input
                id="blog-title"
                value={form.title}
                onChange={(event) => {
                  const title = event.target.value;
                  setForm((previous) => ({
                    ...previous,
                    title,
                    ...(!slugTouched
                      ? { slug: slugifyBlogTitle(title) }
                      : {}),
                  }));
                }}
              />
            </Field>
            <Field label="Slug" htmlFor="blog-slug">
              <Input
                id="blog-slug"
                value={form.slug}
                onChange={(event) => {
                  setSlugTouched(true);
                  setForm((previous) => ({
                    ...previous,
                    slug: event.target.value,
                  }));
                }}
                placeholder="auto-from-title"
              />
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Category" htmlFor="blog-category">
                <Select
                  value={form.category}
                  onValueChange={(value) =>
                    value &&
                    setForm((previous) => ({
                      ...previous,
                      category: value as BlogCategory,
                    }))
                  }
                >
                  <SelectTrigger id="blog-category" className="w-full">
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
              <Field label="Status" htmlFor="blog-status">
                <Select
                  value={form.status}
                  onValueChange={(value) =>
                    value &&
                    setForm((previous) => ({
                      ...previous,
                      status: value as BlogFormState["status"],
                    }))
                  }
                >
                  <SelectTrigger id="blog-status" className="w-full">
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
            <Field label="Excerpt" htmlFor="blog-excerpt">
              <Textarea
                id="blog-excerpt"
                rows={2}
                value={form.excerpt}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    excerpt: event.target.value,
                  }))
                }
              />
            </Field>
            <Field label="Content" htmlFor="blog-content">
              <AdminBlogRichTextEditor
                key={editingId || "new-post"}
                editorKey={editingId || "new-post"}
                value={form.body}
                onChange={(html) =>
                  setForm((previous) => ({ ...previous, body: html }))
                }
                placeholder="Write your article…"
              />
            </Field>
            <Field label="Tags (comma-separated)" htmlFor="blog-tags">
              <Input
                id="blog-tags"
                value={form.tags}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    tags: event.target.value,
                  }))
                }
              />
            </Field>
            <Field label="Cover image URL" htmlFor="blog-cover">
              <Input
                id="blog-cover"
                type="url"
                value={form.coverImageUrl}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    coverImageUrl: event.target.value,
                  }))
                }
              />
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="SEO title" htmlFor="blog-seo-title">
                <Input
                  id="blog-seo-title"
                  value={form.seoTitle}
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      seoTitle: event.target.value,
                    }))
                  }
                />
              </Field>
              <Field label="Author" htmlFor="blog-author">
                <Input
                  id="blog-author"
                  value={form.author}
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      author: event.target.value,
                    }))
                  }
                />
              </Field>
            </div>
            <Field label="SEO description" htmlFor="blog-seo-description">
              <Textarea
                id="blog-seo-description"
                rows={2}
                value={form.seoDescription}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    seoDescription: event.target.value,
                  }))
                }
              />
            </Field>
            <Field label="OG image URL" htmlFor="blog-og">
              <Input
                id="blog-og"
                type="url"
                value={form.ogImageUrl}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    ogImageUrl: event.target.value,
                  }))
                }
              />
            </Field>
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                className="size-4 rounded border-border"
                checked={form.featured}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    featured: event.target.checked,
                  }))
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
