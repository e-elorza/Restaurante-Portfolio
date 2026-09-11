import { cache } from "react";
import type {
  DeliveryOption,
  Event,
  Location,
  MediaAsset,
  MediaSlot,
} from "@prisma/client";

import { prisma, safeQuery } from "@/lib/prisma";
import { MEDIA_SLOT_DEFINITIONS } from "@/lib/constants";
import { getEventSettings } from "@/lib/data/settings";

// ---------------------------------------------------------------------------
// Mídia
// ---------------------------------------------------------------------------

function fallbackSlot(definition: (typeof MEDIA_SLOT_DEFINITIONS)[number]): MediaSlot {
  return {
    key: definition.key,
    name: definition.name,
    description: definition.description,
    recommended: definition.recommended,
    group: definition.group,
    url: null,
    alt: "",
    position: definition.position,
    updatedAt: new Date(0),
  };
}

export const getMediaSlots = cache(async (): Promise<MediaSlot[]> => {
  const stored = await safeQuery(
    () => prisma.mediaSlot.findMany({ orderBy: { position: "asc" } }),
    [] as MediaSlot[],
  );
  const byKey = new Map(stored.map((slot) => [slot.key, slot]));
  return MEDIA_SLOT_DEFINITIONS.map(
    (definition) => byKey.get(definition.key) ?? fallbackSlot(definition),
  );
});

/** Mapa `chave -> URL` das imagens configuradas, para uso no site. */
export const getMediaSlotUrls = cache(async (): Promise<Record<string, string>> => {
  const slots = await getMediaSlots();
  return Object.fromEntries(
    slots.filter((slot) => slot.url).map((slot) => [slot.key, slot.url as string]),
  );
});

export async function getMediaLibrary(): Promise<MediaAsset[]> {
  return safeQuery(
    () => prisma.mediaAsset.findMany({ orderBy: { createdAt: "desc" }, take: 200 }),
    [] as MediaAsset[],
  );
}

// ---------------------------------------------------------------------------
// Delivery
// ---------------------------------------------------------------------------

export const getActiveDeliveryOptions = cache(async (): Promise<DeliveryOption[]> =>
  safeQuery(
    () =>
      prisma.deliveryOption.findMany({
        where: { active: true },
        orderBy: { position: "asc" },
      }),
    [],
  ),
);

export async function getAdminDeliveryOptions(): Promise<DeliveryOption[]> {
  return safeQuery(
    () => prisma.deliveryOption.findMany({ orderBy: { position: "asc" } }),
    [],
  );
}

// ---------------------------------------------------------------------------
// Eventos
// ---------------------------------------------------------------------------

export type EventGroups = {
  upcoming: Event[];
  past: Event[];
  showPast: boolean;
};

/** Eventos separados entre próximos e passados, respeitando a configuração. */
export const getPublicEvents = cache(async (): Promise<EventGroups> => {
  const [events, settings] = await Promise.all([
    safeQuery(
      () =>
        prisma.event.findMany({
          where: { active: true },
          orderBy: [{ startsAt: "asc" }, { position: "asc" }],
        }),
      [] as Event[],
    ),
    getEventSettings(),
  ]);

  const now = new Date();
  const upcoming = events.filter((event) => (event.endsAt ?? event.startsAt) >= now);
  const past = events
    .filter((event) => (event.endsAt ?? event.startsAt) < now)
    .sort((a, b) => b.startsAt.getTime() - a.startsAt.getTime());

  return { upcoming, past, showPast: settings.pastBehavior === "ARCHIVE" };
});

export async function getAdminEvents(): Promise<Event[]> {
  return safeQuery(
    () => prisma.event.findMany({ orderBy: [{ startsAt: "desc" }] }),
    [],
  );
}

// ---------------------------------------------------------------------------
// Unidades
// ---------------------------------------------------------------------------

export const getActiveLocations = cache(async (): Promise<Location[]> =>
  safeQuery(
    () =>
      prisma.location.findMany({
        where: { active: true },
        orderBy: { position: "asc" },
      }),
    [],
  ),
);

export async function getAdminLocations(): Promise<Location[]> {
  return safeQuery(
    () => prisma.location.findMany({ orderBy: { position: "asc" } }),
    [],
  );
}
