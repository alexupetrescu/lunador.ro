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
        <div className={styles.instrumentLabelDark}>03 · Sertarul cu citate</div>
        <div className={styles.instrumentHintDark}>statornicie împrumutată</div>
      </div>
      <div className={styles.drawerBody}>
        <p className={styles.drawerIntro}>
          Un sertar vechi de fișier, cu lucruri care merită ținute la îndemână.
          Trage-l, ia ce îți trebuie, arhivează altul pentru următorul om.
        </p>

        <button
          type="button"
          className={styles.drawerHandle}
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
        >
          <span className={styles.drawerHandleLabel}>
            Sertarul № IV · statornicie
          </span>
          <span className={styles.drawerHandleRight}>
            <span className={styles.drawerKnob} />
            <span className={styles.drawerPull}>trage</span>
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
                Arhivează altul →
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
