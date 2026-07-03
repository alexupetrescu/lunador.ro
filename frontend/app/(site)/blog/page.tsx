import type { Metadata } from "next";
import Link from "next/link";

import { formatPostDateShort } from "@/lib/format";
import { listPosts } from "@/lib/server-api";
import { siteConfig } from "@/lib/site";

import styles from "./blog.module.css";

export const metadata: Metadata = {
  title: `Notele de teren — ${siteConfig.name}`,
  description: siteConfig.description,
  alternates: {
    canonical: "/blog",
    types: { "application/rss+xml": "/feed.xml" },
  },
};

const TABS = [
  { label: "Toate", slug: "" },
  { label: "Filozofie", slug: "philosophy" },
  { label: "Astrofizică", slug: "astrophysics" },
] as const;

function pageHref(
  page: number,
  params: { category?: string; tag?: string; search?: string },
): string {
  const qs = new URLSearchParams();
  if (page > 1) qs.set("page", String(page));
  if (params.category) qs.set("category", params.category);
  if (params.tag) qs.set("tag", params.tag);
  if (params.search) qs.set("search", params.search);
  const s = qs.toString();
  return `/blog${s ? `?${s}` : ""}`;
}

function tabHref(slug: string, search?: string): string {
  const qs = new URLSearchParams();
  if (slug) qs.set("category", slug);
  if (search) qs.set("search", search);
  const s = qs.toString();
  return `/blog${s ? `?${s}` : ""}`;
}

interface BlogPageProps {
  searchParams: Promise<{
    page?: string;
    category?: string;
    tag?: string;
    search?: string;
  }>;
}

export default async function BlogIndexPage({ searchParams }: BlogPageProps) {
  const params = await searchParams;
  const page = params.page ? Number(params.page) : 1;
  const search = params.search?.trim() || undefined;
  const category = params.category || "";
  const data = await listPosts({
    page,
    category: params.category,
    tag: params.tag,
    search,
  });

  const posts = data?.results ?? [];
  const count = data?.count ?? posts.length;

  return (
    <main className={styles.page}>
      <div className={styles.eyebrow}>
        Catalogul · {count} {count === 1 ? "însemnare" : "însemnări"} la dosar
      </div>
      <h1 className={styles.title}>Notele de teren</h1>
      <p className={styles.lede}>
        Tot ce am consemnat până acum, păstrat ca registrul de plăci al unui
        observator vechi — două fire lungi, unul privind în afară, unul privind
        înăuntru.
      </p>

      <form className={styles.searchForm} action="/blog" method="get">
        {category ? <input type="hidden" name="category" value={category} /> : null}
        <input
          className={styles.searchInput}
          type="search"
          name="search"
          placeholder="Caută în registru…"
          defaultValue={search ?? ""}
          aria-label="Caută articole"
        />
      </form>

      {search ? (
        <p className={styles.searchNote}>
          {posts.length
            ? `Rezultate pentru „${search}”`
            : `Niciun rezultat pentru „${search}”.`}{" "}
          <Link href={tabHref(category, undefined)}>Șterge</Link>
        </p>
      ) : null}

      <div className={styles.tabs} role="tablist" aria-label="Filtrează după categorie">
        {TABS.map((tab) => {
          const active = tab.slug === category;
          return (
            <Link
              key={tab.label}
              href={tabHref(tab.slug, search)}
              className={`${styles.tab} ${active ? styles.tabActive : ""}`}
              role="tab"
              aria-selected={active}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {posts.length === 0 ? (
        search || category ? null : (
          <p className={styles.empty}>Nimic publicat încă — revino curând.</p>
        )
      ) : (
        posts.map((post) => (
          <Link key={post.id} href={`/blog/${post.slug}`} className={styles.row}>
            <div className={styles.rowCat}>
              {post.category?.name?.slice(0, 12) ?? "Eseu"}
            </div>
            <div>
              <h3 className={styles.rowTitle}>{post.title}</h3>
              <p className={styles.rowDek}>{post.excerpt}</p>
            </div>
            <div className={styles.rowMeta}>
              <div className={styles.rowMetaStream}>
                {post.category?.name ?? "Eseu"}
              </div>
              <div>{formatPostDateShort(post.published_at)}</div>
              {post.reading_time ? (
                <div>{post.reading_time} min de citit</div>
              ) : null}
            </div>
          </Link>
        ))
      )}

      {data && (data.previous || data.next) ? (
        <nav className={styles.pager} aria-label="Paginare">
          {data.previous ? (
            <Link href={pageHref(page - 1, params)}>← Mai noi</Link>
          ) : (
            <span />
          )}
          {data.next ? (
            <Link href={pageHref(page + 1, params)}>Mai vechi →</Link>
          ) : (
            <span />
          )}
        </nav>
      ) : (
        posts.length > 0 && (
          <div className={styles.endNote}>
            — sfârșitul registrului · plăcile continuă din două în două duminici —
          </div>
        )
      )}
    </main>
  );
}
