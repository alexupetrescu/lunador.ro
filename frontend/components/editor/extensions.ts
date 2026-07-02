"use client";

import { mergeAttributes, Node } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";

import GalleryBlockView from "./GalleryBlockView";
import MediaBlockView from "./MediaBlockView";

export const MediaBlock = Node.create({
  name: "mediaBlock",
  group: "block",
  atom: true,
  selectable: true,
  draggable: false,

  addAttributes() {
    return {
      assetId: { default: null },
      layout: { default: "default" },
    };
  },

  parseHTML() {
    return [{ tag: "div[data-media-block]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-media-block": "",
        "data-asset-id": HTMLAttributes.assetId ?? "",
      }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(MediaBlockView);
  },
});

export const GalleryBlock = Node.create({
  name: "galleryBlock",
  group: "block",
  atom: true,
  selectable: true,
  draggable: false,

  addAttributes() {
    return {
      assetIds: {
        default: [] as number[],
        parseHTML: (element) => {
          const raw = element.getAttribute("data-asset-ids");
          return raw ? JSON.parse(raw) : [];
        },
        renderHTML: (attributes) => ({
          "data-asset-ids": JSON.stringify(attributes.assetIds ?? []),
        }),
      },
    };
  },

  parseHTML() {
    return [{ tag: "div[data-gallery-block]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-gallery-block": "" })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(GalleryBlockView);
  },
});
