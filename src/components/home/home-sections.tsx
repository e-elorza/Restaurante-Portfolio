import * as React from "react";
import type { RestaurantSettings } from "@prisma/client";

import { HeroSection } from "@/components/home/hero-section";
import { VideoSection } from "@/components/home/video-section";
import {
  AboutSection,
  BannerSection,
  CategoriesSection,
  DeliveryCtaSection,
  FeaturedProductsSection,
  GallerySection,
  LocationsSection,
  SocialSection,
} from "@/components/home/sections";
import { ProductShowcase } from "@/components/menu/product-showcase";
import {
  getActiveCategories,
  getCategoryMenu,
  getFeaturedProducts,
} from "@/lib/data/menu";
import { getActiveLocations } from "@/lib/data/content";
import { getActiveSocialLinks } from "@/lib/data/settings";
import { resolveOrderLink } from "@/lib/order";
import type {
  AboutConfig,
  BannerConfig,
  CategoriesConfig,
  DeliveryCtaConfig,
  FeaturedProductsConfig,
  GalleryConfig,
  HeroConfig,
  LocationsConfig,
  SocialConfig,
  TypedHomeSection,
  VideoConfig,
} from "@/lib/types";

/**
 * Monta a página inicial a partir das seções configuradas no painel.
 * A ordem e a visibilidade vêm do banco (Admin > Home).
 */
export async function HomeSections({
  sections,
  settings,
  deliveryEnabled,
}: {
  sections: TypedHomeSection[];
  settings: RestaurantSettings;
  deliveryEnabled: boolean;
}) {
  const types = new Set(sections.map((section) => section.type));

  // O "Cardápio simples" precisa dos produtos da categoria escolhida nele; a
  // vitrine de categorias precisa só da lista de categorias.
  const cardapioSimples = sections.find(
    (section) =>
      section.type === "CATEGORIES" &&
      (section.config as CategoriesConfig).layout === "SIMPLE",
  );

  const [categories, simpleMenu, locations, socials] = await Promise.all([
    types.has("CATEGORIES") ? getActiveCategories() : Promise.resolve([]),
    cardapioSimples
      ? getCategoryMenu(
          (cardapioSimples.config as CategoriesConfig).categoryId || undefined,
        )
      : Promise.resolve(null),
    types.has("LOCATIONS") ? getActiveLocations() : Promise.resolve([]),
    types.has("SOCIAL") ? getActiveSocialLinks() : Promise.resolve([]),
  ]);

  const rendered = await Promise.all(
    sections.map(async (section) => {
      switch (section.type) {
        case "HERO":
          return (
            <HeroSection
              key={section.id}
              title={section.title}
              subtitle={section.subtitle}
              config={section.config as HeroConfig}
            />
          );

        case "VIDEO":
          return (
            <VideoSection
              key={section.id}
              title={section.title}
              subtitle={section.subtitle}
              config={section.config as VideoConfig}
            />
          );

        case "CATEGORIES":
          return (
            <CategoriesSection
              key={section.id}
              title={section.title}
              subtitle={section.subtitle}
              config={section.config as CategoriesConfig}
              categories={categories}
              simpleMenu={simpleMenu}
              currency={settings.currency}
              locale={settings.locale}
            />
          );

        case "FEATURED_PRODUCTS": {
          const config = section.config as FeaturedProductsConfig;
          const products = await getFeaturedProducts(
            config.source,
            config.limit,
            config.categoryId || undefined,
          );
          if (products.length === 0) return null;

          const withLinks = products.map((product) => ({
            ...product,
            orderLink: resolveOrderLink(product, settings, deliveryEnabled),
          }));

          return (
            <FeaturedProductsSection
              key={section.id}
              title={section.title}
              subtitle={section.subtitle}
              buttonLabel={config.buttonLabel}
              buttonUrl={config.buttonUrl}
            >
              <ProductShowcase
                products={withLinks}
                currency={settings.currency}
                locale={settings.locale}
                orderLabel={settings.orderLabel}
              />
            </FeaturedProductsSection>
          );
        }

        case "BANNER":
          return (
            <BannerSection
              key={section.id}
              title={section.title}
              subtitle={section.subtitle}
              config={section.config as BannerConfig}
            />
          );

        case "ABOUT":
          return (
            <AboutSection
              key={section.id}
              title={section.title}
              subtitle={section.subtitle}
              config={section.config as AboutConfig}
            />
          );

        case "GALLERY":
          return (
            <GallerySection
              key={section.id}
              title={section.title}
              subtitle={section.subtitle}
              config={section.config as GalleryConfig}
            />
          );

        case "DELIVERY_CTA":
          return (
            <DeliveryCtaSection
              key={section.id}
              title={section.title}
              subtitle={section.subtitle}
              config={section.config as DeliveryCtaConfig}
            />
          );

        case "LOCATIONS":
          return (
            <LocationsSection
              key={section.id}
              title={section.title}
              subtitle={section.subtitle}
              config={section.config as LocationsConfig}
              locations={locations}
            />
          );

        case "SOCIAL":
          return (
            <SocialSection
              key={section.id}
              title={section.title}
              subtitle={section.subtitle}
              config={section.config as SocialConfig}
              socials={socials}
            />
          );

        default:
          return null;
      }
    }),
  );

  return <>{rendered}</>;
}
