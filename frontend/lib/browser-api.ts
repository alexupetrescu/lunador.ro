"use client";

import type {
  Category,
  CurrentUser,
  MediaAssetAdmin,
  MediaTag,
  Paginated,
  PostAdmin,
  PostRevision,
  Tag,
} from "./types";

function getCookie(name: string): string | null {
  const match = document.cookie.match(
    new RegExp("(?:^|; )" + name + "=([^;]*)"),
  );
  return match ? decodeURIComponent(match[1]) : null;
}

export class ApiError extends Error {
  status: number;
  data: unknown;
  constructor(status: number, data: unknown) {
    super(`Request failed with status ${status}`);
    this.status = status;
    this.data = data;
  }
}

export function formatApiError(error: unknown): string {
  if (error instanceof ApiError) {
    const data = error.data;
    if (typeof data === "object" && data !== null) {
      const parts: string[] = [];
      for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
        const msg = Array.isArray(value) ? value.join(" ") : String(value);
        parts.push(key === "detail" ? msg : `${key}: ${msg}`);
      }
      if (parts.length) return parts.join(" · ");
    }
    if (typeof data === "string" && data) return data;
    return `Request failed (${error.status})`;
  }
  if (error instanceof Error) return error.message;
  return "Something went wrong.";
}

type Json = Record<string, unknown> | unknown[];

async function request<T>(
  path: string,
  options: {
    method?: string;
    json?: Json;
    body?: BodyInit;
    headers?: Record<string, string>;
  } = {},
): Promise<T> {
  const { method = "GET", json, body, headers = {} } = options;
  const finalHeaders: Record<string, string> = { ...headers };

  if (method !== "GET" && method !== "HEAD") {
    const token = getCookie("csrftoken");
    if (token) finalHeaders["X-CSRFToken"] = token;
  }

  let finalBody: BodyInit | undefined = body;
  if (json !== undefined) {
    finalHeaders["Content-Type"] = "application/json";
    finalBody = JSON.stringify(json);
  }

  const res = await fetch(`/api${path}`, {
    method,
    headers: finalHeaders,
    body: finalBody,
    credentials: "include",
  });

  if (res.status === 204) return undefined as T;

  const contentType = res.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? await res.json()
    : await res.text();

  if (!res.ok) throw new ApiError(res.status, payload);
  return payload as T;
}

// Auth --------------------------------------------------------------------------

export async function ensureCsrf() {
  await request("/auth/csrf/");
}

export async function login(username: string, password: string) {
  return request<CurrentUser>("/auth/login/", {
    method: "POST",
    json: { username, password },
  });
}

export async function logout() {
  await request("/auth/logout/", { method: "POST" });
}

export async function fetchMe() {
  return request<CurrentUser>("/auth/me/");
}

// Posts -------------------------------------------------------------------------

export async function listAdminPosts(params: Record<string, string> = {}) {
  const qs = new URLSearchParams(params).toString();
  return request<Paginated<PostAdmin>>(
    `/blog/admin/posts/${qs ? `?${qs}` : ""}`,
  );
}

export async function getAdminPost(slug: string) {
  return request<PostAdmin>(`/blog/admin/posts/${slug}/`);
}

export async function createPost(data: Partial<PostAdmin>) {
  return request<PostAdmin>("/blog/admin/posts/", { method: "POST", json: data });
}

export async function updatePost(slug: string, data: Partial<PostAdmin>) {
  return request<PostAdmin>(`/blog/admin/posts/${slug}/`, {
    method: "PATCH",
    json: data,
  });
}

export async function deletePost(slug: string) {
  await request(`/blog/admin/posts/${slug}/`, { method: "DELETE" });
}

export async function publishPost(slug: string) {
  return request<PostAdmin>(`/blog/admin/posts/${slug}/publish/`, {
    method: "POST",
  });
}

export async function unpublishPost(slug: string) {
  return request<PostAdmin>(`/blog/admin/posts/${slug}/unpublish/`, {
    method: "POST",
  });
}

export async function schedulePost(slug: string, publishedAt: string) {
  return request<PostAdmin>(`/blog/admin/posts/${slug}/schedule/`, {
    method: "POST",
    json: { published_at: publishedAt },
  });
}

export async function listRevisions(slug: string) {
  return request<PostRevision[]>(`/blog/admin/posts/${slug}/revisions/`);
}

export async function restoreRevision(slug: string, revisionId: number) {
  return request<PostAdmin>(
    `/blog/admin/posts/${slug}/revisions/${revisionId}/restore/`,
    { method: "POST" },
  );
}

// Media -------------------------------------------------------------------------

export async function listMedia(params: Record<string, string> = {}) {
  const qs = new URLSearchParams(params).toString();
  return request<Paginated<MediaAssetAdmin>>(
    `/media/assets/${qs ? `?${qs}` : ""}`,
  );
}

export async function getMediaAsset(id: number) {
  return request<MediaAssetAdmin>(`/media/assets/${id}/`);
}

export async function uploadMedia(file: File, fields: Record<string, string> = {}) {
  await ensureCsrf();
  const form = new FormData();
  form.append("file", file);
  for (const [key, value] of Object.entries(fields)) form.append(key, value);
  return request<MediaAssetAdmin>("/media/assets/", {
    method: "POST",
    body: form,
  });
}

export async function updateMedia(
  id: number,
  data: Partial<MediaAssetAdmin> & { tag_ids?: number[] },
) {
  return request<MediaAssetAdmin>(`/media/assets/${id}/`, {
    method: "PATCH",
    json: data as Json,
  });
}

export async function listMediaTags() {
  return request<Paginated<MediaTag>>(`/media/tags/`);
}

export async function deleteMedia(id: number) {
  await request(`/media/assets/${id}/`, { method: "DELETE" });
}

// Taxonomies --------------------------------------------------------------------

export async function listTags() {
  return request<Paginated<Tag>>(`/blog/tags/`);
}

export async function listCategories() {
  return request<Paginated<Category>>(`/blog/categories/`);
}

export async function createCategory(data: Partial<Category>) {
  return request<Category>(`/blog/admin/categories/`, {
    method: "POST",
    json: data as Json,
  });
}

export async function updateCategory(slug: string, data: Partial<Category>) {
  return request<Category>(`/blog/admin/categories/${slug}/`, {
    method: "PATCH",
    json: data as Json,
  });
}

export async function deleteCategory(slug: string) {
  await request(`/blog/admin/categories/${slug}/`, { method: "DELETE" });
}

export async function createTag(data: Partial<Tag>) {
  return request<Tag>(`/blog/admin/tags/`, { method: "POST", json: data as Json });
}

export async function updateTag(slug: string, data: Partial<Tag>) {
  return request<Tag>(`/blog/admin/tags/${slug}/`, {
    method: "PATCH",
    json: data as Json,
  });
}

export async function deleteTag(slug: string) {
  await request(`/blog/admin/tags/${slug}/`, { method: "DELETE" });
}
