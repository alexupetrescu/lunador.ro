import Link from "next/link";

import Logo from "./Logo";
import styles from "./site.module.css";

export default function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <div>
          <div style={{ marginBottom: 18 }}>
            <Logo size="sm" dark href="/" />
          </div>
          <p className={styles.footerBlurb}>
            A small, slow publication kept by lamplight — for the meaning of a
            life and the physics of the sky it happens under.
          </p>
        </div>
        <div>
          <div className={styles.footerColTitle}>Read</div>
          <div className={styles.footerLinks}>
            <Link href="/blog">All essays</Link>
            <Link href="/blog?category=philosophy">Philosophy</Link>
            <Link href="/blog?category=astrophysics">Astrophysics</Link>
          </div>
        </div>
        <div>
          <div className={styles.footerColTitle}>Instruments</div>
          <div className={styles.footerLinks}>
            <Link href="/instruments">Scale of the Universe</Link>
            <Link href="/instruments">Life in Weeks</Link>
            <Link href="/instruments">The Quote Drawer</Link>
          </div>
        </div>
        <div>
          <div className={styles.footerColTitle}>The Project</div>
          <div className={styles.footerLinks}>
            <a href="#">About the keeper</a>
            <a href="#">Colophon</a>
            <a href="/feed.xml">Dispatch archive</a>
          </div>
        </div>
      </div>
      <div className={styles.footerBottom}>
        <span>© 2026 lunador.ro · made by lamplight</span>
        <span>47.16°N 27.58°E · iași, romania</span>
      </div>
    </footer>
  );
}
