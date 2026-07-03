import type { Metadata } from "next";

import LifeInWeeks from "@/components/instruments/LifeInWeeks";
import QuoteDrawer from "@/components/instruments/QuoteDrawer";
import ScaleOfUniverse from "@/components/instruments/ScaleOfUniverse";
import { siteConfig } from "@/lib/site";

import styles from "./instruments.module.css";

export const metadata: Metadata = {
  title: `Instrumente — ${siteConfig.name}`,
  description:
    "Mașinării mici care îți schimbă simțul scării, simțul timpului și simțul companiei.",
  alternates: { canonical: "/instruments" },
};

export default function InstrumentsPage() {
  return (
    <main className={styles.page}>
      <div className={styles.eyebrow}>Cabinetul de instrumente · trei piese în funcțiune</div>
      <h1 className={styles.title}>Instrumente</h1>
      <p className={styles.lede}>
        Mașinării mici care îți schimbă simțul scării, simțul timpului și simțul
        companiei. Atinge-le. Sunt făcute să fie folosite, nu doar citite.
      </p>

      <ScaleOfUniverse />
      <LifeInWeeks />
      <QuoteDrawer />
    </main>
  );
}
