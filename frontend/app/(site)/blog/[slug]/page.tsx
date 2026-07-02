import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";

import BlockRenderer from "@/components/blocks/BlockRenderer";
import JsonLd from "@/components/JsonLd";
import MediaImage from "@/components/MediaImage";
import { formatPostDate } from "@/lib/format";
import { getPost, listPosts, resolveRedirect } from "@/lib/server-api";
import { absoluteUrl, siteConfig } from "@/lib/site";

import styles from "./article.module.css";

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

async function loadPost(slug: string) {
  const post = await getPost(slug);
  if (post) return post;
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

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const post = await loadPost(slug);
  if (!post) notFound();

  const canonical = absoluteUrl(`/blog/${post.slug}`);
  const image = post.og_image ?? post.featured_image;

  const relatedData = post.category
    ? await listPosts({ category: post.category.slug, page: 1 })
    : await listPosts({ page: 1 });
  const related =
    relatedData?.results.filter((p) => p.slug !== post.slug).slice(0, 3) ?? [];

  const breadcrumbs: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
      {
        "@type": "ListItem",
        position: 2,
        name: "The Field Notes",
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

  const heroCaption =
    post.featured_image?.caption ||
    (post.featured_image?.alt_text
      ? `lead plate · ${post.featured_image.alt_text}`
      : "lead plate");

  return (
    <>
      <JsonLd data={[blogPosting, breadcrumbs]} />

      <div className={styles.back}>
        <Link href="/blog" className={styles.backLink}>
          ← Back to the catalogue
        </Link>
      </div>

      <article className={styles.article}>
        <div className={styles.eyebrow}>
          {post.category ? (
            <>
              <span>{post.category.name}</span>
              <span className={styles.eyebrowDot}>·</span>
            </>
          ) : null}
          <span>The reading room</span>
        </div>

        <h1 className={styles.title}>{post.title}</h1>

        {post.excerpt ? <p className={styles.dek}>{post.excerpt}</p> : null}

        <div className={styles.byline}>
          <div className={styles.avatar} aria-hidden />
          <span className={styles.author}>By {post.author.name}</span>
          <span aria-hidden>·</span>
          <time dateTime={post.published_at ?? undefined}>
            {formatPostDate(post.published_at)}
          </time>
          {post.reading_time ? (
            <>
              <span aria-hidden>·</span>
              <span>{post.reading_time} min read</span>
            </>
          ) : null}
        </div>
      </article>

      {post.featured_image ? (
        <figure className={styles.hero}>
          <div className={styles.heroPlate}>
            <MediaImage asset={post.featured_image} priority sizes="100vw" />
            <figcaption className={styles.heroCaption}>[ {heroCaption} ]</figcaption>
          </div>
        </figure>
      ) : null}

      <div className={styles.body}>
        <BlockRenderer doc={post.body} media={post.media} />
      </div>

      {post.tags.length ? (
        <footer className={styles.tags}>
          {post.tags.map((tag) => (
            <Link
              key={tag.id}
              href={`/blog?tag=${tag.slug}`}
              className={styles.tag}
            >
              {tag.name}
            </Link>
          ))}
        </footer>
      ) : null}

      {related.length > 0 ? (
        <section className={styles.related}>
          <div className={styles.relatedEyebrow}>Keep reading by lamplight</div>
          <div className={styles.relatedGrid}>
            {related.map((item) => (
              <Link
                key={item.id}
                href={`/blog/${item.slug}`}
                className={styles.relatedCard}
              >
                <div className={styles.relatedMeta}>
                  {item.category?.name ?? "Essay"}
                </div>
                <h3 className={styles.relatedTitle}>{item.title}</h3>
                <p className={styles.relatedDek}>{item.excerpt}</p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
