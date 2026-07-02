"use client";

import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";

import { addAssets, useAsset } from "./mediaStore";
import { moveNode } from "./nodeCommands";
import { openMediaPicker } from "./pickerBridge";

import styles from "@/app/crm/crm.module.css";

export default function MediaBlockView({
  node,
  updateAttributes,
  deleteNode,
  editor,
  getPos,
  selected,
}: NodeViewProps) {
  const assetId = node.attrs.assetId as number | null;
  const layout = (node.attrs.layout as string) || "default";
  const asset = useAsset(assetId);

  async function choose() {
    const picked = await openMediaPicker({ multiple: false });
    if (picked && picked.length) {
      addAssets(picked);
      updateAttributes({ assetId: picked[0].id });
    }
  }

  function cycleLayout() {
    const order = ["default", "wide", "full"];
    const next = order[(order.indexOf(layout) + 1) % order.length];
    updateAttributes({ layout: next });
  }

  return (
    <NodeViewWrapper
      className={`${styles.nodeWrap} ${selected ? styles.nodeSelected : ""}`}
      data-layout={layout}
    >
      {assetId == null || !asset ? (
        <div className={styles.nodePlaceholder} onClick={choose}>
          {assetId == null ? "Click to choose an image" : "Loading image…"}
        </div>
      ) : (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className={styles.nodeImg} src={asset.url ?? ""} alt={asset.alt_text} />
          {asset.caption ? (
            <div className={styles.nodeCaption}>{asset.caption}</div>
          ) : null}
        </>
      )}

      <div className={styles.nodeToolbar} contentEditable={false}>
        <button className={styles.nodeToolbarBtn} onClick={choose} title="Replace">
          ⟳
        </button>
        <button
          className={styles.nodeToolbarBtn}
          onClick={cycleLayout}
          title={`Layout: ${layout}`}
        >
          ▭
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
