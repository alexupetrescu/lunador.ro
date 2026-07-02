"use client";

import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";

import { resolveMediaUrl } from "@/lib/media-url";

import { addAssets, useAsset } from "./mediaStore";
import { moveNode } from "./nodeCommands";
import { openMediaPicker } from "./pickerBridge";

import styles from "@/app/crm/crm.module.css";

function GalleryThumb({ id }: { id: number }) {
  const asset = useAsset(id);
  const src = resolveMediaUrl(asset?.url);
  if (!src) return null;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={asset!.alt_text} />;
}

export default function GalleryBlockView({
  node,
  updateAttributes,
  deleteNode,
  editor,
  getPos,
  selected,
}: NodeViewProps) {
  const ids = (node.attrs.assetIds as number[]) ?? [];

  async function choose() {
    const picked = await openMediaPicker({ multiple: true });
    if (picked && picked.length) {
      addAssets(picked);
      updateAttributes({ assetIds: picked.map((a) => a.id) });
    }
  }

  return (
    <NodeViewWrapper
      className={`${styles.nodeWrap} ${selected ? styles.nodeSelected : ""}`}
    >
      {ids.length === 0 ? (
        <div className={styles.nodePlaceholder} onClick={choose}>
          Click to choose gallery images
        </div>
      ) : (
        <div className={styles.galleryGrid}>
          {ids.map((id) => (
            <GalleryThumb key={id} id={id} />
          ))}
        </div>
      )}

      <div className={styles.nodeToolbar} contentEditable={false}>
        <button className={styles.nodeToolbarBtn} onClick={choose} title="Choose images">
          ⟳
        </button>
        <button
          className={styles.nodeToolbarBtn}
          onClick={() => moveNode(editor, getPos, -1)}
          title="Move up"
        >
          ↑
        </button>
        <button
          className={styles.nodeToolbarBtn}
          onClick={() => moveNode(editor, getPos, 1)}
          title="Move down"
        >
          ↓
        </button>
        <button
          className={styles.nodeToolbarBtn}
          onClick={() => deleteNode()}
          title="Delete"
        >
          ✕
        </button>
      </div>
    </NodeViewWrapper>
  );
}
