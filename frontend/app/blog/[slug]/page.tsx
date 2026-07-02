import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";

import BlockRenderer from "@/components/blocks/BlockRenderer";
import JsonLd from "@/components/JsonLd";
import MediaImage from "@/components/MediaImage";
import { getPost, resolveRedirect } from "@/lib/server-api";
import { absoluteUrl, siteConfig } from "@/lib/site";

import styles from "./article.module.css";

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

async function loadPost(slug: string) {
  const post = await getPost(slug);
  if (post) return post;
  // Slug may have changed — honor the 301 recorded on rename.
  const redirect = await resolveRedirect(slug);
  if (redirect) permanentRedirect(`/blog/${redirect.slug}`);
  return null;
}

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};

  const ogImage = post.og_image ?? post.featured_image;
  const canonical = post.seo.canonical_url || absoluteUrl(`/blog/${post.slug}`);

  return {
    title: post.seo.title,
    description: post.seo.description,
    alternates: { canonical },
    robots: post.seo.noindex ? { index: false, follow: false } : undefined,
    openGraph: {
      type: "article",
      title: post.seo.title,
      description: post.seo.description,
      url: canonical,
      siteName: siteConfig.name,
      publishedTime: post.published_at ?? undefined,
      modifiedTime: post.updated_at,
      authors: [post.author.name],
      images: ogImage?.url
        ? [
            {
              url: absoluteUrl(ogImage.url),
              width: ogImage.width ?? undefined,
              height: ogImage.height ?? undefined,
              alt: ogImage.alt_text,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: post.seo.title,
      description: post.seo.description,
      images: ogImage?.url ? [absoluteUrl(ogImage.url)] : undefined,
    },
  };
}

function formatDate(value: string | null): string {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const post = await loadPost(slug);
  if (!post) notFound();

  const canonical = absoluteUrl(`/blog/${post.slug}`);
  const image = post.og_image ?? post.featured_image;

  const breadcrumbs: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
      {
        "@type": "ListItem",
        position: 2,
        name: "Writing",
        item: absoluteUrl("/blog"),
      },
      ...(post.category
        ? [
            {
              "@type": "ListItem",
              position: 3,
              name: post.category.name,
              item: absoluteUrl(`/blog?category=${post.category.slug}`),
            },
          ]
        : []),
    ],
  };

  const blogPosting: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.seo.description,
    datePublished: post.published_at ?? post.created_at,
    dateModified: post.updated_at,
    author: { "@type": "Person", name: post.author.name },
    publisher: { "@type": "Organization", name: siteConfig.name },
    mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
    ...(image?.url ? { image: absoluteUrl(image.url) } : {}),
  };

  return (
    <main className={styles.page}>
      <JsonLd data={[blogPosting, breadcrumbs]} />

      <article className={styles.article}>
        <header className={styles.header}>
          <nav className={styles.crumbs} aria-label="Breadcrumb">
            <Link href="/blog">Writing</Link>
            {post.category ? (
              <>
                <span aria-hidden> · </span>
                <Link href={`/blog?category=${post.category.slug}`}>
                  {post.category.name}
                </Link>
              </>
            ) : null}
          </nav>

          <h1 className={styles.title}>{post.title}</h1>

          <div className={styles.byline}>
            <span>{post.author.name}</span>
            <span aria-hidden> · </span>
            <time dateTime={post.published_at ?? undefined}>
              {formatDate(post.published_at)}
            </time>
            {post.reading_time ? (
              <>
                <span aria-hidden> · </span>
                <span>{post.reading_time} min read</span>
              </>
            ) : null}
          </div>
        </header>

        {post.featured_image ? (
          <figure className={styles.hero}>
            <MediaImage asset={post.featured_image} priority sizes="100vw" />
            {post.featured_image.caption ? (
              <figcaption>{post.featured_image.caption}</figcaption>
            ) : null}
          </figure>
        ) : null}

        <div className={styles.body}>
          <BlockRenderer doc={post.body} media={post.media} />
        </div>

        {post.tags.length ? (
          <footer className={styles.tags}>
            {post.tags.map((tag) => (
              <Link key={tag.id} href={`/blog?tag=${tag.slug}`}>
                #{tag.name}
              </Link>
            ))}
          </footer>
        ) : null}
      </article>
    </main>
  );
}
