"use server";

import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activity";
import { MEDIA_SLOT_BY_KEY } from "@/lib/constants";
import {
  deliveryOptionSchema,
  eventSchema,
  locationSchema,
  mediaSlotSchema,
} from "@/lib/validators";
import { slugify } from "@/lib/utils";
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
// Delivery
// ---------------------------------------------------------------------------

export const saveDeliveryOptionAction = withActionState(async (session, formData) => {
  const parsed = deliveryOptionSchema.safeParse(formToObject(formData));
  if (!parsed.success) return fromZodError(parsed.error);

  const data = parsed.data;
  const payload = {
    name: data.name,
    description: data.description,
    logoUrl: data.logoUrl || null,
    url: data.url,
    active: data.active,
  };

  if (data.id) {
    await prisma.deliveryOption.update({ where: { id: data.id }, data: payload });
  } else {
    const last = await prisma.deliveryOption.findFirst({
      orderBy: { position: "desc" },
    });
    await prisma.deliveryOption.create({
      data: { ...payload, position: (last?.position ?? -1) + 1 },
    });
  }

  await logActivity({
    userId: session.userId,
    action: data.id ? "update" : "create",
    entity: "delivery_option",
    entityId: data.id,
    message: `Canal de delivery "${data.name}" ${data.id ? "atualizado" : "criado"}`,
  });

  revalidateSite(["/admin/delivery"]);
  return ok("Canal de delivery salvo.");
});

export async function deleteDeliveryOptionAction(formData: FormData): Promise<void> {
  const session = await requireActionSession();
  const id = str(formData, "id");
  if (!id) return;

  const option = await prisma.deliveryOption.findUnique({ where: { id } });
  if (!option) return;

  await prisma.deliveryOption.delete({ where: { id } });
  await logActivity({
    userId: session.userId,
    action: "delete",
    entity: "delivery_option",
    entityId: id,
    message: `Canal de delivery "${option.name}" excluído`,
  });

  revalidateSite(["/admin/delivery"]);
}

export async function reorderDeliveryOptionsAction(formData: FormData): Promise<void> {
  await requireActionSession();
  const ids = list(formData, "ids");
  if (ids.length === 0) return;

  await prisma.$transaction(
    ids.map((id, index) =>
      prisma.deliveryOption.update({ where: { id }, data: { position: index } }),
    ),
  );

  revalidateSite(["/admin/delivery"]);
}

// ---------------------------------------------------------------------------
// Eventos
// ---------------------------------------------------------------------------

async function uniqueEventSlug(name: string, currentId?: string): Promise<string> {
  const base = slugify(name) || "evento";
  let candidate = base;
  let counter = 2;
  for (;;) {
    const existing = await prisma.event.findUnique({ where: { slug: candidate } });
    if (!existing || existing.id === currentId) return candidate;
    candidate = `${base}-${counter}`;
    counter += 1;
  }
}

export const saveEventAction = withActionState(async (session, formData) => {
  const parsed = eventSchema.safeParse(formToObject(formData));
  if (!parsed.success) return fromZodError(parsed.error);

  const data = parsed.data;
  const payload = {
    name: data.name,
    description: data.description,
    imageUrl: data.imageUrl || null,
    imageAlt: data.imageAlt,
    startsAt: new Date(data.startsAt),
    timeLabel: data.timeLabel,
    address: data.address,
    buttonLabel: data.buttonLabel,
    buttonUrl: data.buttonUrl,
    active: data.active,
  };

  if (data.id) {
    await prisma.event.update({ where: { id: data.id }, data: payload });
  } else {
    const last = await prisma.event.findFirst({ orderBy: { position: "desc" } });
    await prisma.event.create({
      data: {
        ...payload,
        slug: await uniqueEventSlug(data.name),
        position: (last?.position ?? -1) + 1,
      },
    });
  }

  await logActivity({
    userId: session.userId,
    action: data.id ? "update" : "create",
    entity: "event",
    entityId: data.id,
    message: `Evento "${data.name}" ${data.id ? "atualizado" : "criado"}`,
  });

  revalidateSite(["/admin/eventos"]);
  return ok("Evento salvo com sucesso.");
});

export async function deleteEventAction(formData: FormData): Promise<void> {
  const session = await requireActionSession();
  const id = str(formData, "id");
  if (!id) return;

  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) return;

  await prisma.event.delete({ where: { id } });
  await logActivity({
    userId: session.userId,
    action: "delete",
    entity: "event",
    entityId: id,
    message: `Evento "${event.name}" excluído`,
  });

  revalidateSite(["/admin/eventos"]);
}

// ---------------------------------------------------------------------------
// Unidades
// ---------------------------------------------------------------------------

async function uniqueLocationSlug(name: string, currentId?: string): Promise<string> {
  const base = slugify(name) || "unidade";
  let candidate = base;
  let counter = 2;
  for (;;) {
    const existing = await prisma.location.findUnique({ where: { slug: candidate } });
    if (!existing || existing.id === currentId) return candidate;
    candidate = `${base}-${counter}`;
    counter += 1;
  }
}

export const saveLocationAction = withActionState(async (session, formData) => {
  const parsed = locationSchema.safeParse(formToObject(formData));
  if (!parsed.success) return fromZodError(parsed.error);

  const data = parsed.data;
  const payload = {
    name: data.name,
    imageUrl: data.imageUrl || null,
    imageAlt: data.imageAlt,
    address: data.address,
    city: data.city,
    phone: data.phone,
    whatsapp: data.whatsapp,
    openingHours: data.openingHours,
    mapsUrl: data.mapsUrl,
    deliveryUrl: data.deliveryUrl,
    instagram: data.instagram,
    active: data.active,
  };

  if (data.id) {
    await prisma.location.update({ where: { id: data.id }, data: payload });
  } else {
    const last = await prisma.location.findFirst({ orderBy: { position: "desc" } });
    await prisma.location.create({
      data: {
        ...payload,
        slug: await uniqueLocationSlug(data.name),
        position: (last?.position ?? -1) + 1,
      },
    });
  }

  await logActivity({
    userId: session.userId,
    action: data.id ? "update" : "create",
    entity: "location",
    entityId: data.id,
    message: `Unidade "${data.name}" ${data.id ? "atualizada" : "criada"}`,
  });

  revalidateSite(["/admin/unidades"]);
  return ok("Unidade salva com sucesso.");
});

export async function deleteLocationAction(formData: FormData): Promise<void> {
  const session = await requireActionSession();
  const id = str(formData, "id");
  if (!id) return;

  const location = await prisma.location.findUnique({ where: { id } });
  if (!location) return;

  await prisma.location.delete({ where: { id } });
  await logActivity({
    userId: session.userId,
    action: "delete",
    entity: "location",
    entityId: id,
    message: `Unidade "${location.name}" excluída`,
  });

  revalidateSite(["/admin/unidades"]);
}

export async function reorderLocationsAction(formData: FormData): Promise<void> {
  await requireActionSession();
  const ids = list(formData, "ids");
  if (ids.length === 0) return;

  await prisma.$transaction(
    ids.map((id, index) =>
      prisma.location.update({ where: { id }, data: { position: index } }),
    ),
  );

  revalidateSite(["/admin/unidades"]);
}

// ---------------------------------------------------------------------------
// Mídia
// ---------------------------------------------------------------------------

export const saveMediaSlotAction = withActionState(async (session, formData) => {
  const parsed = mediaSlotSchema.safeParse(formToObject(formData));
  if (!parsed.success) return fromZodError(parsed.error);

  const data = parsed.data;
  const definition = MEDIA_SLOT_BY_KEY.get(data.key);
  if (!definition) return fail("Espaço de imagem desconhecido.");

  await prisma.mediaSlot.upsert({
    where: { key: data.key },
    update: { url: data.url || null, alt: data.alt },
    create: {
      key: definition.key,
      name: definition.name,
      description: definition.description,
      recommended: definition.recommended,
      group: definition.group,
      position: definition.position,
      url: data.url || null,
      alt: data.alt,
    },
  });

  await logActivity({
    userId: session.userId,
    action: "update",
    entity: "media_slot",
    entityId: data.key,
    message: `Imagem "${definition.name}" ${data.url ? "atualizada" : "removida"}`,
  });

  revalidateSite(["/admin/midia"]);
  return ok(
    data.url ? `"${definition.name}" atualizada.` : `"${definition.name}" removida.`,
  );
});

export async function deleteMediaAssetAction(formData: FormData): Promise<void> {
  const session = await requireActionSession();
  const id = str(formData, "id");
  if (!id) return;

  const asset = await prisma.mediaAsset.findUnique({ where: { id } });
  if (!asset) return;

  await prisma.mediaAsset.delete({ where: { id } });
  await logActivity({
    userId: session.userId,
    action: "delete",
    entity: "media_asset",
    entityId: id,
    message: `Imagem "${asset.name}" removida da biblioteca`,
  });

  revalidateSite(["/admin/midia"]);
}
