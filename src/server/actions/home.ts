"use server";

import { z } from "zod";
import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activity";
import {
  HOME_SECTION_BY_TYPE,
  HOME_SECTION_DEFAULT_CONFIG,
} from "@/lib/constants";
import { homeSectionCreateSchema } from "@/lib/validators";
import type { GalleryImage, HeroSlide, HomeSectionType } from "@/lib/types";
import {
  fail,
  formToObject,
  fromZodError,
  list,
  ok,
  requireActionSession,
  revalidateSite,
  str,
  withActionState,
} from "@/server/actions/helpers";

// ---------------------------------------------------------------------------
// Conversão dos formulários de cada tipo de seção
// ---------------------------------------------------------------------------

const checkbox = z
  .union([z.literal("on"), z.literal("true"), z.literal("false"), z.boolean()])
  .optional()
  .transform((value) => value === "on" || value === "true" || value === true);

const text = z.string().trim().max(4000).optional().default("");
const align = z.enum(["LEFT", "CENTER", "RIGHT"]).catch("CENTER");
const height = z.enum(["COMPACT", "MEDIUM", "TALL", "FULLSCREEN"]).catch("MEDIUM");
const provider = z.enum(["UPLOAD", "YOUTUBE", "VIMEO"]).catch("YOUTUBE");
const overlay = z.coerce.number().min(0).max(90).catch(40);
const limit = z.coerce.number().min(1).max(24).catch(6);

/** Cada linha vira uma imagem: `endereço | texto alternativo`. */
function parseImageLines(raw: string): GalleryImage[] {
  return raw
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 24)
    .map((line) => {
      const [url, ...rest] = line.split("|");
      return { url: url.trim(), alt: rest.join("|").trim() };
    })
    .filter((image) => /^(https?:\/\/|\/)/i.test(image.url));
}

/** Cada linha vira um slide: `endereço | alt | título | subtítulo`. */
function parseSlideLines(raw: string): HeroSlide[] {
  return raw
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 8)
    .map((line) => {
      const [url, alt, title, subtitle] = line.split("|").map((part) => part?.trim() ?? "");
      return { imageUrl: url, alt, title, subtitle };
    })
    .filter((slide) => /^(https?:\/\/|\/)/i.test(slide.imageUrl));
}

const SECTION_SCHEMAS = {
  HERO: z.object({
    mediaType: z.enum(["IMAGE", "VIDEO", "CAROUSEL"]).catch("IMAGE"),
    imageUrl: text,
    imageMobileUrl: text,
    imageAlt: text,
    slidesRaw: text,
    videoProvider: provider,
    videoUrl: text,
    posterUrl: text,
    buttonEnabled: checkbox,
    buttonLabel: text,
    buttonUrl: text,
    align,
    overlay,
    height: z.enum(["COMPACT", "MEDIUM", "TALL", "FULLSCREEN"]).catch("TALL"),
  }),
  VIDEO: z.object({
    provider,
    url: text,
    posterUrl: text,
    autoplay: checkbox,
    muted: checkbox,
    loop: checkbox,
    controls: checkbox,
    fullWidth: checkbox,
  }),
  CATEGORIES: z.object({
    layout: z.enum(["CARDS", "SIMPLE"]).catch("CARDS"),
    limit,
    showDescription: checkbox,
    buttonLabel: text,
  }),
  FEATURED_PRODUCTS: z.object({
    source: z.enum(["FEATURED", "BEST_SELLER", "NEW", "CATEGORY"]).catch("FEATURED"),
    categoryId: text,
    limit,
    buttonLabel: text,
    buttonUrl: text,
  }),
  BANNER: z.object({
    imageUrl: text,
    imageMobileUrl: text,
    imageAlt: text,
    buttonLabel: text,
    buttonUrl: text,
    overlay,
    align,
    height,
  }),
  ABOUT: z.object({
    imageUrl: text,
    imageAlt: text,
    text,
    imagePosition: z.enum(["LEFT", "RIGHT"]).catch("LEFT"),
    buttonLabel: text,
    buttonUrl: text,
  }),
  GALLERY: z.object({
    imagesRaw: text,
    columns: z.coerce.number().min(2).max(4).catch(3),
  }),
  DELIVERY_CTA: z.object({
    text,
    buttonLabel: text,
    buttonUrl: text,
    imageUrl: text,
    imageAlt: text,
  }),
  LOCATIONS: z.object({ limit, buttonLabel: text }),
  SOCIAL: z.object({ handle: text, text, imagesRaw: text }),
} as const;

function buildConfig(
  type: HomeSectionType,
  raw: Record<string, string>,
): Prisma.InputJsonValue {
  switch (type) {
    case "HERO": {
      const data = SECTION_SCHEMAS.HERO.parse(raw);
      const { slidesRaw, ...rest } = data;
      return { ...rest, slides: parseSlideLines(slidesRaw) };
    }
    case "GALLERY": {
      const data = SECTION_SCHEMAS.GALLERY.parse(raw);
      return { columns: data.columns, images: parseImageLines(data.imagesRaw) };
    }
    case "SOCIAL": {
      const data = SECTION_SCHEMAS.SOCIAL.parse(raw);
      return {
        handle: data.handle,
        text: data.text,
        images: parseImageLines(data.imagesRaw),
      };
    }
    default:
      return SECTION_SCHEMAS[type].parse(raw) as Prisma.InputJsonValue;
  }
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

export const addHomeSectionAction = withActionState(async (session, formData) => {
  const parsed = homeSectionCreateSchema.safeParse({ type: formData.get("type") });
  if (!parsed.success) return fromZodError(parsed.error);

  const type = parsed.data.type;
  const definition = HOME_SECTION_BY_TYPE.get(type);
  if (!definition) return fail("Tipo de seção desconhecido.");

  if (definition.unique) {
    const exists = await prisma.homeSection.findFirst({ where: { type } });
    if (exists) {
      return fail(
        `A seção "${definition.label}" já existe na página inicial. Edite a que já está lá.`,
      );
    }
  }

  const last = await prisma.homeSection.findFirst({ orderBy: { position: "desc" } });

  const created = await prisma.homeSection.create({
    data: {
      type,
      title: definition.defaultTitle,
      subtitle: definition.defaultSubtitle,
      position: (last?.position ?? -1) + 1,
      enabled: true,
      config: HOME_SECTION_DEFAULT_CONFIG[type] as unknown as Prisma.InputJsonValue,
    },
  });

  await logActivity({
    userId: session.userId,
    action: "create",
    entity: "home_section",
    entityId: created.id,
    message: `Seção "${definition.label}" adicionada à página inicial`,
  });

  revalidateSite(["/admin/home"]);
  return ok(`Seção "${definition.label}" adicionada.`);
});

export const saveHomeSectionAction = withActionState(async (session, formData) => {
  const raw = formToObject(formData);
  const id = raw.id;
  if (!id) return fail("Seção não encontrada.");

  const section = await prisma.homeSection.findUnique({ where: { id } });
  if (!section) return fail("Seção não encontrada.");

  const type = section.type as HomeSectionType;
  const definition = HOME_SECTION_BY_TYPE.get(type);

  const updated = await prisma.homeSection.update({
    where: { id },
    data: {
      title: (raw.title ?? "").slice(0, 160),
      subtitle: (raw.subtitle ?? "").slice(0, 300),
      enabled: raw.enabled === "on" || raw.enabled === "true",
      config: buildConfig(type, raw),
    },
  });

  await logActivity({
    userId: session.userId,
    action: "update",
    entity: "home_section",
    entityId: updated.id,
    message: `Seção "${definition?.label ?? type}" da página inicial atualizada`,
  });

  revalidateSite(["/admin/home"]);
  return ok("Seção salva com sucesso.");
});

export async function toggleHomeSectionAction(formData: FormData): Promise<void> {
  const session = await requireActionSession();
  const id = str(formData, "id");
  const enabled = str(formData, "enabled") === "true";
  if (!id) return;

  const section = await prisma.homeSection.update({
    where: { id },
    data: { enabled },
  });

  await logActivity({
    userId: session.userId,
    action: "update",
    entity: "home_section",
    entityId: id,
    message: `Seção "${HOME_SECTION_BY_TYPE.get(section.type as HomeSectionType)?.label ?? section.type}" ${
      enabled ? "ativada" : "desativada"
    }`,
  });

  revalidateSite(["/admin/home"]);
}

export async function deleteHomeSectionAction(formData: FormData): Promise<void> {
  const session = await requireActionSession();
  const id = str(formData, "id");
  if (!id) return;

  const section = await prisma.homeSection.findUnique({ where: { id } });
  if (!section) return;

  await prisma.homeSection.delete({ where: { id } });

  await logActivity({
    userId: session.userId,
    action: "delete",
    entity: "home_section",
    entityId: id,
    message: `Seção "${HOME_SECTION_BY_TYPE.get(section.type as HomeSectionType)?.label ?? section.type}" removida da página inicial`,
  });

  revalidateSite(["/admin/home"]);
}

export async function reorderHomeSectionsAction(formData: FormData): Promise<void> {
  await requireActionSession();
  const ids = list(formData, "ids");
  if (ids.length === 0) return;

  await prisma.$transaction(
    ids.map((id, index) =>
      prisma.homeSection.update({ where: { id }, data: { position: index } }),
    ),
  );

  revalidateSite(["/admin/home"]);
}
