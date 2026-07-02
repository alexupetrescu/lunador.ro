import type { Metadata } from "next";
import Link from "next/link";

import DispatchSignup from "@/components/site/DispatchSignup";
import { formatPostDateShort } from "@/lib/format";
import { listPosts } from "@/lib/server-api";
import { siteConfig } from "@/lib/site";
import type { PostListItem } from "@/lib/types";

import styles from "./home.module.css";

export const metadata: Metadata = {
  title: siteConfig.name,
  description: siteConfig.description,
};

function splitStreams(posts: PostListItem[]) {
  const philosophy = posts.filter((p) => p.category?.slug === "philosophy");
  const astro = posts.filter((p) => p.category?.slug === "astrophysics");
  if (philosophy.length || astro.length) {
    return {
      philosophy: philosophy.slice(0, 4),
      astro: astro.slice(0, 4),
    };
  }
  const mid = Math.ceil(posts.length / 2);
  return {
    philosophy: posts.slice(0, mid).slice(0, 4),
    astro: posts.slice(mid).slice(0, 4),
  };
}

function PostStream({
  title,
  posts,
  categorySlug,
}: {
  title: string;
  posts: PostListItem[];
  categorySlug?: string;
}) {
  const allHref = categorySlug ? `/blog?category=${categorySlug}` : "/blog";
  return (
    <div>
      <div className={styles.streamHeader}>
        <h3 className={styles.streamTitle}>{title}</h3>
        <Link href={allHref} className={styles.streamAll}>
          All →
        </Link>
      </div>
      {posts.length === 0 ? (
        <p className={styles.streamItemDek}>Nothing filed here yet.</p>
      ) : (
        posts.map((post) => (
          <Link
            key={post.id}
            href={`/blog/${post.slug}`}
            className={styles.streamItem}
          >
            <div className={styles.streamCat}>
              {post.category?.name?.slice(0, 3) ?? "—"}
            </div>
            <div>
              <h4 className={styles.streamItemTitle}>{post.title}</h4>
              <p className={styles.streamItemDek}>{post.excerpt}</p>
              <div className={styles.streamItemMeta}>
                {formatPostDateShort(post.published_at)}
                {post.reading_time ? ` · ${post.reading_time} min read` : ""}
              </div>
            </div>
          </Link>
        ))
      )}
    </div>
  );
}

export default async function HomePage() {
  const data = await listPosts({ page: 1 });
  const posts = data?.results ?? [];
  const featured = posts[0] ?? null;
  const { philosophy, astro } = splitStreams(
    featured ? posts.slice(1) : posts,
  );

  return (
    <main className={styles.home}>
      <section className={styles.hero}>
        <div>
          <div className={styles.eyebrow}>
            Est. 2026 · A lighthouse for the late-night mind
          </div>
          <h1 className={styles.heroTitle}>
            For anyone still awake,
            <br />
            <em>still wondering.</em>
          </h1>
          <p className={styles.heroLede}>
            Slow essays on the meaning of a life — and the physics of the sky it
            happens under. Written for the rare reader who would rather stay a
            while than scroll.
          </p>
          <div className={styles.heroActions}>
            <Link href="/blog" className={styles.btnPrimary}>
              Start reading
            </Link>
            <Link href="/instruments" className={styles.btnSecondary}>
              Open the instruments →
            </Link>
          </div>
        </div>
        <div className={styles.heroOrbital}>
          <svg viewBox="0 0 420 420" style={{ width: "100%", height: "auto" }}>
            <circle cx="210" cy="210" r="62" fill="none" stroke="#d9cfba" />
            <circle
              cx="210"
              cy="210"
              r="118"
              fill="none"
              stroke="#d9cfba"
              strokeDasharray="2 5"
            />
            <circle cx="210" cy="210" r="176" fill="none" stroke="#d9cfba" />
            <circle cx="210" cy="210" r="12" fill="#9c7a3f" />
            <circle cx="272" cy="210" r="4.5" fill="#2a2520" />
            <circle cx="135" cy="265" r="6" fill="#3c4a63" />
            <circle cx="338" cy="150" r="3.5" fill="#7c5e2c" />
            <circle
              cx="86"
              cy="120"
              r="1.6"
              fill="#2a2520"
              style={{ animation: "tw 4s infinite" }}
            />
            <circle
              cx="350"
              cy="300"
              r="1.6"
              fill="#2a2520"
              style={{ animation: "tw 5.5s infinite 0.5s" }}
            />
            <circle
              cx="320"
              cy="70"
              r="1.3"
              fill="#2a2520"
              style={{ animation: "tw 3.5s infinite 1s" }}
            />
            <circle
              cx="60"
              cy="330"
              r="1.3"
              fill="#2a2520"
              style={{ animation: "tw 4.5s infinite 0.8s" }}
            />
            <circle
              cx="380"
              cy="220"
              r="1.2"
              fill="#2a2520"
              style={{ animation: "tw 6s infinite" }}
            />
          </svg>
          <div className={styles.orbitalCaption}>Plate I · the small companion</div>
        </div>
      </section>

      <div className={styles.ticker}>
        <div className={styles.tickerInner}>
          <span className={styles.tickerAccent}>Now tracking</span>
          <span>Lat 47.16°N · Lon 27.58°E</span>
          <span>Moon · waxing gibbous</span>
          <span>Mercury · evening sky</span>
          <span>Local time to next dark · 03h 41m</span>
        </div>
      </div>

      {featured ? (
        <section className={styles.featured}>
          <Link href={`/blog/${featured.slug}`} className={styles.featuredLink}>
            <div className={styles.featuredPlate}>
              <div className={styles.fieldNote}>
                FIELD
                <br />
                NOTE
              </div>
              {featured.featured_image?.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={featured.featured_image.url}
                  alt={featured.featured_image.alt_text || featured.title}
                />
              ) : null}
              <div className={styles.featuredPlateLabel}>
                [ celestial plate · long exposure ]
              </div>
            </div>
            <div className={styles.featuredBody}>
              <div className={styles.featuredMeta}>
                {featured.category?.name ?? "Essay"} · This week&apos;s dispatch
              </div>
              <h2 className={styles.featuredTitle}>{featured.title}</h2>
              <p className={styles.featuredDek}>{featured.excerpt}</p>
              <div className={styles.featuredByline}>
                <span>{formatPostDateShort(featured.published_at)}</span>
                {featured.reading_time ? (
                  <>
                    <span>·</span>
                    <span>{featured.reading_time} min read</span>
                  </>
                ) : null}
              </div>
            </div>
          </Link>
        </section>
      ) : (
        <p className={styles.emptyFeatured}>
          The lamp is lit — essays will appear here soon.
        </p>
      )}

      <section className={styles.streams}>
        <PostStream
          title="From the philosophy desk"
          posts={philosophy}
          categorySlug="philosophy"
        />
        <PostStream
          title="From the observatory"
          posts={astro}
          categorySlug="astrophysics"
        />
      </section>

      <section className={styles.instruments}>
        <div className={styles.instrumentsInner}>
          <div className={styles.instrumentsHeader}>
            <div>
              <div className={styles.instrumentsEyebrow}>The instrument cabinet</div>
              <h2 className={styles.instrumentsTitle}>
                Small machines for looking up, and looking inward.
              </h2>
            </div>
            <Link href="/instruments" className={styles.instrumentsAll}>
              Open all →
            </Link>
          </div>
          <div className={styles.instrumentsGrid}>
            <Link href="/instruments" className={styles.instrumentCard}>
              <div className={styles.instrumentNum}>Instrument 01</div>
              <div>
                <h4 className={styles.instrumentName}>Scale of the Universe</h4>
                <p className={styles.instrumentDesc}>
                  Slide from a proton to the edge of everything, one power of ten
                  at a time.
                </p>
              </div>
            </Link>
            <Link href="/instruments" className={styles.instrumentCard}>
              <div className={styles.instrumentNum}>Instrument 02</div>
              <div>
                <h4 className={styles.instrumentName}>Life in Weeks</h4>
                <p className={styles.instrumentDesc}>
                  Your whole life, drawn as a grid of small squares. A gentle
                  memento mori.
                </p>
              </div>
            </Link>
            <Link href="/instruments" className={styles.instrumentCard}>
              <div className={styles.instrumentNum}>Instrument 03</div>
              <div>
                <h4 className={styles.instrumentName}>The Quote Drawer</h4>
                <p className={styles.instrumentDesc}>
                  Pull the drawer. File another. A small ritual of borrowed
                  steadiness.
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      <section className={styles.quote}>
        <div className={styles.quoteEyebrow}>— from the keeper of the light —</div>
        <p className={styles.quoteText}>
          This is not a place to be convinced of anything. It is a place to find
          that a thought you suspected you were carrying alone has, in fact, kept
          other people company for centuries — under the very same stars.
        </p>
      </section>

      <section id="dispatch" className={styles.dispatch}>
        <div className={styles.dispatchInner}>
          <h3 className={styles.dispatchTitle}>The fortnightly dispatch</h3>
          <p className={styles.dispatchLede}>
            One essay and one instrument, every other Sunday. No noise, no
            tracking, no urgency. Unsubscribe whenever the night gets quiet
            enough.
          </p>
          <DispatchSignup />
        </div>
      </section>
    </main>
  );
}
