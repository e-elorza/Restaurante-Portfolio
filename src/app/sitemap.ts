import type { MetadataRoute } from "next";

import { getPages } from "@/lib/data/pages";
import { getActiveProducts } from "@/lib/data/menu";
import { getSeoSettings } from "@/lib/data/settings";
import { siteUrl } from "@/lib/site-url";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const seo = await getSeoSettings();
  if (!seo.indexable) return [];

  const base = siteUrl();
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
