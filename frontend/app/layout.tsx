import type { Metadata } from "next";
import { Newsreader, Spline_Sans_Mono } from "next/font/google";
import "./globals.css";

import JsonLd from "@/components/JsonLd";
import { siteConfig } from "@/lib/site";

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
});

const splineSansMono = Spline_Sans_Mono({
  variable: "--font-spline-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — Opening Soon`,
    template: `%s`,
  },
  description: siteConfig.description,
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: siteConfig.name,
  url: siteConfig.url,
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: siteConfig.author.name,
  url: siteConfig.author.url,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${newsreader.variable} ${splineSansMono.variable} h-full`}
    >
      <body className="min-h-full">
        <JsonLd data={[organizationJsonLd, personJsonLd]} />
        {children}
      </body>
    </html>
  );
}
