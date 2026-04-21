import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";

const [, , url, outputPath] = process.argv;

if (!url || !outputPath) {
  console.error("Usage: node scripts/capture-surface.mjs <url> <output-path>");
  process.exit(1);
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 1760 },
  deviceScaleFactor: 1,
  colorScheme: "light",
  reducedMotion: "reduce",
  userAgent:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36",
});
const page = await context.newPage();
page.setDefaultTimeout(18_000);

try {
  await Promise.race([
    page.goto(url, { waitUntil: "commit", timeout: 12_000 }),
    page.waitForTimeout(4_500),
  ]).catch(() => undefined);
  await page
    .addStyleTag({
      content: `*,*::before,*::after{animation-duration:0s !important;transition-duration:0s !important;caret-color:transparent !important;} html{scroll-behavior:auto !important;}`,
    })
    .catch(() => undefined);
  await page.waitForTimeout(1_600);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(350);

  const buffer = await page.screenshot({
    type: "jpeg",
    quality: 84,
    fullPage: false,
  });

  await fs.mkdir(path.dirname(outputPath), { recursive: true }).catch(() => undefined);
  await fs.writeFile(outputPath, buffer);
  console.log(outputPath);
} finally {
  await browser.close();
}
