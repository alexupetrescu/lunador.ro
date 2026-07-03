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
            O publicație mică și lentă, ținută la lumina lămpii — despre sensul
            unei vieți și fizica cerului sub care se desfășoară.
          </p>
        </div>
        <div>
          <div className={styles.footerColTitle}>Citește</div>
          <div className={styles.footerLinks}>
            <Link href="/blog">Toate eseurile</Link>
            <Link href="/blog?category=philosophy">Filozofie</Link>
            <Link href="/blog?category=astrophysics">Astrofizică</Link>
          </div>
        </div>
        <div>
          <div className={styles.footerColTitle}>Instrumente</div>
          <div className={styles.footerLinks}>
            <Link href="/instruments">Scara Universului</Link>
            <Link href="/instruments">Viața în săptămâni</Link>
            <Link href="/instruments">Sertarul cu citate</Link>
          </div>
        </div>
        <div>
          <div className={styles.footerColTitle}>Proiectul</div>
          <div className={styles.footerLinks}>
            <a href="#">Despre paznicul farului</a>
            <a href="#">Colofon</a>
            <a href="/feed.xml">Arhiva depeșelor</a>
          </div>
        </div>
      </div>
      <div className={styles.footerBottom}>
        <span>© 2026 lunador.ro · făcut la lumina lămpii</span>
        <span>47.16°N 27.58°E · iași, românia</span>
      </div>
    </footer>
  );
}
