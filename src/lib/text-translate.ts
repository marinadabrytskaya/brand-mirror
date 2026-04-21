import { type SiteLocale } from "@/lib/site-i18n";

const translationCache = new Map<string, string>();

function getCacheKey(language: SiteLocale, text: string) {
  return `${language}::${text}`;
}

async function translateWithGoogle(text: string, language: Exclude<SiteLocale, "en">) {
  const endpoint = new URL("https://translate.googleapis.com/translate_a/single");
  endpoint.searchParams.set("client", "gtx");
  endpoint.searchParams.set("sl", "en");
  endpoint.searchParams.set("tl", language);
  endpoint.searchParams.set("dt", "t");
  endpoint.searchParams.set("q", text);

  const response = await fetch(endpoint.toString(), {
    headers: {
      "User-Agent": "BrandMirror/0.1",
    },
  });

  if (!response.ok) {
    throw new Error(`Translation failed: ${response.status}`);
  }

  const payload = (await response.json()) as unknown[];
  const rows = Array.isArray(payload?.[0]) ? (payload[0] as unknown[]) : [];
  return rows
    .map((row) => (Array.isArray(row) ? String(row[0] || "") : ""))
    .join("")
    .trim();
}

export async function translateTexts(
  texts: string[],
  language: SiteLocale,
) {
  if (language === "en") {
    return texts;
  }

  const uniqueTexts = Array.from(new Set(texts.filter(Boolean)));
  const translations = new Map<string, string>();

  await Promise.all(
    uniqueTexts.map(async (text) => {
      const cacheKey = getCacheKey(language, text);
      const cached = translationCache.get(cacheKey);
      if (cached) {
        translations.set(text, cached);
        return;
      }

      try {
        const translated = await translateWithGoogle(
          text,
          language as Exclude<SiteLocale, "en">,
        );
        translationCache.set(cacheKey, translated);
        translations.set(text, translated);
      } catch {
        translations.set(text, text);
      }
    }),
  );

  return texts.map((text) => translations.get(text) || text);
}
