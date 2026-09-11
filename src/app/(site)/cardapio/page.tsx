import { Suspense } from "react";
import type { Metadata } from "next";

import { MenuBrowser } from "@/components/menu/menu-browser";
import { MenuSkeleton } from "@/components/menu/menu-skeleton";
import { PageHero } from "@/components/site/blocks";
import { getMenu } from "@/lib/data/menu";
import { getMediaSlotUrls } from "@/lib/data/content";
import { getPage, isPageEnabled } from "@/lib/data/pages";
import { getRestaurantSettings } from "@/lib/data/settings";
import { resolveOrderLink } from "@/lib/order";
import type { MenuCategoryView } from "@/components/menu/types";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage("MENU");
  return {
    title: page.metaTitle || page.label,
    description: page.metaDescription || undefined,
    openGraph: page.socialImageUrl
      ? { images: [{ url: page.socialImageUrl }] }
      : undefined,
    alternates: { canonical: "/cardapio" },
  };
}

export default async function MenuPage() {
  const [page, settings, media] = await Promise.all([
    getPage("MENU"),
    getRestaurantSettings(),
    getMediaSlotUrls(),
  ]);

  return (
    <>
      <PageHero
        eyebrow={settings.name}
        title={page.headline || page.label}
        intro={page.intro}
        imageUrl={media["capa-cardapio"]}
      />

      <div className="site-container pb-24 pt-6">
        {/* O topo aparece na hora; a lista de produtos entra em seguida. */}
        <Suspense fallback={<MenuSkeleton />}>
          <MenuContent />
        </Suspense>
      </div>
    </>
  );
}

async function MenuContent() {
  const [menu, settings, deliveryEnabled] = await Promise.all([
    getMenu(),
    getRestaurantSettings(),
    isPageEnabled("DELIVERY"),
  ]);

  const categories: MenuCategoryView[] = menu.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    imageUrl: category.imageUrl,
    products: category.products.map((product) => ({
      ...product,
      orderLink: resolveOrderLink(product, settings, deliveryEnabled),
    })),
  }));

  return (
    <MenuBrowser
      categories={categories}
      currency={settings.currency}
      locale={settings.locale}
      orderLabel={settings.orderLabel}
    />
  );
}
