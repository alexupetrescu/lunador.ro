"use client";

import { useMemo, useState } from "react";

import styles from "./instruments.module.css";

const LIFESPAN = 90;
const WEEKS_PER_YEAR = 52;
const TOTAL_WEEKS = LIFESPAN * WEEKS_PER_YEAR;
const DEFAULT_AGE = 32;

export default function LifeInWeeks() {
  const [age, setAge] = useState(DEFAULT_AGE);

  const weeksLived = age * WEEKS_PER_YEAR;
  const weeksLeft = Math.max(0, TOTAL_WEEKS - weeksLived);
  const pct = Math.round((weeksLived / TOTAL_WEEKS) * 100);

  const squares = useMemo(() => {
    const lived = Array.from({ length: weeksLived }, (_, i) => `l-${i}`);
    const remaining = Array.from({ length: weeksLeft }, (_, i) => `r-${i}`);
    return [...lived, ...remaining];
  }, [weeksLived, weeksLeft]);

  return (
    <section className={styles.instrument}>
      <div className={styles.instrumentHeader}>
        <div className={styles.instrumentLabel}>02 · Life in Weeks</div>
        <div className={styles.instrumentHint}>a gentle memento mori</div>
      </div>
      <div className={styles.weeksBody}>
        <div>
          <p className={styles.weeksIntro}>
            Each square is one week. A row is a year. The filled squares are the
            weeks you have already been a guest here.
          </p>
          <div className={styles.ageLabel}>Your age</div>
          <div className={styles.ageControl}>
            <button
              type="button"
              className={styles.dialBtn}
              onClick={() => setAge((a) => Math.max(0, a - 1))}
              aria-label="Decrease age"
            >
              −
            </button>
            <input
              type="number"
              min={0}
              max={LIFESPAN}
              value={age}
              onChange={(e) => {
                const n = Number(e.target.value);
                if (!Number.isNaN(n)) setAge(Math.min(LIFESPAN, Math.max(0, n)));
              }}
              className={styles.ageInput}
              aria-label="Your age in years"
            />
            <button
              type="button"
              className={styles.dialBtn}
              onClick={() => setAge((a) => Math.min(LIFESPAN, a + 1))}
              aria-label="Increase age"
            >
              +
            </button>
          </div>
          <div className={styles.weeksStats}>
            <div>
              <div className={styles.statValueGold}>{weeksLived.toLocaleString()}</div>
              <div className={styles.statLabel}>
                weeks lived · {pct}% of a long life
              </div>
            </div>
            <div>
              <div className={styles.statValue}>{weeksLeft.toLocaleString()}</div>
              <div className={styles.statLabel}>weeks still on the table</div>
            </div>
          </div>
          <p className={styles.weeksAside}>
            Not to alarm — to focus. There is a great deal of room left on the page.
          </p>
        </div>
        <div>
          <div className={styles.weeksGrid}>
            {squares.map((id, i) => (
              <div
                key={id}
                className={i < weeksLived ? styles.weekLived : styles.weekRemaining}
              />
            ))}
          </div>
          <div className={styles.weeksLegend}>
            <span className={styles.legendItem}>
              <span className={styles.legendLived} />
              lived
            </span>
            <span className={styles.legendItem}>
              <span className={styles.legendRemaining} />
              still to come
            </span>
            <span className={styles.legendMeta}>52 weeks × 90 years</span>
          </div>
        </div>
      </div>
    </section>
  );
}
