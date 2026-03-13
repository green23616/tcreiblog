"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { TagInput } from "@/components/tag-input";
import "easymde/dist/easymde.min.css";

interface PostEditorProps {
  initialTitle?: string;
  initialContent?: string;
  initialTags?: string[];
  allTags: string[];
  action: (formData: FormData) => Promise<unknown>;
  deleteAction?: () => Promise<unknown>;
  cancelHref?: string;
  submitLabel?: string;
}

export function PostEditor({
  initialTitle = "",
  initialContent = "",
  initialTags = [],
  allTags,
  action,
  deleteAction,
  cancelHref = "/",
  submitLabel = "Publish",
}: PostEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const editorRef = useRef<unknown>(null);
  const [content, setContent] = useState(initialContent);
  const [isPending, setIsPending] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!textareaRef.current || editorRef.current) return;

    let editor: { value: () => string; toTextArea: () => void; codemirror: { on: (event: string, cb: () => void) => void } };

    import("easymde").then((mod) => {
      const EasyMDE = mod.default;
      editor = new EasyMDE({
        element: textareaRef.current!,
        initialValue: initialContent,
        spellChecker: false,
        minHeight: "400px",
        toolbar: [
          "bold", "italic", "heading", "|",
          "quote", "code", "unordered-list", "ordered-list", "|",
          "link", "image", "|",
          "preview", "side-by-side", "fullscreen",
        ],
        status: false,
      });

      editor.codemirror.on("change", () => {
        setContent(editor.value());
      });

      editorRef.current = editor;
    });

    return () => {
      if (editorRef.current) {
        (editorRef.current as typeof editor).toTextArea();
        editorRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (formData: FormData) => {
    setIsPending(true);
    try {
      await action(formData);
    } finally {
      setIsPending(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteAction) return;
    setIsPending(true);
    try {
      await deleteAction();
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      {/* Sticky header */}
      <header className="sticky top-0 z-10 border-b border-border bg-background">
        <div className="mx-auto flex max-w-layout items-center justify-between px-4 py-3 md:px-8">
          <Link
            href={cancelHref}
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Cancel
          </Link>
          <div className="flex items-center gap-3">
            {deleteAction && (
              <>
                {confirmDelete ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Sure?</span>
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={isPending}
                      className="text-sm text-destructive transition-colors hover:opacity-70 disabled:opacity-50"
                    >
                      Delete
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(false)}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    className="text-sm text-muted-foreground transition-colors hover:text-destructive"
                  >
                    Delete
                  </button>
                )}
              </>
            )}
            <button
              type="submit"
              form="post-form"
              disabled={isPending}
              className="bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {isPending ? "Saving…" : submitLabel}
            </button>
          </div>
        </div>
      </header>

      {/* Form */}
      <form
        id="post-form"
        action={handleSubmit}
        className="mx-auto w-full max-w-layout flex-1 px-4 py-8 md:px-8"
      >
        <input type="hidden" name="content" value={content} />

        <input
          type="text"
          name="title"
          defaultValue={initialTitle}
          placeholder="Title"
          required
          className="mb-6 w-full border-0 border-b border-border bg-transparent pb-3 text-2xl font-bold tracking-display text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
        />

        <div className="mb-6">
          <textarea ref={textareaRef} className="hidden" readOnly />
        </div>

        <div className="mt-6 border-t border-border pt-6">
          <p className="mb-3 text-xs font-medium uppercase tracking-label text-muted-foreground">
            Tags
          </p>
          <TagInput initialTags={initialTags} allTags={allTags} />
        </div>
      </form>
    </div>
  );
}
