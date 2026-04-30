import type { MetadataRoute } from "next";
import { absoluteUrl, SITE_HOST } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/first-read", "/sample-report"],
      disallow: ["/api/", "/full-report"],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
    host: SITE_HOST,
  };
}
