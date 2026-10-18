import type { MetadataRoute } from "next";
import { isDemoMode } from "@/lib/catalog";
import { siteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export default function robots(): MetadataRoute.Robots {
  // Mientras el sitio esté en modo de ejemplo, no se indexa nada.
  if (isDemoMode()) return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/administracion", "/api/", "/auth", "/cuenta"],
    },
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
