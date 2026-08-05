"use client";

import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

import { cn } from "@/lib/utils";

type Props = {
  value: string;
  onChange: (html: string) => void;
  /** Remount editor when switching posts */
  editorKey?: string;
  placeholder?: string;
};

function ToolbarButton({
  label,
  active,
  disabled,
  onClick,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "min-w-8 rounded-md border border-transparent px-1.5 py-1 text-xs font-semibold text-foreground transition-colors",
        "hover:border-border hover:bg-background disabled:cursor-not-allowed disabled:opacity-40",
        active && "border-primary/35 bg-primary/10 text-primary"
      )}
    >
      {label}
    </button>
  );
}

export function AdminBlogRichTextEditor({
  value,
  onChange,
  editorKey = "default",
  placeholder = "Write your article…",
}: Props) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
      }),
      Placeholder.configure({ placeholder }),
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class:
          "min-h-56 max-h-[28rem] overflow-y-auto px-4 py-3.5 text-[0.9375rem] leading-relaxed text-foreground outline-none prose-admin-blog",
      },
    },
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getHTML());
    },
  });

  const setLink = () => {
    if (!editor) return;
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", previous || "https://");
    if (url === null) return;
    if (url.trim() === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url.trim() })
      .run();
  };

  if (!editor) {
    return (
      <div className="flex min-h-48 items-center rounded-lg border border-border bg-card px-4 text-sm text-muted-foreground">
        Loading editor…
      </div>
    );
  }

  return (
    <div
      key={editorKey}
      className="overflow-hidden rounded-lg border border-border bg-card"
    >
      <div
        className="flex flex-wrap items-center gap-1 border-b border-border bg-muted/40 px-2 py-1.5"
        role="toolbar"
        aria-label="Formatting"
      >
        <ToolbarButton
          label="B"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        />
        <ToolbarButton
          label="I"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        />
        <span className="mx-0.5 h-5 w-px bg-border" aria-hidden />
        <ToolbarButton
          label="H2"
          active={editor.isActive("heading", { level: 2 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
        />
        <ToolbarButton
          label="H3"
          active={editor.isActive("heading", { level: 3 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
        />
        <span className="mx-0.5 h-5 w-px bg-border" aria-hidden />
        <ToolbarButton
          label="• List"
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        />
        <ToolbarButton
          label="1. List"
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        />
        <span className="mx-0.5 h-5 w-px bg-border" aria-hidden />
        <ToolbarButton
          label="Link"
          active={editor.isActive("link")}
          onClick={setLink}
        />
        <span className="mx-0.5 h-5 w-px bg-border" aria-hidden />
        <ToolbarButton
          label="Undo"
          disabled={!editor.can().undo()}
          onClick={() => editor.chain().focus().undo().run()}
        />
        <ToolbarButton
          label="Redo"
          disabled={!editor.can().redo()}
          onClick={() => editor.chain().focus().redo().run()}
        />
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
