import type { Metadata } from "next";

import LifeInWeeks from "@/components/instruments/LifeInWeeks";
import QuoteDrawer from "@/components/instruments/QuoteDrawer";
import ScaleOfUniverse from "@/components/instruments/ScaleOfUniverse";
import { siteConfig } from "@/lib/site";

import styles from "./instruments.module.css";

export const metadata: Metadata = {
  title: `Instruments — ${siteConfig.name}`,
  description:
    "Small machines for changing your sense of scale, your sense of time, and your sense of company.",
  alternates: { canonical: "/instruments" },
};

export default function InstrumentsPage() {
  return (
    <main className={styles.page}>
      <div className={styles.eyebrow}>The instrument cabinet · three working pieces</div>
      <h1 className={styles.title}>Instruments</h1>
      <p className={styles.lede}>
        Small machines for changing your sense of scale, your sense of time, and your
        sense of company. Touch them. They are meant to be used, not just read.
      </p>

      <ScaleOfUniverse />
      <LifeInWeeks />
      <QuoteDrawer />
    </main>
  );
}
