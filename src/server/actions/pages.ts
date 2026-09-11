"use server";

import type { PageKey } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activity";
import { PAGE_BY_KEY, PAGE_DEFINITIONS } from "@/lib/constants";
import { pageSettingsSchema } from "@/lib/validators";
import {
  formToObject,
  fromZodError,
  list,
  ok,
  revalidateSite,
  withActionState,
} from "@/server/actions/helpers";

/** Cria o registro da página caso ainda não exista (primeiro acesso). */
async function ensurePage(key: PageKey) {
  const definition = PAGE_BY_KEY.get(key)!;
  return prisma.page.upsert({
    where: { key },
    update: {},
    create: {
      key,
      label: definition.label,
      path: definition.path,
      position: definition.position,
      enabled: definition.locked,
      lockedEnabled: definition.locked,
    },
  });
}

/**
 * Liga/desliga as páginas opcionais do site.
 * As páginas obrigatórias (Início e Cardápio) permanecem sempre ligadas.
 */
export const savePagesTogglesAction = withActionState(async (session, formData) => {
  const enabled = new Set(list(formData, "enabled"));

  for (const definition of PAGE_DEFINITIONS) {
    await ensurePage(definition.key);
    const shouldEnable = definition.locked || enabled.has(definition.key);
    await prisma.page.update({
      where: { key: definition.key },
      data: { enabled: shouldEnable },
    });
  }

  const visible = PAGE_DEFINITIONS.filter(
    (definition) => definition.locked || enabled.has(definition.key),
  ).map((definition) => definition.label);

  await logActivity({
    userId: session.userId,
    action: "update",
    entity: "page",
    message: `Páginas visíveis no site: ${visible.join(", ")}`,
  });

  revalidateSite(["/admin/paginas"]);
  return ok("Páginas atualizadas. O menu do site já reflete a mudança.");
});

/** Salva os textos e o SEO de uma página específica. */
export const savePageSettingsAction = withActionState(async (session, formData) => {
  const parsed = pageSettingsSchema.safeParse(formToObject(formData));
  if (!parsed.success) return fromZodError(parsed.error);

  const data = parsed.data;
  await ensurePage(data.key);

  const page = await prisma.page.update({
    where: { key: data.key },
    data: {
      label: data.label,
      headline: data.headline,
      intro: data.intro,
      metaTitle: data.metaTitle,
      metaDescription: data.metaDescription,
      socialImageUrl: data.socialImageUrl || null,
      showInMenu: data.showInMenu,
      showInFooter: data.showInFooter,
    },
  });

  await logActivity({
    userId: session.userId,
    action: "update",
    entity: "page",
    entityId: page.key,
    message: `Página "${page.label}" atualizada`,
  });

  revalidateSite(["/admin/paginas"]);
  return ok("Página salva com sucesso.");
});
