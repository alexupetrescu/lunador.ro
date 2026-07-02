import type { Metadata } from "next";
import Link from "next/link";

import MediaImage from "@/components/MediaImage";
import { listPosts } from "@/lib/server-api";
import { siteConfig } from "@/lib/site";

import styles from "./blog.module.css";

export const metadata: Metadata = {
  title: `Writing — ${siteConfig.name}`,
  description: siteConfig.description,
  alternates: {
    canonical: "/blog",
    types: { "application/rss+xml": "/feed.xml" },
  },
};

function formatDate(value: string | null): string {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

interface BlogPageProps {
  searchParams: Promise<{ page?: string; category?: string; tag?: string }>;
}

export default async function BlogIndexPage({ searchParams }: BlogPageProps) {
  const params = await searchParams;
  const page = params.page ? Number(params.page) : 1;
  const data = await listPosts({
    page,
    category: params.category,
    tag: params.tag,
  });

  const posts = data?.results ?? [];

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>{siteConfig.name}</p>
        <h1 className={styles.title}>Writing</h1>
        <p className={styles.lede}>{siteConfig.description}</p>
      </header>

      {posts.length === 0 ? (
        <p className={styles.empty}>Nothing published yet — check back soon.</p>
      ) : (
        <ul className={styles.list}>
          {posts.map((post) => (
            <li key={post.id} className={styles.card}>
              <Link href={`/blog/${post.slug}`} className={styles.cardLink}>
                {post.featured_image ? (
                  <div className={styles.thumb}>
                    <MediaImage
                      asset={post.featured_image}
                      sizes="(max-width: 768px) 100vw, 320px"
                    />
                  </div>
                ) : null}
                <div className={styles.cardBody}>
                  {post.category ? (
                    <span className={styles.category}>{post.category.name}</span>
                  ) : null}
                  <h2 className={styles.cardTitle}>{post.title}</h2>
                  <p className={styles.excerpt}>{post.excerpt}</p>
                  <div className={styles.meta}>
                    <time dateTime={post.published_at ?? undefined}>
                      {formatDate(post.published_at)}
                    </time>
                    {post.reading_time ? (
                      <span>· {post.reading_time} min read</span>
                    ) : null}
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {data && (data.previous || data.next) ? (
        <nav className={styles.pager} aria-label="Pagination">
          {data.previous ? (
            <Link href={`/blog?page=${page - 1}`}>← Newer</Link>
          ) : (
            <span />
          )}
          {data.next ? <Link href={`/blog?page=${page + 1}`}>Older →</Link> : <span />}
        </nav>
      ) : null}
    </main>
  );
}
