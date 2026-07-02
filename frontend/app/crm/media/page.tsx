"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  deleteMedia,
  formatApiError,
  listMedia,
  updateMedia,
  uploadMedia,
} from "@/lib/browser-api";
import type { MediaAssetAdmin } from "@/lib/types";

import styles from "../crm.module.css";

export default function MediaManagerPage() {
  const [assets, setAssets] = useState<MediaAssetAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [editing, setEditing] = useState<MediaAssetAdmin | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const load = useCallback(async (query: string) => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (query) params.search = query;
      const data = await listMedia(params);
      setAssets(data.results);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const id = setTimeout(() => load(search), 250);
    return () => clearTimeout(id);
  }, [load, search]);

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    setUploading(true);
    setUploadError(null);
    try {
      const uploaded: MediaAssetAdmin[] = [];
      for (const file of Array.from(files)) {
        uploaded.push(await uploadMedia(file));
      }
      setAssets((prev) => [...uploaded, ...prev]);
    } catch (error) {
      setUploadError(formatApiError(error));
    } finally {
      setUploading(false);
    }
  }, []);

  async function saveMeta(asset: MediaAssetAdmin) {
    const updated = await updateMedia(asset.id, {
      title: asset.title,
      alt_text: asset.alt_text,
      caption: asset.caption,
      credit: asset.credit,
      focal_x: asset.focal_x,
      focal_y: asset.focal_y,
    });
    setAssets((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
    setEditing(null);
  }

  async function remove(id: number) {
    await deleteMedia(id);
    setAssets((prev) => prev.filter((a) => a.id !== id));
    setEditing(null);
  }

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Media</h1>
        <button
          className={styles.primaryBtn}
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

      <div className={styles.toolbar}>
        <input
          className={styles.input}
          placeholder="Search title, alt, caption…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: 300 }}
        />
      </div>

      {uploadError ? <p className={styles.error}>{uploadError}</p> : null}

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
      ) : assets.length === 0 ? (
        <p className={styles.muted}>No media yet.</p>
      ) : (
        <div className={styles.mediaGrid}>
          {assets.map((asset) => (
            <button
              key={asset.id}
              type="button"
              className={styles.mediaCard}
              onClick={() => setEditing(asset)}
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

      {editing ? (
        <MetadataDrawer
          asset={editing}
          onChange={setEditing}
          onSave={saveMeta}
          onDelete={remove}
          onClose={() => setEditing(null)}
        />
      ) : null}
    </div>
  );
}

function MetadataDrawer({
  asset,
  onChange,
  onSave,
  onDelete,
  onClose,
}: {
  asset: MediaAssetAdmin;
  onChange: (asset: MediaAssetAdmin) => void;
  onSave: (asset: MediaAssetAdmin) => void;
  onDelete: (id: number) => void;
  onClose: () => void;
}) {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.drawer}
        onClick={(e) => e.stopPropagation()}
        style={{ marginLeft: "auto" }}
      >
        <div className={styles.modalHeader}>
          <h2 className={styles.panelTitle}>Edit asset</h2>
          <button className={styles.secondaryBtn} onClick={onClose}>
            Close
          </button>
        </div>

        {asset.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={asset.url}
            alt={asset.alt_text}
            style={{ width: "100%", borderRadius: 6 }}
          />
        ) : null}

        <p className={styles.muted}>
          {asset.width && asset.height
            ? `${asset.width} × ${asset.height}px`
            : asset.kind}
        </p>

        <label className={styles.label}>
          Title
          <input
            className={styles.input}
            value={asset.title ?? ""}
            onChange={(e) => onChange({ ...asset, title: e.target.value })}
          />
        </label>
        <label className={styles.label}>
          Alt text
          <input
            className={styles.input}
            value={asset.alt_text}
            onChange={(e) => onChange({ ...asset, alt_text: e.target.value })}
          />
        </label>
        <label className={styles.label}>
          Caption
          <textarea
            className={styles.textarea}
            value={asset.caption}
            onChange={(e) => onChange({ ...asset, caption: e.target.value })}
          />
        </label>
        <label className={styles.label}>
          Credit
          <input
            className={styles.input}
            value={asset.credit}
            onChange={(e) => onChange({ ...asset, credit: e.target.value })}
          />
        </label>

        <div style={{ display: "flex", gap: 12 }}>
          <label className={styles.label} style={{ flex: 1 }}>
            Focal X
            <input
              className={styles.input}
              type="number"
              step="0.05"
              min="0"
              max="1"
              value={asset.focal_x}
              onChange={(e) =>
                onChange({ ...asset, focal_x: Number(e.target.value) })
              }
            />
          </label>
          <label className={styles.label} style={{ flex: 1 }}>
            Focal Y
            <input
              className={styles.input}
              type="number"
              step="0.05"
              min="0"
              max="1"
              value={asset.focal_y}
              onChange={(e) =>
                onChange({ ...asset, focal_y: Number(e.target.value) })
              }
            />
          </label>
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
          <button className={styles.primaryBtn} onClick={() => onSave(asset)}>
            Save
          </button>
          <button className={styles.dangerBtn} onClick={() => onDelete(asset.id)}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
