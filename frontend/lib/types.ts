// Tiptap / ProseMirror document shape ------------------------------------------

export interface TiptapMark {
  type: string;
  attrs?: Record<string, unknown>;
}

export interface TiptapNode {
  type: string;
  attrs?: Record<string, unknown>;
  content?: TiptapNode[];
  marks?: TiptapMark[];
  text?: string;
}

export interface TiptapDoc {
  type: "doc";
  content?: TiptapNode[];
}

// Media -------------------------------------------------------------------------

export type MediaKind = "image" | "video" | "file";

export interface MediaAsset {
  id: number;
  kind: MediaKind;
  url: string | null;
  title?: string;
  alt_text: string;
  caption: string;
  credit: string;
  width: number | null;
  height: number | null;
  blurhash: string;
  focal_x: number;
  focal_y: number;
  duration: number | null;
}

export interface MediaAssetAdmin extends MediaAsset {
  tags: MediaTag[];
  created_at: string;
}

export interface MediaTag {
  id: number;
  name: string;
  slug: string;
}

/** Map of asset id (as string) -> hydrated asset, sent alongside a post body. */
export type MediaMap = Record<string, MediaAsset>;

// Taxonomies --------------------------------------------------------------------

export interface Category {
  id: number;
  name: string;
  slug: string;
  parent: number | null;
  description: string;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
}

// Posts -------------------------------------------------------------------------

export type PostStatus = "draft" | "published" | "scheduled" | "archived";

export interface PostSeo {
  title: string;
  description: string;
  canonical_url: string;
  noindex: boolean;
}

export interface PostListItem {
  id: number;
  title: string;
  slug: string;
  status: PostStatus;
  excerpt: string;
  reading_time: number;
  published_at: string | null;
  updated_at: string;
  featured_image: MediaAsset | null;
  category: Category | null;
  tags: Tag[];
  seo: PostSeo;
}

export interface PostDetail extends PostListItem {
  body: TiptapDoc;
  body_text: string;
  schema_version: number;
  author: { id: number; name: string };
  og_image: MediaAsset | null;
  created_at: string;
  media: MediaMap;
}

// Admin authoring shape ---------------------------------------------------------

export interface PostAdmin {
  id: number;
  title: string;
  slug: string;
  status: PostStatus;
  body: TiptapDoc;
  body_text: string;
  excerpt: string;
  reading_time: number;
  schema_version: number;
  featured_image: number | null;
  featured_image_detail: MediaAsset | null;
  og_image: number | null;
  og_image_detail: MediaAsset | null;
  category: number | null;
  tags: Tag[];
  seo_title: string;
  seo_description: string;
  canonical_url: string;
  noindex: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  media: MediaMap;
}

export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface CurrentUser {
  id: number;
  username: string;
  name: string;
  email: string;
  is_staff: boolean;
}
