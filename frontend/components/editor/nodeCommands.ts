"use client";

import type { Editor } from "@tiptap/react";

/** Swap a top-level block node with its previous/next sibling. */
export function moveNode(
  editor: Editor,
  getPos: () => number | undefined,
  dir: -1 | 1,
) {
  const pos = getPos();
  if (pos == null) return;
  const { state } = editor.view;
  const $pos = state.doc.resolve(pos);
  const parent = $pos.parent;
  const index = $pos.index();
  const targetIndex = index + dir;
  if (targetIndex < 0 || targetIndex >= parent.childCount) return;

  const node = parent.child(index);
  let tr = state.tr;

  if (dir === -1) {
    const prev = parent.child(index - 1);
    const prevStart = pos - prev.nodeSize;
    tr = tr.delete(pos, pos + node.nodeSize).insert(prevStart, node);
  } else {
    const next = parent.child(index + 1);
    const insertPos = pos + next.nodeSize;
    tr = tr.delete(pos, pos + node.nodeSize).insert(insertPos, node);
  }

  editor.view.dispatch(tr.scrollIntoView());
}
