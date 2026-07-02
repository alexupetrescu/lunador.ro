"use client";

import { Extension } from "@tiptap/core";
import { ReactRenderer } from "@tiptap/react";
import Suggestion, {
  type SuggestionOptions,
  type SuggestionProps,
} from "@tiptap/suggestion";

import { addAssets } from "./mediaStore";
import { openMediaPicker } from "./pickerBridge";
import SlashMenu, { type SlashItem, type SlashMenuRef } from "./SlashMenu";

function buildItems(query: string): SlashItem[] {
  const items: SlashItem[] = [
    {
      title: "Heading 2",
      hint: "Section heading",
      action: ({ editor, range }) =>
        editor.chain().focus().deleteRange(range).setNode("heading", { level: 2 }).run(),
    },
    {
      title: "Heading 3",
      hint: "Sub-section",
      action: ({ editor, range }) =>
        editor.chain().focus().deleteRange(range).setNode("heading", { level: 3 }).run(),
    },
    {
      title: "Bullet list",
      hint: "Unordered list",
      action: ({ editor, range }) =>
        editor.chain().focus().deleteRange(range).toggleBulletList().run(),
    },
    {
      title: "Numbered list",
      hint: "Ordered list",
      action: ({ editor, range }) =>
        editor.chain().focus().deleteRange(range).toggleOrderedList().run(),
    },
    {
      title: "Quote",
      hint: "Blockquote",
      action: ({ editor, range }) =>
        editor.chain().focus().deleteRange(range).toggleBlockquote().run(),
    },
    {
      title: "Code block",
      hint: "Monospaced code",
      action: ({ editor, range }) =>
        editor.chain().focus().deleteRange(range).toggleCodeBlock().run(),
    },
    {
      title: "Divider",
      hint: "Horizontal rule",
      action: ({ editor, range }) =>
        editor.chain().focus().deleteRange(range).setHorizontalRule().run(),
    },
    {
      title: "Image",
      hint: "From media library",
      action: async ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).run();
        const picked = await openMediaPicker({ multiple: false });
        if (picked && picked.length) {
          addAssets(picked);
          editor
            .chain()
            .focus()
            .insertContent({ type: "mediaBlock", attrs: { assetId: picked[0].id } })
            .run();
        }
      },
    },
    {
      title: "Gallery",
      hint: "Multiple images",
      action: async ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).run();
        const picked = await openMediaPicker({ multiple: true });
        if (picked && picked.length) {
          addAssets(picked);
          editor
            .chain()
            .focus()
            .insertContent({
              type: "galleryBlock",
              attrs: { assetIds: picked.map((a) => a.id) },
            })
            .run();
        }
      },
    },
  ];

  const q = query.toLowerCase().trim();
  if (!q) return items;
  return items.filter((item) => item.title.toLowerCase().includes(q));
}

function positionPopup(
  clientRect: (() => DOMRect | null) | null | undefined,
  el: HTMLElement,
) {
  const rect = clientRect?.();
  if (!rect) return;
  el.style.left = `${rect.left}px`;
  el.style.top = `${rect.bottom + 6}px`;
}

const suggestion: Omit<SuggestionOptions<SlashItem>, "editor"> = {
  char: "/",
  startOfLine: false,
  items: ({ query }) => buildItems(query),
  command: ({ editor, range, props }) => {
    props.action({ editor, range });
  },
  render: () => {
    let component: ReactRenderer<
      SlashMenuRef,
      { items: SlashItem[]; command: (item: SlashItem) => void }
    > | null = null;
    let popup: HTMLDivElement | null = null;

    return {
      onStart: (props: SuggestionProps<SlashItem>) => {
        component = new ReactRenderer(SlashMenu, {
          props: {
            items: props.items,
            command: (item: SlashItem) => props.command(item),
          },
          editor: props.editor,
        });
        popup = document.createElement("div");
        popup.style.position = "fixed";
        popup.style.zIndex = "130";
        popup.appendChild(component.element);
        document.body.appendChild(popup);
        positionPopup(props.clientRect, popup);
      },
      onUpdate: (props: SuggestionProps<SlashItem>) => {
        component?.updateProps({
          items: props.items,
          command: (item: SlashItem) => props.command(item),
        });
        if (popup) positionPopup(props.clientRect, popup);
      },
      onKeyDown: (props: { event: KeyboardEvent }) => {
        if (props.event.key === "Escape") {
          popup?.remove();
          return true;
        }
        return component?.ref?.onKeyDown(props.event) ?? false;
      },
      onExit: () => {
        popup?.remove();
        popup = null;
        component?.destroy();
        component = null;
      },
    };
  },
};

export const SlashCommand = Extension.create({
  name: "slashCommand",

  addProseMirrorPlugins() {
    return [
      Suggestion<SlashItem>({
        editor: this.editor,
        ...suggestion,
      }),
    ];
  },
});
