import type { Metadata } from "next";
import { Cormorant_Garamond, Inter, JetBrains_Mono } from "next/font/google";
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
  title: {
    default: "BrandMirror",
    template: "%s | BrandMirror",
  },
  description:
    "BrandMirror is an AI-powered brand positioning and visual identity audit for founders, studios, and premium service brands.",
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
