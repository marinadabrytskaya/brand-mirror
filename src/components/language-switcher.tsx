"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

type SiteLocale = "en" | "es" | "ru";

const SUPPORTED_SITE_LOCALES: SiteLocale[] = ["en", "es", "ru"];

const SITE_LOCALE_LABELS: Record<SiteLocale, string> = {
  en: "EN",
  es: "ES",
  ru: "RU",
};

export default function LanguageSwitcher({ locale }: { locale: SiteLocale }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-[color:var(--line-strong)] bg-[color:var(--surface)] p-1 backdrop-blur-md">
      {SUPPORTED_SITE_LOCALES.map((item) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("lang", item);
        const href = `${pathname}${params.toString() ? `?${params.toString()}` : ""}`;

        return (
          <Link
            key={item}
            href={href}
            className={`rounded-full px-3 py-1.5 text-xs uppercase tracking-[0.18em] transition ${
              item === locale
                ? "bg-[color:var(--foreground)] text-[#f6efe2]"
                : "text-[color:var(--foreground-soft)] hover:text-[color:var(--foreground)]"
            }`}
          >
            {SITE_LOCALE_LABELS[item]}
          </Link>
        );
      })}
    </div>
  );
}
