"use client";

import { useState } from "react";

import { QUOTES } from "@/lib/instruments-data";

import styles from "./instruments.module.css";

export default function QuoteDrawer() {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const quote = QUOTES[index];

  function nextQuote() {
    setIndex((i) => (i + 1) % QUOTES.length);
    setOpen(true);
  }

  return (
    <section className={`${styles.instrument} ${styles.instrumentDark}`}>
      <div className={styles.instrumentHeaderDark}>
        <div className={styles.instrumentLabelDark}>03 · The Quote Drawer</div>
        <div className={styles.instrumentHintDark}>borrowed steadiness</div>
      </div>
      <div className={styles.drawerBody}>
        <p className={styles.drawerIntro}>
          An old card-catalogue drawer of things worth keeping nearby. Pull it open,
          take what you need, file another for the next person.
        </p>

        <button
          type="button"
          className={styles.drawerHandle}
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
        >
          <span className={styles.drawerHandleLabel}>
            Drawer № IV · steadiness
          </span>
          <span className={styles.drawerHandleRight}>
            <span className={styles.drawerKnob} />
            <span className={styles.drawerPull}>pull</span>
          </span>
        </button>

        {open ? (
          <div className={styles.drawerContent}>
            <div className={styles.quoteMark}>&ldquo;</div>
            <p className={styles.quoteText}>{quote.text}</p>
            <div className={styles.quoteFooter}>
              <div>
                <div className={styles.quoteWho}>{quote.who}</div>
                <div className={styles.quoteEra}>{quote.era}</div>
              </div>
              <button type="button" className={styles.quoteNext} onClick={nextQuote}>
                File another →
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
