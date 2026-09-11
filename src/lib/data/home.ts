import { cache } from "react";
import type { HomeSection } from "@prisma/client";

import { prisma, safeQuery } from "@/lib/prisma";
import {
  isSectionVisible,
  mergeSectionConfig,
  toTypedSection,
} from "@/lib/home-sections";
import { getEnabledPageKeys } from "@/lib/data/pages";
import type { TypedHomeSection } from "@/lib/types";

export { mergeSectionConfig, toTypedSection };

/** Seções da Home visíveis no site (ligadas e com a página dependente ativa). */
export const getVisibleHomeSections = cache(async (): Promise<TypedHomeSection[]> => {
  const sections = await safeQuery(
    () =>
      prisma.homeSection.findMany({
        where: { enabled: true },
        orderBy: { position: "asc" },
      }),
    [] as HomeSection[],
  );

  const enabledPages = await getEnabledPageKeys();

  return sections
    .map(toTypedSection)
    .filter((section) => isSectionVisible(section, enabledPages));
});

/** Todas as seções (inclusive desligadas) — usado no painel. */
export async function getAdminHomeSections(): Promise<TypedHomeSection[]> {
  const sections = await safeQuery(
    () => prisma.homeSection.findMany({ orderBy: { position: "asc" } }),
    [] as HomeSection[],
  );
  return sections.map(toTypedSection);
}

export async function getAdminHomeSection(
  id: string,
): Promise<TypedHomeSection | null> {
  const section = await safeQuery(
    () => prisma.homeSection.findUnique({ where: { id } }),
    null,
  );
  return section ? toTypedSection(section) : null;
}
