"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import MediaPicker from "@/components/admin/MediaPicker";
import Editor from "@/components/editor/Editor";
import {
  deletePost,
  getAdminPost,
  listCategories,
  listRevisions,
  listTags,
  publishPost,
  restoreRevision,
  schedulePost,
  unpublishPost,
  updatePost,
} from "@/lib/browser-api";
import { CRM_BASE, crmPath } from "@/lib/crm";
import { resolveMediaUrl } from "@/lib/media-url";
import { slugify } from "@/lib/slugify";
import type {
  Category,
  MediaAsset,
  PostAdmin,
  PostRevision,
  Tag,
  TiptapDoc,
} from "@/lib/types";

import styles from "../../crm.module.css";

type SaveState = "idle" | "saving" | "saved" | "error";

/** Format an ISO timestamp for a <input type="datetime-local"> value. */
function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

export default function PostEditorPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();

  const [post, setPost] = useState<PostAdmin | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [featuredPicker, setFeaturedPicker] = useState(false);
  const [ogPicker, setOgPicker] = useState(false);
  const [scheduleAt, setScheduleAt] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [revisions, setRevisions] = useState<PostRevision[]>([]);
  const [editorKey, setEditorKey] = useState(0);

  const bodyRef = useRef<TiptapDoc | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentSlug = useRef<string>(params.slug);
  const slugEdited = useRef(false);

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
      // Keep auto-slugging only while the slug still tracks the title (or is
      // an auto-generated "untitled..." placeholder).
      slugEdited.current = !(
        p.slug === slugify(p.title) || p.slug.startsWith("untitled")
      );
      setScheduleAt(toLocalInput(p.published_at));
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
        window.history.replaceState(null, "", crmPath(`/posts/${updated.slug}`));
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

  function handleTitleChange(value: string) {
    // Auto-fill the slug from the title on drafts until it's edited by hand.
    const autoSlug =
      !slugEdited.current && post?.status === "draft"
        ? slugify(value) || "untitled"
        : null;
    setPost((prev) =>
      prev
        ? { ...prev, title: value, ...(autoSlug ? { slug: autoSlug } : {}) }
        : prev,
    );
    scheduleSave(
      autoSlug ? { title: value, slug: autoSlug } : { title: value },
    );
  }

  function handleSlugChange(value: string) {
    slugEdited.current = true;
    updateField("slug", value);
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

  async function handleSchedule() {
    if (!post || !scheduleAt) return;
    if (timer.current) clearTimeout(timer.current);
    await persist({ body: bodyRef.current ?? post.body });
    const iso = new Date(scheduleAt).toISOString();
    const updated = await schedulePost(currentSlug.current, iso);
    setPost((prev) => (prev ? { ...prev, ...updated } : updated));
    setSaveState("saved");
  }

  async function handleDelete() {
    if (!post) return;
    const ok = window.confirm(
      `Delete "${post.title || "Untitled"}"? This cannot be undone.`,
    );
    if (!ok) return;
    if (timer.current) clearTimeout(timer.current);
    await deletePost(currentSlug.current);
    router.push(CRM_BASE);
  }

  async function openHistory() {
    const revs = await listRevisions(currentSlug.current);
    setRevisions(revs);
    setShowHistory(true);
  }

  async function handleRestore(revisionId: number) {
    const updated = await restoreRevision(currentSlug.current, revisionId);
    setPost((prev) => (prev ? { ...prev, ...updated } : updated));
    bodyRef.current = updated.body;
    setEditorKey((k) => k + 1);
    setShowHistory(false);
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

  function setOgImage(asset: MediaAsset | null) {
    if (!post) return;
    setPost({
      ...post,
      og_image: asset?.id ?? null,
      og_image_detail: asset ?? null,
    });
    scheduleSave({ og_image: asset?.id ?? null });
    setOgPicker(false);
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
        <Link href={CRM_BASE} className={styles.rowLink}>
          ← Posts
        </Link>
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          <span className={styles.saveState}>{saveLabel[saveState]}</span>
          <button className={styles.secondaryBtn} onClick={openHistory}>
            History
          </button>
          <button className={styles.dangerBtn} onClick={handleDelete}>
            Delete
          </button>
        </div>
      </div>

      <div className={styles.editorGrid}>
        <div className={styles.editorMain}>
          <input
            className={styles.titleInput}
            value={post.title}
            placeholder="Title"
            onChange={(e) => handleTitleChange(e.target.value)}
          />
          <div className={styles.slugRow}>
            <span>/blog/</span>
            <input
              className={styles.slugInput}
              value={post.slug}
              onChange={(e) => handleSlugChange(e.target.value)}
            />
          </div>

          <Editor
            key={editorKey}
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

            <label className={styles.label} style={{ marginTop: 4 }}>
              Schedule for
              <input
                className={styles.input}
                type="datetime-local"
                value={scheduleAt}
                onChange={(e) => setScheduleAt(e.target.value)}
              />
            </label>
            <button
              className={styles.secondaryBtn}
              onClick={handleSchedule}
              disabled={!scheduleAt}
            >
              {post.status === "scheduled" ? "Reschedule" : "Schedule"}
            </button>
            {post.status === "scheduled" && post.published_at ? (
              <p className={styles.muted}>
                Goes live {new Date(post.published_at).toLocaleString()}
              </p>
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
                  src={resolveMediaUrl(post.featured_image_detail.url) ?? ""}
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
            <span className={styles.label} style={{ marginBottom: 6 }}>
              Social share image (og:image)
            </span>
            {post.og_image_detail?.url ? (
              <div className={styles.thumbPicker} onClick={() => setOgPicker(true)}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={resolveMediaUrl(post.og_image_detail.url) ?? ""}
                  alt={post.og_image_detail.alt_text}
                />
                Change
              </div>
            ) : (
              <div className={styles.thumbPicker} onClick={() => setOgPicker(true)}>
                Choose image (falls back to featured)
              </div>
            )}
            {post.og_image ? (
              <button className={styles.secondaryBtn} onClick={() => setOgImage(null)}>
                Remove
              </button>
            ) : null}
          </div>
        </aside>
      </div>

      {featuredPicker ? (
        <MediaPicker
          onSelect={(assets) => setFeatured(assets[0] ?? null)}
          onClose={() => setFeaturedPicker(false)}
        />
      ) : null}

      {ogPicker ? (
        <MediaPicker
          onSelect={(assets) => setOgImage(assets[0] ?? null)}
          onClose={() => setOgPicker(false)}
        />
      ) : null}

      {showHistory ? (
        <div className={styles.overlay} onClick={() => setShowHistory(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.pageTitle}>Revision history</h2>
              <button
                className={styles.secondaryBtn}
                onClick={() => setShowHistory(false)}
              >
                Close
              </button>
            </div>
            {revisions.length === 0 ? (
              <p className={styles.muted}>
                No revisions yet. Snapshots are saved on publish.
              </p>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Saved</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {revisions.map((rev) => (
                    <tr key={rev.id}>
                      <td>{rev.title || "Untitled"}</td>
                      <td className={styles.muted}>
                        {new Date(rev.created_at).toLocaleString()}
                      </td>
                      <td>
                        <button
                          className={styles.secondaryBtn}
                          onClick={() => handleRestore(rev.id)}
                        >
                          Restore
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
