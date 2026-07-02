"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import Placeholder from "@tiptap/extension-placeholder";
import StarterKit from "@tiptap/starter-kit";
import { useCallback, useEffect, useRef, useState } from "react";

import MediaPicker from "@/components/admin/MediaPicker";
import type { MediaAssetAdmin, MediaMap, TiptapDoc } from "@/lib/types";

import { GalleryBlock, MediaBlock } from "./extensions";
import { seedFromMediaMap } from "./mediaStore";
import { registerPicker, type PickerOptions } from "./pickerBridge";
import { SlashCommand } from "./SlashCommand";

import styles from "@/app/admin/admin.module.css";

interface EditorProps {
  initialContent: TiptapDoc;
  mediaMap: MediaMap;
  onChange: (doc: TiptapDoc) => void;
}

interface PickerState {
  multiple: boolean;
  resolve: (assets: MediaAssetAdmin[] | null) => void;
}

export default function Editor({
  initialContent,
  mediaMap,
  onChange,
}: EditorProps) {
  const [picker, setPicker] = useState<PickerState | null>(null);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    seedFromMediaMap(mediaMap);
  }, [mediaMap]);

  useEffect(() => {
    registerPicker((opts: PickerOptions) => {
      return new Promise<MediaAssetAdmin[] | null>((resolve) => {
        setPicker({ multiple: opts.multiple ?? false, resolve });
      });
    });
    return () => registerPicker(null);
  }, []);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        link: {
          openOnClick: false,
          HTMLAttributes: { rel: "noopener noreferrer" },
        },
      }),
      Placeholder.configure({
        placeholder: "Write, or press “/” for blocks…",
      }),
      SlashCommand,
      MediaBlock,
      GalleryBlock,
    ],
    content: initialContent,
    onUpdate: ({ editor }) => {
      onChangeRef.current(editor.getJSON() as TiptapDoc);
    },
  });

  const setLink = useCallback(() => {
    if (!editor) return;
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", previous ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  function resolvePicker(assets: MediaAssetAdmin[] | null) {
    picker?.resolve(assets);
    setPicker(null);
  }

  if (!editor) return null;

  return (
    <div className={styles.editorSurface}>
      <BubbleMenu
        editor={editor}
        options={{ placement: "top" }}
        shouldShow={({ editor, from, to }) =>
          from !== to && !editor.isActive("mediaBlock") && !editor.isActive("galleryBlock")
        }
      >
        <div className={styles.bubbleMenu}>
          <button
            className={editor.isActive("bold") ? styles.bubbleBtnActive : styles.bubbleBtn}
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            B
          </button>
          <button
            className={editor.isActive("italic") ? styles.bubbleBtnActive : styles.bubbleBtn}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            style={{ fontStyle: "italic" }}
          >
            i
          </button>
          <button
            className={editor.isActive("strike") ? styles.bubbleBtnActive : styles.bubbleBtn}
            onClick={() => editor.chain().focus().toggleStrike().run()}
            style={{ textDecoration: "line-through" }}
          >
            S
          </button>
          <button
            className={editor.isActive("code") ? styles.bubbleBtnActive : styles.bubbleBtn}
            onClick={() => editor.chain().focus().toggleCode().run()}
          >
            {"</>"}
          </button>
          <button
            className={editor.isActive("link") ? styles.bubbleBtnActive : styles.bubbleBtn}
            onClick={setLink}
          >
            Link
          </button>
        </div>
      </BubbleMenu>

      <EditorContent editor={editor} />

      {picker ? (
        <MediaPicker
          multiple={picker.multiple}
          onSelect={(assets) => resolvePicker(assets)}
          onClose={() => resolvePicker(null)}
        />
      ) : null}
    </div>
  );
}
