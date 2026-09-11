"use server";

import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activity";
import { SOCIAL_NETWORKS } from "@/lib/constants";
import {
  appearanceSchema,
  eventSettingsSchema,
  footerSchema,
  headerSchema,
  restaurantSettingsSchema,
  seoSchema,
} from "@/lib/validators";
import {
  formToObject,
  fromZodError,
  ok,
  revalidateSite,
  withActionState,
} from "@/server/actions/helpers";

export const saveRestaurantSettingsAction = withActionState(
  async (session, formData) => {
    const parsed = restaurantSettingsSchema.safeParse(formToObject(formData));
    if (!parsed.success) return fromZodError(parsed.error);

    const data = parsed.data;
    await prisma.restaurantSettings.upsert({
      where: { id: "default" },
      update: {
        ...data,
        logoUrl: data.logoUrl || null,
        faviconUrl: data.faviconUrl || null,
        orderUrl: data.orderUrl || null,
      },
      create: {
        id: "default",
        ...data,
        logoUrl: data.logoUrl || null,
        faviconUrl: data.faviconUrl || null,
        orderUrl: data.orderUrl || null,
      },
    });

    await logActivity({
      userId: session.userId,
      action: "update",
      entity: "settings",
      message: "Configurações gerais atualizadas",
    });

    revalidateSite(["/admin/configuracoes"]);
    return ok("Configurações salvas com sucesso.");
  },
);

export const saveAppearanceAction = withActionState(async (session, formData) => {
  const parsed = appearanceSchema.safeParse(formToObject(formData));
  if (!parsed.success) return fromZodError(parsed.error);

  await prisma.appearanceSettings.upsert({
    where: { id: "default" },
    update: parsed.data,
    create: { id: "default", ...parsed.data },
  });

  await logActivity({
    userId: session.userId,
    action: "update",
    entity: "appearance",
    message: "Aparência do site atualizada",
  });

  revalidateSite(["/admin/aparencia"]);
  return ok("Aparência atualizada. Abra o site para ver o resultado.");
});

export const saveSeoAction = withActionState(async (session, formData) => {
  const parsed = seoSchema.safeParse(formToObject(formData));
  if (!parsed.success) return fromZodError(parsed.error);

  const data = parsed.data;
  const payload = {
    ...data,
    ogImageUrl: data.ogImageUrl || null,
    faviconUrl: data.faviconUrl || null,
    googleVerification: data.googleVerification || null,
    robots: data.robots || "index, follow",
    titleTemplate: data.titleTemplate || "%s",
  };

  await prisma.seoSettings.upsert({
    where: { id: "default" },
    update: payload,
    create: { id: "default", ...payload },
  });

  await logActivity({
    userId: session.userId,
    action: "update",
    entity: "seo",
    message: "Configurações de SEO atualizadas",
  });

  revalidateSite(["/admin/seo"]);
  return ok("Configurações de SEO salvas.");
});

export const saveHeaderAction = withActionState(async (session, formData) => {
  const parsed = headerSchema.safeParse(formToObject(formData));
  if (!parsed.success) return fromZodError(parsed.error);

  const data = parsed.data;
  await prisma.headerSettings.upsert({
    where: { id: "default" },
    update: { ...data, logoUrl: data.logoUrl || null },
    create: { id: "default", ...data, logoUrl: data.logoUrl || null },
  });

  await logActivity({
    userId: session.userId,
    action: "update",
    entity: "header",
    message: "Cabeçalho do site atualizado",
  });

  revalidateSite(["/admin/aparencia"]);
  return ok("Cabeçalho atualizado.");
});

export const saveFooterAction = withActionState(async (session, formData) => {
  const parsed = footerSchema.safeParse(formToObject(formData));
  if (!parsed.success) return fromZodError(parsed.error);

  const data = parsed.data;
  await prisma.footerSettings.upsert({
    where: { id: "default" },
    update: { ...data, logoUrl: data.logoUrl || null },
    create: { id: "default", ...data, logoUrl: data.logoUrl || null },
  });

  await logActivity({
    userId: session.userId,
    action: "update",
    entity: "footer",
    message: "Rodapé do site atualizado",
  });

  revalidateSite(["/admin/aparencia"]);
  return ok("Rodapé atualizado.");
});

export const saveSocialLinksAction = withActionState(async (session, formData) => {
  for (const [index, definition] of SOCIAL_NETWORKS.entries()) {
    const url = String(formData.get(`url-${definition.network}`) ?? "").trim();
    const enabledValue = formData.get(`enabled-${definition.network}`);
    const enabled = enabledValue === "on" || enabledValue === "true";

    await prisma.socialLink.upsert({
      where: { network: definition.network },
      update: { url, enabled: enabled && url !== "", label: definition.label },
      create: {
        network: definition.network,
        label: definition.label,
        url,
        enabled: enabled && url !== "",
        position: index,
      },
    });
  }

  await logActivity({
    userId: session.userId,
    action: "update",
    entity: "social",
    message: "Redes sociais atualizadas",
  });

  revalidateSite(["/admin/redes-sociais"]);
  return ok("Redes sociais atualizadas.");
});

export const saveEventSettingsAction = withActionState(async (session, formData) => {
  const parsed = eventSettingsSchema.safeParse(formToObject(formData));
  if (!parsed.success) return fromZodError(parsed.error);

  await prisma.eventSettings.upsert({
    where: { id: "default" },
    update: parsed.data,
    create: { id: "default", ...parsed.data },
  });

  await logActivity({
    userId: session.userId,
    action: "update",
    entity: "event_settings",
    message: "Configurações de eventos atualizadas",
  });

  revalidateSite(["/admin/eventos"]);
  return ok("Configurações de eventos salvas.");
});
