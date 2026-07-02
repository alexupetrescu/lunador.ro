import Link from "next/link";

import Logo from "./Logo";
import styles from "./site.module.css";

interface SiteHeaderProps {
  readingRoomHref?: string;
}

export default function SiteHeader({
  readingRoomHref = "/blog",
}: SiteHeaderProps) {
  return (
    <header className={styles.header}>
      <Logo showTagline />
      <nav className={styles.nav} aria-label="Main">
        <Link href="/blog" className={styles.navLink}>
          Essays
        </Link>
        <Link href="/instruments" className={styles.navLink}>
          Instruments
        </Link>
        <Link href={readingRoomHref} className={styles.navLink}>
          Reading Room
        </Link>
        <a href="#dispatch" className={`${styles.navLink} ${styles.navAccent}`}>
          Subscribe →
        </a>
      </nav>
    </header>
  );
}
