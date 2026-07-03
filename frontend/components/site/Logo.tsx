import Link from "next/link";

import styles from "./site.module.css";

interface LogoProps {
  size?: "sm" | "md";
  showTagline?: boolean;
  dark?: boolean;
  href?: string;
}

export default function Logo({
  size = "md",
  showTagline = false,
  dark = false,
  href = "/",
}: LogoProps) {
  const iconSize = size === "sm" ? 34 : 40;
  const mark = (
    <>
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 40 40"
        className={styles.logoIcon}
        aria-hidden
      >
        <circle
          cx="20"
          cy="20"
          r="18.5"
          fill="none"
          stroke={dark ? "#c69a52" : "#9c7a3f"}
          strokeWidth="1"
        />
        <circle
          cx="20"
          cy="20"
          r="13"
          fill="none"
          stroke={dark ? "#8a8073" : "#c8b894"}
          strokeWidth="1"
          strokeDasharray="2 3"
        />
        <circle cx="20" cy="20" r="3.4" fill={dark ? "#c69a52" : "#9c7a3f"} />
        <circle cx="33" cy="20" r="2.1" fill={dark ? "#e9e2d2" : "#2a2520"} />
      </svg>
      <div className={styles.logoText}>
        <div className={`${styles.wordmark} ${dark ? styles.wordmarkDark : ""}`}>
          lunador<span className={styles.dotRo}>.ro</span>
        </div>
        {showTagline ? (
          <div className={`${styles.tagline} ${dark ? styles.taglineDark : ""}`}>
            Observator al lumii interioare &amp; exterioare
          </div>
        ) : null}
      </div>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={styles.logo}>
        {mark}
      </Link>
    );
  }

  return <div className={styles.logo}>{mark}</div>;
}
