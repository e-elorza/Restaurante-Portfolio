import { cache } from "react";

import { prisma, safeQuery } from "@/lib/prisma";
import {
  DEFAULT_APPEARANCE,
  DEFAULT_EVENT_SETTINGS,
  DEFAULT_FOOTER,
  DEFAULT_HEADER,
  DEFAULT_RESTAURANT,
  DEFAULT_SEO,
} from "@/lib/data/defaults";
import { SOCIAL_NETWORKS } from "@/lib/constants";
import type { SocialLink } from "@prisma/client";

/**
 * Leituras de configuração. Todas usam `cache()` do React para não repetir a
 * mesma consulta várias vezes na renderização de uma única página.
 */

export const getRestaurantSettings = cache(async () =>
  safeQuery(
    async () =>
      (await prisma.restaurantSettings.findUnique({ where: { id: "default" } })) ??
      DEFAULT_RESTAURANT,
    DEFAULT_RESTAURANT,
  ),
);

export const getAppearance = cache(async () =>
  safeQuery(
    async () =>
      (await prisma.appearanceSettings.findUnique({ where: { id: "default" } })) ??
      DEFAULT_APPEARANCE,
    DEFAULT_APPEARANCE,
  ),
);

export const getSeoSettings = cache(async () =>
  safeQuery(
    async () =>
      (await prisma.seoSettings.findUnique({ where: { id: "default" } })) ??
      DEFAULT_SEO,
    DEFAULT_SEO,
  ),
);

export const getHeaderSettings = cache(async () =>
  safeQuery(
    async () =>
      (await prisma.headerSettings.findUnique({ where: { id: "default" } })) ??
      DEFAULT_HEADER,
    DEFAULT_HEADER,
  ),
);

export const getFooterSettings = cache(async () =>
  safeQuery(
    async () =>
      (await prisma.footerSettings.findUnique({ where: { id: "default" } })) ??
      DEFAULT_FOOTER,
    DEFAULT_FOOTER,
  ),
);

export const getEventSettings = cache(async () =>
  safeQuery(
    async () =>
      (await prisma.eventSettings.findUnique({ where: { id: "default" } })) ??
      DEFAULT_EVENT_SETTINGS,
    DEFAULT_EVENT_SETTINGS,
  ),
);

/** Todas as redes sociais, inclusive as desligadas (usado no painel). */
export const getAllSocialLinks = cache(async (): Promise<SocialLink[]> => {
  const stored = await safeQuery(
    () => prisma.socialLink.findMany({ orderBy: { position: "asc" } }),
    [] as SocialLink[],
  );
  const byNetwork = new Map(stored.map((link) => [link.network, link]));
  return SOCIAL_NETWORKS.map((definition, index) => {
    const existing = byNetwork.get(definition.network);
    return (
      existing ?? {
        id: `virtual-${definition.network}`,
        network: definition.network,
        label: definition.label,
        url: "",
        enabled: false,
        position: index,
        updatedAt: new Date(0),
      }
    );
  });
});

/** Somente as redes ativas e com link preenchido (usado no site). */
export const getActiveSocialLinks = cache(async (): Promise<SocialLink[]> => {
  const all = await getAllSocialLinks();
  return all.filter((link) => link.enabled && link.url.trim() !== "");
});
