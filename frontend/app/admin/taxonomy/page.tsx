"use client";

import { useCallback, useEffect, useState } from "react";

import {
  createCategory,
  createTag,
  deleteCategory,
  deleteTag,
  listCategories,
  listTags,
} from "@/lib/browser-api";
import type { Category, Tag } from "@/lib/types";

import styles from "../admin.module.css";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function TaxonomyPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);

  const [catName, setCatName] = useState("");
  const [catParent, setCatParent] = useState<string>("");
  const [tagName, setTagName] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [cats, tgs] = await Promise.all([listCategories(), listTags()]);
      setCategories(cats.results);
      setTags(tgs.results);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function addCategory() {
    if (!catName.trim()) return;
    await createCategory({
      name: catName.trim(),
      slug: slugify(catName),
      parent: catParent ? Number(catParent) : null,
    });
    setCatName("");
    setCatParent("");
    load();
  }

  async function removeCategory(cat: Category) {
    if (!confirm(`Delete category “${cat.name}”?`)) return;
    await deleteCategory(cat.slug);
    load();
  }

  async function addTag() {
    if (!tagName.trim()) return;
    await createTag({ name: tagName.trim(), slug: slugify(tagName) });
    setTagName("");
    load();
  }

  async function removeTag(tag: Tag) {
    if (!confirm(`Delete tag “${tag.name}”?`)) return;
    await deleteTag(tag.slug);
    load();
  }

  const categoryName = (id: number | null) =>
    id ? categories.find((c) => c.id === id)?.name ?? "—" : "—";

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Taxonomy</h1>
      </div>

      <div className={styles.editorGrid}>
        <div className={styles.editorMain}>
          <div className={styles.panelCard}>
            <p className={styles.panelTitle}>Categories</p>
            <div className={styles.toolbar}>
              <input
                className={styles.input}
                placeholder="New category name"
                value={catName}
                onChange={(e) => setCatName(e.target.value)}
                style={{ maxWidth: 220 }}
              />
              <select
                className={styles.select}
                value={catParent}
                onChange={(e) => setCatParent(e.target.value)}
                style={{ maxWidth: 200 }}
              >
                <option value="">No parent</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <button className={styles.primaryBtn} onClick={addCategory}>
                Add
              </button>
            </div>

            {loading ? (
              <p className={styles.muted}>Loading…</p>
            ) : categories.length === 0 ? (
              <p className={styles.muted}>No categories yet.</p>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Slug</th>
                    <th>Parent</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {categories.map((cat) => (
                    <tr key={cat.id}>
                      <td>{cat.name}</td>
                      <td className={styles.muted}>{cat.slug}</td>
                      <td className={styles.muted}>{categoryName(cat.parent)}</td>
                      <td>
                        <button
                          className={styles.dangerBtn}
                          onClick={() => removeCategory(cat)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <aside className={styles.sidePanel}>
          <div className={styles.panelCard}>
            <p className={styles.panelTitle}>Tags</p>
            <div className={styles.toolbar}>
              <input
                className={styles.input}
                placeholder="New tag name"
                value={tagName}
                onChange={(e) => setTagName(e.target.value)}
              />
              <button className={styles.primaryBtn} onClick={addTag}>
                Add
              </button>
            </div>
            {tags.length === 0 ? (
              <p className={styles.muted}>No tags yet.</p>
            ) : (
              <div className={styles.tagChips}>
                {tags.map((tag) => (
                  <span key={tag.id} className={styles.tagChip}>
                    {tag.name}
                    <button
                      onClick={() => removeTag(tag)}
                      style={{
                        marginLeft: 8,
                        border: "none",
                        background: "none",
                        cursor: "pointer",
                        color: "inherit",
                      }}
                      aria-label={`Delete ${tag.name}`}
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
