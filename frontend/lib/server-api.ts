import "server-only";

import type {
  Category,
  Paginated,
  PostDetail,
  PostListItem,
  Tag,
} from "./types";

// Server components can't use relative URLs, so reach Django directly. In prod
// this is the internal service address; in dev it's the local Django server.
const INTERNAL_BASE =
  process.env.DJANGO_INTERNAL_API_URL || "http://127.0.0.1:8000";

const REVALIDATE_SECONDS = 60;

async function get<T>(
  path: string,
  init?: RequestInit & { revalidate?: number },
): Promise<T | null> {
  const { revalidate = REVALIDATE_SECONDS, ...rest } = init ?? {};
  const res = await fetch(`${INTERNAL_BASE}${path}`, {
    ...rest,
    next: { revalidate },
  });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`API ${path} failed: ${res.status}`);
  }
  return (await res.json()) as T;
}

export interface PostQuery {
  page?: number;
  category?: string;
  tag?: string;
  search?: string;
}

export async function listPosts(query: PostQuery = {}) {
  const params = new URLSearchParams();
  if (query.page) params.set("page", String(query.page));
  if (query.category) params.set("category__slug", query.category);
  if (query.tag) params.set("tags__slug", query.tag);
  if (query.search) params.set("search", query.search);
  const qs = params.toString();
  return get<Paginated<PostListItem>>(
    `/api/blog/posts/${qs ? `?${qs}` : ""}`,
  );
}

export async function getPost(slug: string) {
  return get<PostDetail>(`/api/blog/posts/${slug}/`);
}

export async function resolveRedirect(oldSlug: string) {
  return get<{ old_slug: string; slug: string }>(
    `/api/blog/redirects/${oldSlug}/`,
  );
}

export async function listCategories() {
  return get<Paginated<Category>>(`/api/blog/categories/`);
}

export async function listTags() {
  return get<Paginated<Tag>>(`/api/blog/tags/`);
}

/** All published posts for sitemap/RSS — paginates through everything. */
export async function listAllPublishedPosts(): Promise<PostListItem[]> {
  const all: PostListItem[] = [];
  let page = 1;
  for (;;) {
    const data = await listPosts({ page });
    if (!data) break;
    all.push(...data.results);
    if (!data.next) break;
    page += 1;
    if (page > 200) break; // safety bound
  }
  return all;
}
