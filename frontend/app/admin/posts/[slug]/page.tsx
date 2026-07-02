"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import MediaPicker from "@/components/admin/MediaPicker";
import Editor from "@/components/editor/Editor";
import {
  getAdminPost,
  listCategories,
  listTags,
  publishPost,
  unpublishPost,
  updatePost,
} from "@/lib/browser-api";
import type {
  Category,
  MediaAsset,
  PostAdmin,
  Tag,
  TiptapDoc,
} from "@/lib/types";

import styles from "../../admin.module.css";

type SaveState = "idle" | "saving" | "saved" | "error";

export default function PostEditorPage() {
  const params = useParams<{ slug: string }>();

  const [post, setPost] = useState<PostAdmin | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [featuredPicker, setFeaturedPicker] = useState(false);

  const bodyRef = useRef<TiptapDoc | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentSlug = useRef<string>(params.slug);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [p, cats, tags] = await Promise.all([
        getAdminPost(params.slug),
        listCategories(),
        listTags(),
      ]);
      if (cancelled) return;
      setPost(p);
      bodyRef.current = p.body;
      currentSlug.current = p.slug;
      setCategories(cats.results);
      setAllTags(tags.results);
    })();
    return () => {
      cancelled = true;
    };
  }, [params.slug]);

  const persist = useCallback(async (patch: Partial<PostAdmin>) => {
    setSaveState("saving");
    try {
      const updated = await updatePost(currentSlug.current, patch);
      currentSlug.current = updated.slug;
      setPost((prev) => (prev ? { ...prev, ...updated } : updated));
      setSaveState("saved");
      // Keep the URL in sync if the slug changed.
      if (updated.slug !== params.slug) {
        window.history.replaceState(null, "", `/admin/posts/${updated.slug}`);
      }
    } catch {
      setSaveState("error");
    }
  }, [params.slug]);

  const scheduleSave = useCallback(
    (patch: Partial<PostAdmin>) => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => persist(patch), 900);
    },
    [persist],
  );

  function updateField<K extends keyof PostAdmin>(key: K, value: PostAdmin[K]) {
    setPost((prev) => (prev ? { ...prev, [key]: value } : prev));
    scheduleSave({ [key]: value } as Partial<PostAdmin>);
  }

  function handleBodyChange(doc: TiptapDoc) {
    bodyRef.current = doc;
    scheduleSave({ body: doc });
  }

  async function handlePublish() {
    if (!post) return;
    if (timer.current) clearTimeout(timer.current);
    await persist({ body: bodyRef.current ?? post.body });
    const updated = await publishPost(currentSlug.current);
    setPost((prev) => (prev ? { ...prev, ...updated } : updated));
    setSaveState("saved");
  }

  async function handleUnpublish() {
    if (!post) return;
    const updated = await unpublishPost(currentSlug.current);
    setPost((prev) => (prev ? { ...prev, ...updated } : updated));
  }

  function toggleTag(tag: Tag) {
    if (!post) return;
    const has = post.tags.some((t) => t.id === tag.id);
    const nextTags = has
      ? post.tags.filter((t) => t.id !== tag.id)
      : [...post.tags, tag];
    setPost({ ...post, tags: nextTags });
    scheduleSave({ tag_ids: nextTags.map((t) => t.id) } as unknown as Partial<PostAdmin>);
  }

  function setFeatured(asset: MediaAsset | null) {
    if (!post) return;
    setPost({
      ...post,
      featured_image: asset?.id ?? null,
      featured_image_detail: asset ?? null,
    });
    scheduleSave({ featured_image: asset?.id ?? null });
    setFeaturedPicker(false);
  }

  if (!post) {
    return <p className={styles.muted}>Loading…</p>;
  }

  const saveLabel: Record<SaveState, string> = {
    idle: "",
    saving: "Saving…",
    saved: "All changes saved",
    error: "Save failed",
  };

  return (
    <div>
      <div className={styles.pageHeader}>
        <Link href="/admin" className={styles.rowLink}>
          ← Posts
        </Link>
        <span className={styles.saveState}>{saveLabel[saveState]}</span>
      </div>

      <div className={styles.editorGrid}>
        <div className={styles.editorMain}>
          <input
            className={styles.titleInput}
            value={post.title}
            placeholder="Title"
            onChange={(e) => updateField("title", e.target.value)}
          />
          <div className={styles.slugRow}>
            <span>/blog/</span>
            <input
              className={styles.slugInput}
              value={post.slug}
              onChange={(e) => updateField("slug", e.target.value)}
            />
          </div>

          <Editor
            initialContent={post.body}
            mediaMap={post.media}
            onChange={handleBodyChange}
          />
        </div>

        <aside className={styles.sidePanel}>
          <div className={styles.panelCard}>
            <p className={styles.panelTitle}>Status: {post.status}</p>
            {post.status === "published" ? (
              <button className={styles.secondaryBtn} onClick={handleUnpublish}>
                Unpublish
              </button>
            ) : (
              <button className={styles.primaryBtn} onClick={handlePublish}>
                Publish
              </button>
            )}
            {post.status === "published" ? (
              <Link
                className={styles.secondaryBtn}
                href={`/blog/${post.slug}`}
                target="_blank"
                style={{ textAlign: "center", textDecoration: "none" }}
              >
                View live ↗
              </Link>
            ) : null}
          </div>

          <div className={styles.panelCard}>
            <p className={styles.panelTitle}>Featured image</p>
            {post.featured_image_detail?.url ? (
              <div
                className={styles.thumbPicker}
                onClick={() => setFeaturedPicker(true)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={post.featured_image_detail.url}
                  alt={post.featured_image_detail.alt_text}
                />
                Change
              </div>
            ) : (
              <div className={styles.thumbPicker} onClick={() => setFeaturedPicker(true)}>
                Choose image
              </div>
            )}
            {post.featured_image ? (
              <button className={styles.secondaryBtn} onClick={() => setFeatured(null)}>
                Remove
              </button>
            ) : null}
          </div>

          <div className={styles.panelCard}>
            <p className={styles.panelTitle}>Organize</p>
            <label className={styles.label}>
              Category
              <select
                className={styles.select}
                value={post.category ?? ""}
                onChange={(e) =>
                  updateField(
                    "category",
                    e.target.value ? Number(e.target.value) : null,
                  )
                }
              >
                <option value="">— None —</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </label>
            <div>
              <span className={styles.label} style={{ marginBottom: 6 }}>
                Tags
              </span>
              <div className={styles.tagChips}>
                {allTags.length === 0 ? (
                  <span className={styles.muted}>No tags yet</span>
                ) : (
                  allTags.map((tag) => {
                    const active = post.tags.some((t) => t.id === tag.id);
                    return (
                      <button
                        key={tag.id}
                        type="button"
                        className={active ? styles.tagChipActive : styles.tagChip}
                        onClick={() => toggleTag(tag)}
                      >
                        {tag.name}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          <div className={styles.panelCard}>
            <p className={styles.panelTitle}>Excerpt</p>
            <textarea
              className={styles.textarea}
              value={post.excerpt}
              placeholder="Optional summary (falls back to body text)"
              onChange={(e) => updateField("excerpt", e.target.value)}
            />
          </div>

          <div className={styles.panelCard}>
            <p className={styles.panelTitle}>SEO</p>
            <label className={styles.label}>
              SEO title
              <input
                className={styles.input}
                value={post.seo_title}
                maxLength={70}
                placeholder={post.title}
                onChange={(e) => updateField("seo_title", e.target.value)}
              />
            </label>
            <label className={styles.label}>
              Meta description
              <textarea
                className={styles.textarea}
                value={post.seo_description}
                maxLength={160}
                onChange={(e) => updateField("seo_description", e.target.value)}
              />
            </label>
            <label className={styles.label}>
              Canonical URL
              <input
                className={styles.input}
                value={post.canonical_url}
                placeholder="https://…"
                onChange={(e) => updateField("canonical_url", e.target.value)}
              />
            </label>
            <label className={styles.checkboxRow}>
              <input
                type="checkbox"
                checked={post.noindex}
                onChange={(e) => updateField("noindex", e.target.checked)}
              />
              Hide from search engines (noindex)
            </label>
          </div>
        </aside>
      </div>

      {featuredPicker ? (
        <MediaPicker
          onSelect={(assets) => setFeatured(assets[0] ?? null)}
          onClose={() => setFeaturedPicker(false)}
        />
      ) : null}
    </div>
  );
}
