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
        <div className={styles.instrumentLabel}>02 · Viața în săptămâni</div>
        <div className={styles.instrumentHint}>un memento mori blând</div>
      </div>
      <div className={styles.weeksBody}>
        <div>
          <p className={styles.weeksIntro}>
            Fiecare pătrățel e o săptămână. Un rând e un an. Pătrățelele pline
            sunt săptămânile în care ai fost deja oaspete aici.
          </p>
          <div className={styles.ageLabel}>Vârsta ta</div>
          <div className={styles.ageControl}>
            <button
              type="button"
              className={styles.dialBtn}
              onClick={() => setAge((a) => Math.max(0, a - 1))}
              aria-label="Scade vârsta"
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
              aria-label="Vârsta ta în ani"
            />
            <button
              type="button"
              className={styles.dialBtn}
              onClick={() => setAge((a) => Math.min(LIFESPAN, a + 1))}
              aria-label="Crește vârsta"
            >
              +
            </button>
          </div>
          <div className={styles.weeksStats}>
            <div>
              <div className={styles.statValueGold}>{weeksLived.toLocaleString()}</div>
              <div className={styles.statLabel}>
                săptămâni trăite · {pct}% dintr-o viață lungă
              </div>
            </div>
            <div>
              <div className={styles.statValue}>{weeksLeft.toLocaleString()}</div>
              <div className={styles.statLabel}>săptămâni încă pe masă</div>
            </div>
          </div>
          <p className={styles.weeksAside}>
            Nu ca să alarmeze — ca să limpezească. A rămas foarte mult loc pe pagină.
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
              trăite
            </span>
            <span className={styles.legendItem}>
              <span className={styles.legendRemaining} />
              încă de venit
            </span>
            <span className={styles.legendMeta}>52 de săptămâni × 90 de ani</span>
          </div>
        </div>
      </div>
    </section>
  );
}
