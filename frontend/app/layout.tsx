import type { Metadata } from "next";
import { Newsreader, Spline_Sans_Mono } from "next/font/google";
import "./globals.css";

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
  title: "lunador.ro — Opening Soon",
  description:
    "Slow essays on the meaning of a life and the physics of the sky it happens under.",
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
      <body className="min-h-full">{children}</body>
    </html>
  );
}
