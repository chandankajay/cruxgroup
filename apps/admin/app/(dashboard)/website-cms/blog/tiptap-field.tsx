"use client";

import TiptapImage from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";

export function TiptapField({
  value,
  onChange,
  placeholder,
}: {
  readonly value: string;
  readonly onChange: (html: string) => void;
  readonly placeholder?: string;
}): React.ReactElement {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      TiptapImage,
      Placeholder.configure({
        placeholder: placeholder ?? "Write…",
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class:
          "prose-crux min-h-[200px] max-w-none rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (!editor || editor.isDestroyed) return;
    const cur = editor.getHTML();
    if (value && value !== cur && value !== "<p></p>") {
      editor.commands.setContent(value, false);
    }
  }, [editor, value]);

  if (!editor) {
    return (
      <div className="min-h-[200px] rounded-md border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
        Loading editor…
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1">
        <button
          type="button"
          className="rounded border px-2 py-1 text-xs"
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          Bold
        </button>
        <button
          type="button"
          className="rounded border px-2 py-1 text-xs"
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          Italic
        </button>
        <button
          type="button"
          className="rounded border px-2 py-1 text-xs"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
        >
          H2
        </button>
        <button
          type="button"
          className="rounded border px-2 py-1 text-xs"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
        >
          H3
        </button>
        <button
          type="button"
          className="rounded border px-2 py-1 text-xs"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          List
        </button>
        <button
          type="button"
          className="rounded border px-2 py-1 text-xs"
          onClick={() => {
            const url = window.prompt("Link URL");
            if (url) editor.chain().focus().setLink({ href: url }).run();
          }}
        >
          Link
        </button>
        <button
          type="button"
          className="rounded border px-2 py-1 text-xs"
          onClick={() => {
            const url = window.prompt("Image URL");
            if (url) editor.chain().focus().setImage({ src: url }).run();
          }}
        >
          Image
        </button>
        <button
          type="button"
          className="rounded border px-2 py-1 text-xs"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          Quote
        </button>
        <button
          type="button"
          className="rounded border px-2 py-1 text-xs"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        >
          Code
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
