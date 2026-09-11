import type { Page, PageKey } from "@prisma/client";

import type { NavigationItem } from "@/lib/types";

/**
 * Regras de visibilidade das páginas.
 *
 * Uma página aparece no site quando está ligada pelo administrador ou quando é
 * obrigatória (Início e Cardápio). Estas funções são puras de propósito: é o
 * comportamento mais sensível do sistema e por isso é coberto por testes.
 */

export type PageVisibility = Pick<
  Page,
  "key" | "label" | "path" | "enabled" | "lockedEnabled" | "showInMenu" | "showInFooter"
>;

export function isPageVisible(page: Pick<Page, "enabled" | "lockedEnabled">): boolean {
  return page.enabled || page.lockedEnabled;
}

export function toNavigationItem(page: PageVisibility): NavigationItem {
  return { key: page.key, label: page.label, path: page.path };
}

/** Itens do menu do topo. */
export function menuNavigation(pages: PageVisibility[]): NavigationItem[] {
  return pages.filter((page) => isPageVisible(page) && page.showInMenu).map(toNavigationItem);
}

/** Itens do rodapé. */
export function footerNavigation(pages: PageVisibility[]): NavigationItem[] {
  return pages
    .filter((page) => isPageVisible(page) && page.showInFooter)
    .map(toNavigationItem);
}

/** Conjunto das páginas ligadas — usado para esconder seções dependentes. */
export function enabledPageKeys(
  pages: Pick<Page, "key" | "enabled" | "lockedEnabled">[],
): Set<PageKey> {
  return new Set(pages.filter(isPageVisible).map((page) => page.key));
}
