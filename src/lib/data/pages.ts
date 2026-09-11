import { cache } from "react";
import { notFound } from "next/navigation";
import type { Page, PageKey } from "@prisma/client";

import { prisma, safeQuery } from "@/lib/prisma";
import { PAGE_DEFINITIONS } from "@/lib/constants";
import {
  enabledPageKeys,
  footerNavigation,
  isPageVisible,
  menuNavigation,
} from "@/lib/navigation";
import type { NavigationItem } from "@/lib/types";

function fallbackPage(definition: (typeof PAGE_DEFINITIONS)[number]): Page {
  return {
    key: definition.key,
    label: definition.label,
    path: definition.path,
    enabled: definition.locked,
    lockedEnabled: definition.locked,
    position: definition.position,
    showInMenu: true,
    showInFooter: true,
    headline: "",
    intro: "",
    metaTitle: "",
    metaDescription: "",
    socialImageUrl: null,
    updatedAt: new Date(0),
  };
}

/** Todas as páginas conhecidas, na ordem do menu (inclusive as desligadas). */
export const getPages = cache(async (): Promise<Page[]> => {
  const stored = await safeQuery(
    () => prisma.page.findMany({ orderBy: { position: "asc" } }),
    [] as Page[],
  );
  const byKey = new Map(stored.map((page) => [page.key, page]));
  return PAGE_DEFINITIONS.map(
    (definition) => byKey.get(definition.key) ?? fallbackPage(definition),
  ).sort((a, b) => a.position - b.position);
});

export const getPage = cache(async (key: PageKey): Promise<Page> => {
  const pages = await getPages();
  const page = pages.find((item) => item.key === key);
  if (page) return page;
  const definition = PAGE_DEFINITIONS.find((item) => item.key === key)!;
  return fallbackPage(definition);
});

export const isPageEnabled = cache(async (key: PageKey): Promise<boolean> => {
  const page = await getPage(key);
  return isPageVisible(page);
});

/**
 * Usada nas páginas opcionais: se o administrador desligou a página, o acesso
 * direto à rota devolve "página não encontrada".
 */
export async function requirePageEnabled(key: PageKey): Promise<Page> {
  const page = await getPage(key);
  if (!isPageVisible(page)) notFound();
  return page;
}

export const getNavigation = cache(async (): Promise<NavigationItem[]> =>
  menuNavigation(await getPages()),
);

export const getFooterNavigation = cache(async (): Promise<NavigationItem[]> =>
  footerNavigation(await getPages()),
);

/** Conjunto de páginas ligadas — usado para esconder seções dependentes. */
export const getEnabledPageKeys = cache(async (): Promise<Set<PageKey>> =>
  enabledPageKeys(await getPages()),
);
