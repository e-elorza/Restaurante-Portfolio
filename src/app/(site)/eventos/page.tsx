import type { Metadata } from "next";
import Image from "next/image";
import { CalendarDays, Clock, MapPin } from "lucide-react";
import type { Event } from "@prisma/client";

import { PageHero, SiteButton } from "@/components/site/blocks";
import { RevealGroup, RevealItem } from "@/components/site/motion";
import { getMediaSlotUrls, getPublicEvents } from "@/lib/data/content";
import { getPage, requirePageEnabled } from "@/lib/data/pages";
import { getEventSettings, getRestaurantSettings } from "@/lib/data/settings";
import { formatDate } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage("EVENTS");
  return {
    title: page.metaTitle || page.label,
    description: page.metaDescription || undefined,
    alternates: { canonical: "/eventos" },
  };
}

export default async function EventsPage() {
  const page = await requirePageEnabled("EVENTS");
  const [{ upcoming, past, showPast }, media, settings, eventSettings] =
    await Promise.all([
      getPublicEvents(),
      getMediaSlotUrls(),
      getRestaurantSettings(),
      getEventSettings(),
    ]);

  return (
    <>
      <PageHero
        eyebrow="Agenda"
        title={page.headline || page.label}
        intro={page.intro || eventSettings.intro}
        imageUrl={media["capa-eventos"]}
      />

      <div className="site-container space-y-20 py-16 sm:py-20">
        <section aria-labelledby="proximos-eventos">
          <h2
            id="proximos-eventos"
            className="mb-8 font-heading text-2xl font-semibold sm:text-3xl"
          >
            Próximos eventos
          </h2>

          {upcoming.length === 0 ? (
            <p className="rounded-[var(--card-radius)] border border-dashed border-[rgb(var(--brand-text-rgb)/0.16)] px-6 py-14 text-center text-[var(--brand-muted)]">
              Nenhum evento agendado por enquanto. Acompanhe nossas redes para novidades.
            </p>
          ) : (
            <RevealGroup className="grid gap-6 lg:grid-cols-2">
              {upcoming.map((event) => (
                <RevealItem key={event.id}>
                  <EventCard event={event} locale={settings.locale} />
                </RevealItem>
              ))}
            </RevealGroup>
          )}
        </section>

        {showPast && past.length > 0 ? (
          <section aria-labelledby="eventos-anteriores">
            <h2
              id="eventos-anteriores"
              className="mb-8 font-heading text-2xl font-semibold sm:text-3xl"
            >
              Já aconteceu
            </h2>
            <RevealGroup className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {past.map((event) => (
                <RevealItem key={event.id}>
                  <EventCard event={event} locale={settings.locale} compact />
                </RevealItem>
              ))}
            </RevealGroup>
          </section>
        ) : null}
      </div>
    </>
  );
}

function EventCard({
  event,
  locale,
  compact = false,
}: {
  event: Event;
  locale: string;
  compact?: boolean;
}) {
  return (
    <article
      className={`surface-card group flex h-full flex-col overflow-hidden shadow-card ${
        compact ? "opacity-85" : ""
      }`}
    >
      {event.imageUrl ? (
        <div className={`relative overflow-hidden ${compact ? "aspect-[16/10]" : "aspect-[16/9]"}`}>
          <Image
            src={event.imageUrl}
            alt={event.imageAlt || event.name}
            fill
            sizes="(max-width: 1024px) 100vw, 620px"
            className={`object-cover transition-transform duration-700 group-hover:scale-105 ${
              compact ? "grayscale-[0.4]" : ""
            }`}
          />
        </div>
      ) : null}

      <div className="flex flex-1 flex-col gap-3 p-5 sm:p-6">
        <h3 className={`font-heading font-semibold ${compact ? "text-lg" : "text-xl sm:text-2xl"}`}>
          {event.name}
        </h3>

        <ul className="space-y-1.5 text-sm text-[var(--brand-muted)]">
          <li className="flex items-center gap-2">
            <CalendarDays className="size-4 shrink-0 opacity-60" aria-hidden />
            <time dateTime={event.startsAt.toISOString()}>
              {formatDate(event.startsAt, locale)}
            </time>
          </li>
          {event.timeLabel ? (
            <li className="flex items-center gap-2">
              <Clock className="size-4 shrink-0 opacity-60" aria-hidden />
              {event.timeLabel}
            </li>
          ) : null}
          {event.address ? (
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0 opacity-60" aria-hidden />
              {event.address}
            </li>
          ) : null}
        </ul>

        {event.description ? (
          <p className="text-pretty text-sm leading-relaxed text-[var(--brand-muted)]">
            {event.description}
          </p>
        ) : null}

        {!compact && event.buttonLabel && event.buttonUrl ? (
          <div className="mt-auto pt-3">
            <SiteButton href={event.buttonUrl} variant="outline">
              {event.buttonLabel}
            </SiteButton>
          </div>
        ) : null}
      </div>
    </article>
  );
}
