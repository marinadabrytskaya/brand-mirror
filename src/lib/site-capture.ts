import { chromium, type Browser } from "playwright";

export type SiteCaptureAnchorZone =
  | "hero-promise"
  | "proof-cta"
  | "trust-layer"
  | "action-layer";

export type SiteCaptureAnchor = {
  zone: SiteCaptureAnchorZone;
  x: number;
  y: number;
  text: string;
};

export type SiteCaptureFrame = {
  kind: "image-block" | "logo-cluster" | "product-shot";
  x: number;
  y: number;
  text: string;
};

export type SiteCapture = {
  dataUrl: string;
  capturedAt: string;
  viewport: {
    width: number;
    height: number;
  };
  anchors: SiteCaptureAnchor[];
  galleryFrames: SiteCaptureFrame[];
};

const CAPTURE_VIEWPORT = {
  width: 1440,
  height: 1760,
};

const CAPTURE_TIMEOUT_MS = 18_000;
const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36";

let browserPromise: Promise<Browser> | null = null;

async function getBrowser() {
  if (!browserPromise) {
    browserPromise = chromium.launch({
      headless: true,
    });
  }

  return browserPromise;
}

function toDataUrl(buffer: Buffer, contentType: string) {
  return `data:${contentType};base64,${buffer.toString("base64")}`;
}

export async function captureWebsiteSurface(url: string): Promise<SiteCapture | null> {
  try {
    const browser = await getBrowser();
    const context = await browser.newContext({
      viewport: CAPTURE_VIEWPORT,
      deviceScaleFactor: 1,
      colorScheme: "light",
      reducedMotion: "reduce",
      userAgent: USER_AGENT,
    });
    const page = await context.newPage();
    page.setDefaultTimeout(CAPTURE_TIMEOUT_MS);

    try {
      await page.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: CAPTURE_TIMEOUT_MS,
      });

      await page.emulateMedia({
        colorScheme: "light",
        reducedMotion: "reduce",
      });

      await page
        .addStyleTag({
          content: `
            *,
            *::before,
            *::after {
              animation-duration: 0s !important;
              transition-duration: 0s !important;
              caret-color: transparent !important;
            }

            html {
              scroll-behavior: auto !important;
            }
          `,
        })
        .catch(() => undefined);

      await Promise.race([
        page.waitForLoadState("networkidle", {
          timeout: 5_000,
        }),
        page.waitForTimeout(1_800),
      ]).catch(() => undefined);

      await page.evaluate(() => {
        window.scrollTo(0, 0);
      });
      await page.waitForTimeout(350);

      const captureMap = await page.evaluate(() => {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        const utilityTerms = [
          "skip to main content",
          "find a store",
          "sign in",
          "log in",
          "join us",
          "help",
          "menu",
          "wishlist",
          "bag",
          "cart",
          "search",
          "country",
          "location",
          "customer service",
          "order status",
          "dispatch and delivery",
          "shipping",
          "returns",
          "faq",
          "contact us",
          "gift cards",
          "student discount",
          "feedback",
          "privacy policy",
          "terms of sale",
          "terms of use",
          "terms and conditions",
          "cookie",
          "legal",
        ];

        const ctaTerms = [
          "shop",
          "buy",
          "order",
          "book",
          "start",
          "get",
          "discover",
          "learn",
          "read",
          "see",
          "join",
          "view",
          "explore",
          "try",
          "schedule",
          "enquire",
          "contact",
          "apply",
        ];

        const proofTerms = [
          "client",
          "clients",
          "case study",
          "results",
          "trusted",
          "review",
          "testimonial",
          "proof",
          "award",
          "featured",
        ];

        function normalize(text: string) {
          return text.replace(/\s+/g, " ").trim().toLowerCase();
        }

        function isVisible(element: Element) {
          const rect = element.getBoundingClientRect();
          const style = window.getComputedStyle(element as HTMLElement);

          return (
            rect.width >= 40 &&
            rect.height >= 18 &&
            rect.bottom >= 0 &&
            rect.top <= viewportHeight * 1.15 &&
            style.display !== "none" &&
            style.visibility !== "hidden" &&
            Number(style.opacity || "1") > 0
          );
        }

        function clamp(value: number, min: number, max: number) {
          return Math.max(min, Math.min(max, value));
        }

        const headingCandidates = Array.from(
          document.querySelectorAll("h1, h2, [role='heading']"),
        )
          .filter((element) => isVisible(element))
          .map((element) => {
            const rect = element.getBoundingClientRect();
            const text = element.textContent?.replace(/\s+/g, " ").trim() || "";
            const tagName = element.tagName.toLowerCase();
            const fontSize = Number.parseFloat(
              window.getComputedStyle(element as HTMLElement).fontSize || "16",
            );
            const score =
              (tagName === "h1" ? 40 : 18) +
              fontSize +
              Math.max(0, 120 - rect.top) * 0.12 +
              Math.max(0, 90 - Math.abs(rect.left - viewportWidth * 0.28) * 0.08);

            return { rect, text, score };
          })
          .filter((item) => item.text.length >= 4 && item.text.length <= 120)
          .sort((a, b) => b.score - a.score);

        const ctaCandidates = Array.from(document.querySelectorAll("a, button"))
          .filter((element) => isVisible(element))
          .map((element) => {
            const rect = element.getBoundingClientRect();
            const text = element.textContent?.replace(/\s+/g, " ").trim() || "";
            const normalized = normalize(text);
            let score =
              Math.max(0, rect.top - viewportHeight * 0.18) * 0.08 +
              Math.max(0, viewportHeight * 0.95 - rect.top) * 0.05;

            if (ctaTerms.some((term) => normalized.includes(term))) score += 38;
            if (proofTerms.some((term) => normalized.includes(term))) score += 14;
            if (utilityTerms.some((term) => normalized.includes(term))) score -= 60;

            return { rect, text, normalized, score };
          })
          .filter(
            (item) =>
              item.text.length >= 2 &&
              item.text.length <= 42 &&
              !utilityTerms.some((term) => item.normalized.includes(term)),
          )
          .sort((a, b) => b.score - a.score);

        const trustCandidates = Array.from(
          document.querySelectorAll("section, article, div, ul"),
        )
          .filter((element) => isVisible(element))
          .map((element) => {
            const rect = element.getBoundingClientRect();
            const text = normalize(element.textContent || "");
            const imageCount = element.querySelectorAll("img, picture img").length;
            const logoCount = Array.from(
              element.querySelectorAll("img, picture img"),
            ).filter((image) =>
              normalize(
                image.getAttribute("alt") ||
                  image.getAttribute("aria-label") ||
                  "",
              ).includes("logo"),
            ).length;

            let score = 0;

            if (proofTerms.some((term) => text.includes(term))) score += 36;
            score += Math.min(imageCount, 5) * 8;
            score += Math.min(logoCount, 4) * 10;
            score += Math.max(0, viewportHeight * 0.92 - rect.top) * 0.03;
            score += rect.width * 0.01;

            return { rect, text, score, imageCount };
          })
          .filter(
            (item) =>
              item.score > 24 &&
              item.rect.width >= viewportWidth * 0.2 &&
              item.rect.height >= 60,
          )
          .sort((a, b) => b.score - a.score);

        const galleryFrames = Array.from(
          document.querySelectorAll("img, picture img"),
        )
          .filter((element) => isVisible(element))
          .map((element) => {
            const rect = element.getBoundingClientRect();
            const alt = normalize(
              element.getAttribute("alt") ||
                element.getAttribute("aria-label") ||
                "",
            );
            const parentText = normalize(
              element.parentElement?.textContent ||
                element.closest("section, article, figure, div")?.textContent ||
                "",
            );

            let score = rect.width * rect.height * 0.0008;
            if (alt.length >= 4) score += 18;
            if (alt.includes("logo") || parentText.includes("trusted by")) score += 20;
            if (
              alt.includes("product") ||
              alt.includes("collection") ||
              alt.includes("campaign") ||
              alt.includes("service")
            ) {
              score += 16;
            }
            if (rect.top >= viewportHeight * 0.16) score += 10;

            let kind: "image-block" | "logo-cluster" | "product-shot" = "image-block";
            if (alt.includes("logo") || parentText.includes("logo")) {
              kind = "logo-cluster";
            } else if (
              alt.includes("product") ||
              alt.includes("collection") ||
              alt.includes("campaign") ||
              alt.includes("service")
            ) {
              kind = "product-shot";
            }

            return {
              rect,
              alt,
              score,
              kind,
              text: alt || parentText || "Visual surface",
            };
          })
          .filter(
            (item) =>
              item.rect.width >= 110 &&
              item.rect.height >= 72 &&
              item.rect.top <= viewportHeight * 1.08,
          )
          .sort((a, b) => b.score - a.score)
          .filter((item, index, items) => {
            return !items.slice(0, index).some((other) => {
              const deltaX = Math.abs(other.rect.left - item.rect.left);
              const deltaY = Math.abs(other.rect.top - item.rect.top);
              return deltaX < 80 && deltaY < 80;
            });
          })
          .slice(0, 3)
          .map((item) => ({
            kind: item.kind,
            x: clamp(((item.rect.left + item.rect.width / 2) / viewportWidth) * 100, 14, 86),
            y: clamp(((item.rect.top + item.rect.height / 2) / viewportHeight) * 100, 18, 88),
            text: item.text,
          }));

        const hero = headingCandidates[0];
        const proofCta = ctaCandidates[0];
        const trustLayer = trustCandidates[0];
        const actionLayer =
          ctaCandidates.find((item) => item.rect.top >= viewportHeight * 0.34) || proofCta;

        const results: Array<{
          zone: "hero-promise" | "proof-cta" | "trust-layer" | "action-layer";
          x: number;
          y: number;
          text: string;
        }> = [];

        if (hero) {
          results.push({
            zone: "hero-promise",
            x: clamp((hero.rect.left / viewportWidth) * 100, 8, 44),
            y: clamp((hero.rect.top / viewportHeight) * 100, 10, 38),
            text: hero.text,
          });
        }

        if (proofCta) {
          results.push({
            zone: "proof-cta",
            x: clamp((proofCta.rect.left / viewportWidth) * 100, 46, 82),
            y: clamp((proofCta.rect.top / viewportHeight) * 100, 42, 78),
            text: proofCta.text,
          });
        }

        if (trustLayer) {
          results.push({
            zone: "trust-layer",
            x: clamp(((trustLayer.rect.left + trustLayer.rect.width * 0.38) / viewportWidth) * 100, 16, 62),
            y: clamp(((trustLayer.rect.top + trustLayer.rect.height * 0.32) / viewportHeight) * 100, 28, 74),
            text: trustLayer.text.slice(0, 160),
          });
        }

        if (actionLayer) {
          results.push({
            zone: "action-layer",
            x: clamp(((actionLayer.rect.left + actionLayer.rect.width / 2) / viewportWidth) * 100, 42, 86),
            y: clamp(((actionLayer.rect.top + actionLayer.rect.height / 2) / viewportHeight) * 100, 34, 84),
            text: actionLayer.text,
          });
        }

        return {
          anchors: results,
          galleryFrames,
        };
      });

      const buffer = await page.screenshot({
        type: "jpeg",
        quality: 72,
        fullPage: false,
        caret: "hide",
      });

      return {
        dataUrl: toDataUrl(buffer, "image/jpeg"),
        capturedAt: new Date().toISOString(),
        viewport: CAPTURE_VIEWPORT,
        anchors: captureMap.anchors,
        galleryFrames: captureMap.galleryFrames,
      };
    } finally {
      await context.close();
    }
  } catch {
    return null;
  }
}
