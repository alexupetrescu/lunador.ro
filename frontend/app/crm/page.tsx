"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { createPost, listAdminPosts } from "@/lib/browser-api";
import { crmPath } from "@/lib/crm";
import type { PostAdmin } from "@/lib/types";

import styles from "./crm.module.css";

const STATUS_CLASS: Record<string, string> = {
  draft: styles.badgeDraft,
  published: styles.badgePublished,
  scheduled: styles.badgeScheduled,
  archived: styles.badgeArchived,
};

function emptyDoc() {
  return { type: "doc" as const, content: [{ type: "paragraph" }] };
}

export default function CrmPostsPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<PostAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await listAdminPosts({ ordering: "-updated_at" });
      setPosts(data.results);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleCreate() {
    setCreating(true);
    try {
      const slug = `untitled-${Date.now().toString(36)}`;
      const post = await createPost({
        title: "Untitled",
        slug,
        body: emptyDoc(),
        status: "draft",
      });
      router.push(crmPath(`/posts/${post.slug}`));
    } finally {
      setCreating(false);
    }
  }

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Posts</h1>
        <button
          className={styles.primaryBtn}
          onClick={handleCreate}
          disabled={creating}
        >
          {creating ? "Creating…" : "New post"}
        </button>
      </div>

      {loading ? (
        <p className={styles.muted}>Loading…</p>
      ) : posts.length === 0 ? (
        <p className={styles.muted}>No posts yet. Create your first one.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Title</th>
              <th>Status</th>
              <th>Category</th>
              <th>Updated</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id}>
                <td>
                  <Link
                    href={crmPath(`/posts/${post.slug}`)}
                    className={styles.rowLink}
                  >
                    {post.title || "Untitled"}
                  </Link>
                </td>
                <td>
                  <span className={`${styles.badge} ${STATUS_CLASS[post.status]}`}>
                    {post.status}
                  </span>
                </td>
                <td className={styles.muted}>
                  {post.category ? post.category : "—"}
                </td>
                <td className={styles.muted}>
                  {new Date(post.updated_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
