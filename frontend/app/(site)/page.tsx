import type { Metadata } from "next";
import Link from "next/link";

import DispatchSignup from "@/components/site/DispatchSignup";
import { formatPostDateShort } from "@/lib/format";
import { resolveMediaUrl } from "@/lib/media-url";
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
          Toate →
        </Link>
      </div>
      {posts.length === 0 ? (
        <p className={styles.streamItemDek}>Nimic arhivat aici deocamdată.</p>
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
                {post.reading_time ? ` · ${post.reading_time} min de citit` : ""}
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
            Fondat 2026 · Un far pentru mintea de noapte târzie
          </div>
          <h1 className={styles.heroTitle}>
            Pentru oricine e încă treaz,
            <br />
            <em>încă întrebându-se.</em>
          </h1>
          <p className={styles.heroLede}>
            Eseuri lente despre sensul unei vieți — și fizica cerului sub care
            se desfășoară. Scrise pentru cititorul rar care preferă să zăbovească
            în loc să deruleze.
          </p>
          <div className={styles.heroActions}>
            <Link href="/blog" className={styles.btnPrimary}>
              Începe să citești
            </Link>
            <Link href="/instruments" className={styles.btnSecondary}>
              Deschide instrumentele →
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
          <div className={styles.orbitalCaption}>Placa I · micul însoțitor</div>
        </div>
      </section>

      <div className={styles.ticker}>
        <div className={styles.tickerInner}>
          <span className={styles.tickerAccent}>Urmărim acum</span>
          <span>Lat 47.16°N · Lon 27.58°E</span>
          <span>Luna · gibboasă crescătoare</span>
          <span>Mercur · cerul de seară</span>
          <span>Timp local până la următorul întuneric · 03h 41m</span>
        </div>
      </div>

      {featured ? (
        <section className={styles.featured}>
          <Link href={`/blog/${featured.slug}`} className={styles.featuredLink}>
            <div className={styles.featuredPlate}>
              <div className={styles.fieldNote}>
                NOTĂ
                <br />
                DE TEREN
              </div>
              {featured.featured_image?.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={resolveMediaUrl(featured.featured_image.url) ?? ""}
                  alt={featured.featured_image.alt_text || featured.title}
                />
              ) : null}
              <div className={styles.featuredPlateLabel}>
                [ placă celestă · expunere lungă ]
              </div>
            </div>
            <div className={styles.featuredBody}>
              <div className={styles.featuredMeta}>
                {featured.category?.name ?? "Eseu"} · Depeșa săptămânii
              </div>
              <h2 className={styles.featuredTitle}>{featured.title}</h2>
              <p className={styles.featuredDek}>{featured.excerpt}</p>
              <div className={styles.featuredByline}>
                <span>{formatPostDateShort(featured.published_at)}</span>
                {featured.reading_time ? (
                  <>
                    <span>·</span>
                    <span>{featured.reading_time} min de citit</span>
                  </>
                ) : null}
              </div>
            </div>
          </Link>
        </section>
      ) : (
        <p className={styles.emptyFeatured}>
          Lampa e aprinsă — eseurile vor apărea aici în curând.
        </p>
      )}

      <section className={styles.streams}>
        <PostStream
          title="De la biroul de filozofie"
          posts={philosophy}
          categorySlug="philosophy"
        />
        <PostStream
          title="De la observator"
          posts={astro}
          categorySlug="astrophysics"
        />
      </section>

      <section className={styles.instruments}>
        <div className={styles.instrumentsInner}>
          <div className={styles.instrumentsHeader}>
            <div>
              <div className={styles.instrumentsEyebrow}>Cabinetul de instrumente</div>
              <h2 className={styles.instrumentsTitle}>
                Mașinării mici pentru a privi în sus și a privi înăuntru.
              </h2>
            </div>
            <Link href="/instruments" className={styles.instrumentsAll}>
              Deschide-le pe toate →
            </Link>
          </div>
          <div className={styles.instrumentsGrid}>
            <Link href="/instruments" className={styles.instrumentCard}>
              <div className={styles.instrumentNum}>Instrumentul 01</div>
              <div>
                <h4 className={styles.instrumentName}>Scara Universului</h4>
                <p className={styles.instrumentDesc}>
                  Glisează de la un proton până la marginea a tot ce există,
                  câte o putere a lui zece pe rând.
                </p>
              </div>
            </Link>
            <Link href="/instruments" className={styles.instrumentCard}>
              <div className={styles.instrumentNum}>Instrumentul 02</div>
              <div>
                <h4 className={styles.instrumentName}>Viața în săptămâni</h4>
                <p className={styles.instrumentDesc}>
                  Întreaga ta viață, desenată ca o grilă de pătrățele. Un
                  memento mori blând.
                </p>
              </div>
            </Link>
            <Link href="/instruments" className={styles.instrumentCard}>
              <div className={styles.instrumentNum}>Instrumentul 03</div>
              <div>
                <h4 className={styles.instrumentName}>Sertarul cu citate</h4>
                <p className={styles.instrumentDesc}>
                  Trage sertarul. Arhivează încă unul. Un mic ritual de
                  statornicie împrumutată.
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      <section className={styles.quote}>
        <div className={styles.quoteEyebrow}>— de la paznicul farului —</div>
        <p className={styles.quoteText}>
          Acesta nu este un loc în care să fii convins de ceva. Este un loc în
          care descoperi că un gând pe care credeai că îl porți singur a ținut,
          de fapt, companie altor oameni timp de secole — sub exact aceleași
          stele.
        </p>
      </section>

      <section id="dispatch" className={styles.dispatch}>
        <div className={styles.dispatchInner}>
          <h3 className={styles.dispatchTitle}>Depeșa bilunară</h3>
          <p className={styles.dispatchLede}>
            Un eseu și un instrument, din două în două duminici. Fără zgomot,
            fără urmărire, fără grabă. Dezabonează-te oricând noaptea devine
            destul de liniștită.
          </p>
          <DispatchSignup />
        </div>
      </section>
    </main>
  );
}
