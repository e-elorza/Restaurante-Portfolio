import type { HomeSection, Prisma } from "@prisma/client";

import {
  HOME_SECTION_BY_TYPE,
  HOME_SECTION_DEFAULT_CONFIG,
} from "@/lib/constants";
import type { HomeSectionType, TypedHomeSection } from "@/lib/types";
import type { PageKey } from "@prisma/client";

/**
 * Junta a configuração salva no banco com os valores padrão da seção. Assim,
 * campos criados depois que a seção foi salva continuam funcionando.
 */
export function mergeSectionConfig<T extends HomeSectionType>(
  type: T,
  raw: Prisma.JsonValue | null | undefined,
): TypedHomeSection<T>["config"] {
  const defaults = HOME_SECTION_DEFAULT_CONFIG[type];
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { ...defaults };
  }
  return {
    ...defaults,
    ...(raw as Record<string, unknown>),
  } as TypedHomeSection<T>["config"];
}

export function toTypedSection(section: HomeSection): TypedHomeSection {
  const type = section.type as HomeSectionType;
  return {
    ...section,
    type,
    config: mergeSectionConfig(type, section.config),
  } as TypedHomeSection;
}

/**
 * Uma seção só aparece no site se estiver ativa e, quando depender de uma
 * página opcional (Delivery ou Unidades), se essa página estiver ligada.
 */
export function isSectionVisible(
  section: Pick<TypedHomeSection, "type" | "enabled">,
  enabledPages: ReadonlySet<PageKey>,
): boolean {
  if (!section.enabled) return false;
  const definition = HOME_SECTION_BY_TYPE.get(section.type as HomeSectionType);
  if (!definition?.requiresPage) return true;
  return enabledPages.has(definition.requiresPage);
}
