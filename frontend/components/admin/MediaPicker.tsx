"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { listMedia, uploadMedia } from "@/lib/browser-api";
import type { MediaAssetAdmin } from "@/lib/types";

import styles from "@/app/admin/admin.module.css";

interface MediaPickerProps {
  multiple?: boolean;
  onSelect: (assets: MediaAssetAdmin[]) => void;
  onClose: () => void;
}

export default function MediaPicker({
  multiple = false,
  onSelect,
  onClose,
}: MediaPickerProps) {
  const [assets, setAssets] = useState<MediaAssetAdmin[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const load = useCallback(async (query: string) => {
    const params: Record<string, string> = { kind: "image" };
    if (query) params.search = query;
    try {
      const data = await listMedia(params);
      setAssets(data.results);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(search);
  }, [load, search]);

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    setUploading(true);
    try {
      const uploaded: MediaAssetAdmin[] = [];
      for (const file of Array.from(files)) {
        uploaded.push(await uploadMedia(file));
      }
      setAssets((prev) => [...uploaded, ...prev]);
    } finally {
      setUploading(false);
    }
  }, []);

  function toggle(id: number) {
    if (multiple) {
      setSelected((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
      );
    } else {
      setSelected([id]);
    }
  }

  function confirmSelection() {
    const chosen = assets.filter((a) => selected.includes(a.id));
    if (chosen.length) onSelect(chosen);
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.pageTitle}>Media library</h2>
          <button className={styles.secondaryBtn} onClick={onClose}>
            Close
          </button>
        </div>

        <div className={styles.toolbar}>
          <input
            className={styles.input}
            placeholder="Search…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ maxWidth: 240 }}
          />
          <button
            className={styles.secondaryBtn}
            onClick={() => fileInput.current?.click()}
            disabled={uploading}
          >
            {uploading ? "Uploading…" : "Upload"}
          </button>
          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(e) => {
              if (e.target.files) handleFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </div>

        <div
          className={`${styles.dropzone} ${dragging ? styles.dropzoneActive : ""}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
          }}
        >
          Drag & drop images here to upload
        </div>

        {loading ? (
          <p className={styles.muted}>Loading…</p>
        ) : (
          <div className={styles.mediaGrid}>
            {assets.map((asset) => (
              <button
                key={asset.id}
                type="button"
                className={`${styles.mediaCard} ${
                  selected.includes(asset.id) ? styles.selected : ""
                }`}
                onClick={() => toggle(asset.id)}
              >
                {asset.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img className={styles.mediaThumb} src={asset.url} alt={asset.alt_text} />
                ) : (
                  <div className={styles.mediaThumbFallback}>{asset.kind}</div>
                )}
                <div className={styles.mediaMeta}>
                  <div className={styles.mediaTitle}>
                    {asset.title || `#${asset.id}`}
                  </div>
                  {!asset.alt_text ? (
                    <div className={styles.mediaNoAlt}>No alt text</div>
                  ) : null}
                </div>
              </button>
            ))}
          </div>
        )}

        <div
          style={{
            marginTop: 20,
            display: "flex",
            justifyContent: "flex-end",
            gap: 12,
          }}
        >
          <button className={styles.secondaryBtn} onClick={onClose}>
            Cancel
          </button>
          <button
            className={styles.primaryBtn}
            onClick={confirmSelection}
            disabled={!selected.length}
          >
            {multiple ? `Insert ${selected.length || ""}`.trim() : "Select"}
          </button>
        </div>
      </div>
    </div>
  );
}
