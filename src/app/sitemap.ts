import type { MetadataRoute } from "next";

import { getPages } from "@/lib/data/pages";
import { getActiveProducts } from "@/lib/data/menu";
import { getSeoSettings } from "@/lib/data/settings";

export const dynamic = "force-dynamic";

function baseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:3000")
  ).replace(/\/$/, "");
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const seo = await getSeoSettings();
  if (!seo.indexable) return [];

  const base = baseUrl();
  const [pages, products] = await Promise.all([getPages(), getActiveProducts()]);

  const pageEntries: MetadataRoute.Sitemap = pages
    .filter((page) => page.enabled || page.lockedEnabled)
    .map((page) => ({
      url: `${base}${page.path === "/" ? "" : page.path}`,
      lastModified: page.updatedAt,
      changeFrequency: "weekly",
      priority: page.key === "HOME" ? 1 : 0.8,
    }));

  const productEntries: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${base}/cardapio/${product.slug}`,
    lastModified: product.updatedAt,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...pageEntries, ...productEntries];
}
