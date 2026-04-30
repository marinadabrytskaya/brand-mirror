const DEFAULT_SITE_URL = "https://www.brandmirror.app";

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL
).replace(/\/+$/, "");

export const SITE_HOST = new URL(SITE_URL).host;

export function absoluteUrl(path = "/") {
  return new URL(path, SITE_URL).toString();
}
