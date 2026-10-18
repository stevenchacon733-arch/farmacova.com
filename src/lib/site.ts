// Dominio público usado en metadatos, sitemap y robots.
export function siteUrl() {
  const value = process.env.SITE_URL?.trim() || "https://farmacova.com";
  try {
    return new URL(value).origin;
  } catch {
    return "https://farmacova.com";
  }
}
