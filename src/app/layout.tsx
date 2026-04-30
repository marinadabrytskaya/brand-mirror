import type { Metadata } from "next";
import { Cormorant_Garamond, Inter, JetBrains_Mono } from "next/font/google";
import { SITE_URL } from "@/lib/site-url";
import "./globals.css";

// Editorial serif for headlines and pull-quotes. The existing globals.css already
// references `var(--font-cormorant)` in a couple of places but nothing was wiring
// it up, so serif text was quietly falling back to system Times. Wiring it here
// fixes that in one move.
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

// Terminal / meta typography — mono for all labels, tickers, production codes.
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

// Body sans. Previously the CSS just said `font-family: Inter, ...` and hoped the
// OS had Inter installed; now it is actually loaded.
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: "BrandMirror",
  title: {
    default: "BrandMirror | AI Brand Audit for Founders",
    template: "%s | BrandMirror",
  },
  description:
    "BrandMirror is an AI brand audit that reads your positioning, AI visibility, offer, visual trust, and conversion readiness before buyers drift away.",
  keywords: [
    "AI brand audit",
    "brand positioning audit",
    "website conversion audit",
    "AI visibility audit",
    "brand diagnosis for founders",
  ],
  authors: [{ name: "SAHAR Studio" }],
  creator: "SAHAR Studio",
  publisher: "SAHAR Studio",
  openGraph: {
    type: "website",
    url: "/",
    siteName: "BrandMirror",
    title: "BrandMirror | AI Brand Audit for Founders",
    description:
      "See what your brand is making clear, what is leaking trust, and what to fix first across positioning, AI visibility, offer, visual credibility, and conversion.",
  },
  twitter: {
    card: "summary_large_image",
    title: "BrandMirror | AI Brand Audit for Founders",
    description:
      "A fast AI-powered brand read for founders, studios, and premium service brands.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${cormorant.variable} ${jetbrainsMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
