"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";

import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  className?: string;
  onChange: (html: string) => void;
  value: string;
}

export function RichTextEditor(props: RichTextEditorProps): JSX.Element {
  const editor = useEditor({
    extensions: [StarterKit],
    content: props.value,
    editorProps: {
      attributes: {
        class: cn(
          "prose-editor min-h-40 rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none",
          props.className,
        ),
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      props.onChange(currentEditor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) {
      return;
    }

    if (editor.getHTML() !== props.value) {
      editor.commands.setContent(props.value, {
        emitUpdate: false,
      });
    }
  }, [editor, props.value]);

  return <EditorContent editor={editor} />;
}
