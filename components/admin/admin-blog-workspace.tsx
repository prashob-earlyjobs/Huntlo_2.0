"use client";

import { Eye, MoreHorizontal, Pencil, Plus } from "lucide-react";
import { useEffect, useState } from "react";

import { Field } from "@/components/outreach/builder-ui";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  BLOG_ARTICLES,
  BLOG_CATEGORIES,
  type BlogArticle,
  type BlogStatus,
  type SeoStatus,
} from "@/lib/mock-admin";
import { cn } from "@/lib/utils";

const HEAD = "h-9 whitespace-nowrap text-xs font-medium text-muted-foreground";

const STATUS_CLASS: Record<BlogStatus, string> = {
  Draft: "bg-muted text-muted-foreground",
  Published: "bg-success/10 text-success",
  Scheduled: "bg-info/10 text-info",
};

const SEO_CLASS: Record<SeoStatus, string> = {
  Optimised: "bg-success/10 text-success",
  "Needs work": "bg-warning/10 text-warning",
  Missing: "bg-destructive/10 text-destructive",
};

function emptyArticle(): BlogArticle {
  return {
    id: "new",
    title: "",
    slug: "",
    category: "Product",
    author: "Platform Admin",
    status: "Draft",
    publishedAt: "—",
    seoStatus: "Missing",
    excerpt: "",
  };
}

export function AdminBlogWorkspace() {
  const [articles, setArticles] = useState(BLOG_ARTICLES);
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState<BlogArticle | null>(null);
  const [draft, setDraft] = useState<BlogArticle>(emptyArticle());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(id);
  }, [toast]);

  function openCreate() {
    setEditingId(null);
    setDraft(emptyArticle());
    setOpen(true);
  }

  function openEdit(article: BlogArticle) {
    setEditingId(article.id);
    setDraft({ ...article });
    setOpen(true);
  }

  function saveArticle() {
    if (!draft.title.trim()) {
      setToast("Article title is required.");
      return;
    }
    const slug =
      draft.slug.trim() ||
      draft.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    if (editingId) {
      setArticles((previous) =>
        previous.map((article) =>
          article.id === editingId ? { ...draft, slug, id: editingId } : article
        )
      );
      setToast(`Updated “${draft.title}”.`);
    } else {
      const id = `b-${Date.now()}`;
      setArticles((previous) => [
        { ...draft, id, slug },
        ...previous,
      ]);
      setToast(`Created “${draft.title}”.`);
    }
    setOpen(false);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Blog management"
        description="Draft, schedule and publish Huntlo content with SEO status tracking."
        actions={
          <Button size="sm" onClick={openCreate}>
            <Plus aria-hidden />
            Create article
          </Button>
        }
      />

      {toast ? (
        <div
          role="status"
          className="rounded-lg border border-border bg-card px-3 py-2 text-sm shadow-sm"
        >
          {toast}
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className={HEAD}>Article</TableHead>
              <TableHead className={HEAD}>Category</TableHead>
              <TableHead className={HEAD}>Author</TableHead>
              <TableHead className={HEAD}>Status</TableHead>
              <TableHead className={HEAD}>Published date</TableHead>
              <TableHead className={HEAD}>SEO status</TableHead>
              <TableHead className={HEAD}>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {articles.map((article) => (
              <TableRow key={article.id}>
                <TableCell className="min-w-[14rem]">
                  <p className="font-medium">{article.title}</p>
                  <p className="text-xs text-muted-foreground">
                    /{article.slug}
                  </p>
                </TableCell>
                <TableCell className="text-sm">{article.category}</TableCell>
                <TableCell className="whitespace-nowrap text-sm">
                  {article.author}
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      "inline-flex rounded-md px-2 py-0.5 text-xs font-medium",
                      STATUS_CLASS[article.status]
                    )}
                  >
                    {article.status}
                  </span>
                </TableCell>
                <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                  {article.publishedAt}
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      "inline-flex rounded-md px-2 py-0.5 text-xs font-medium",
                      SEO_CLASS[article.seoStatus]
                    )}
                  >
                    {article.seoStatus}
                  </span>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          aria-label={`Actions for ${article.title}`}
                        />
                      }
                    >
                      <MoreHorizontal aria-hidden />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEdit(article)}>
                        <Pencil aria-hidden />
                        Edit article
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setPreview(article)}>
                        <Eye aria-hidden />
                        Preview
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Create / Edit */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit article" : "Create article"}
            </DialogTitle>
            <DialogDescription>
              Content is stored in this UI session only.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <Field label="Title" htmlFor="blog-title" required>
              <Input
                id="blog-title"
                value={draft.title}
                onChange={(event) =>
                  setDraft((previous) => ({
                    ...previous,
                    title: event.target.value,
                  }))
                }
              />
            </Field>
            <Field label="Slug" htmlFor="blog-slug">
              <Input
                id="blog-slug"
                value={draft.slug}
                onChange={(event) =>
                  setDraft((previous) => ({
                    ...previous,
                    slug: event.target.value,
                  }))
                }
                placeholder="auto-from-title"
              />
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Category" htmlFor="blog-cat">
                <Select
                  value={draft.category}
                  onValueChange={(value) =>
                    value &&
                    setDraft((previous) => ({ ...previous, category: value }))
                  }
                >
                  <SelectTrigger id="blog-cat" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BLOG_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Author" htmlFor="blog-author">
                <Input
                  id="blog-author"
                  value={draft.author}
                  onChange={(event) =>
                    setDraft((previous) => ({
                      ...previous,
                      author: event.target.value,
                    }))
                  }
                />
              </Field>
              <Field label="Status" htmlFor="blog-status">
                <Select
                  value={draft.status}
                  onValueChange={(value) =>
                    value &&
                    setDraft((previous) => ({
                      ...previous,
                      status: value as BlogStatus,
                      publishedAt:
                        value === "Draft"
                          ? "—"
                          : previous.publishedAt === "—"
                            ? "16 Jul 2026"
                            : previous.publishedAt,
                    }))
                  }
                >
                  <SelectTrigger id="blog-status" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(["Draft", "Published", "Scheduled"] as BlogStatus[]).map(
                      (status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="SEO status" htmlFor="blog-seo">
                <Select
                  value={draft.seoStatus}
                  onValueChange={(value) =>
                    value &&
                    setDraft((previous) => ({
                      ...previous,
                      seoStatus: value as SeoStatus,
                    }))
                  }
                >
                  <SelectTrigger id="blog-seo" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(
                      ["Optimised", "Needs work", "Missing"] as SeoStatus[]
                    ).map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <Field label="Excerpt" htmlFor="blog-excerpt">
              <Textarea
                id="blog-excerpt"
                rows={3}
                value={draft.excerpt}
                onChange={(event) =>
                  setDraft((previous) => ({
                    ...previous,
                    excerpt: event.target.value,
                  }))
                }
              />
            </Field>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveArticle}>
              {editingId ? "Save article" : "Create article"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview */}
      <Dialog
        open={!!preview}
        onOpenChange={(isOpen) => {
          if (!isOpen) setPreview(null);
        }}
      >
        <DialogContent className="sm:max-w-lg">
          {preview ? (
            <>
              <DialogHeader>
                <DialogTitle>{preview.title}</DialogTitle>
                <DialogDescription>
                  {preview.category} · {preview.author} · {preview.status}
                </DialogDescription>
              </DialogHeader>
              <p className="text-sm text-muted-foreground">{preview.excerpt}</p>
              <p className="text-xs text-muted-foreground">
                Slug: /blog/{preview.slug} · SEO: {preview.seoStatus} ·{" "}
                {preview.publishedAt}
              </p>
              <DialogFooter>
                <Button variant="outline" onClick={() => setPreview(null)}>
                  Close
                </Button>
                <Button
                  onClick={() => {
                    openEdit(preview);
                    setPreview(null);
                  }}
                >
                  Edit article
                </Button>
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
