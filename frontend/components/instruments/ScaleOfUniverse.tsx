"use client";

import { useState } from "react";

import { SCALE_STEPS } from "@/lib/instruments-data";

import styles from "./instruments.module.css";

const DEFAULT_INDEX = 8;

export default function ScaleOfUniverse() {
  const [index, setIndex] = useState(DEFAULT_INDEX);
  const step = SCALE_STEPS[index];
  const max = SCALE_STEPS.length - 1;

  return (
    <section className={styles.instrument}>
      <div className={styles.instrumentHeader}>
        <div className={styles.instrumentLabel}>01 · Scale of the Universe</div>
        <div className={styles.instrumentHint}>drag the dial</div>
      </div>
      <div className={styles.scaleBody}>
        <div className={styles.scalePlate}>
          <div className={styles.plateTag}>[ plate ]</div>
          <div className={styles.scaleExp}>{step.exp}</div>
          <div className={styles.scaleUnit}>metres, give or take</div>
        </div>
        <div>
          <div className={styles.scaleSize}>{step.size}</div>
          <h2 className={styles.scaleName}>{step.name}</h2>
          <p className={styles.scaleNote}>{step.note}</p>
          <div className={styles.dial}>
            <button
              type="button"
              className={styles.dialBtn}
              onClick={() => setIndex((i) => Math.max(0, i - 1))}
              aria-label="Scale down"
            >
              −
            </button>
            <input
              type="range"
              min={0}
              max={max}
              step={1}
              value={index}
              onChange={(e) => setIndex(Number(e.target.value))}
              className={styles.dialRange}
              aria-label="Scale of the universe"
            />
            <button
              type="button"
              className={styles.dialBtn}
              onClick={() => setIndex((i) => Math.min(max, i + 1))}
              aria-label="Scale up"
            >
              +
            </button>
          </div>
          <div className={styles.dialLabels}>
            <span>proton</span>
            <span>a human being</span>
            <span>the universe</span>
          </div>
        </div>
      </div>
    </section>
  );
}
