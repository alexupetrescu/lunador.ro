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
          Eseuri
        </Link>
        <Link href="/instruments" className={styles.navLink}>
          Instrumente
        </Link>
        <Link href={readingRoomHref} className={styles.navLink}>
          Sala de lectură
        </Link>
        <a href="#dispatch" className={`${styles.navLink} ${styles.navAccent}`}>
          Abonează-te →
        </a>
      </nav>
    </header>
  );
}
