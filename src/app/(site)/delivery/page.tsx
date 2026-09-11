import type { Metadata } from "next";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

import { PageHero } from "@/components/site/blocks";
import { RevealGroup, RevealItem } from "@/components/site/motion";
import { getActiveDeliveryOptions, getMediaSlotUrls } from "@/lib/data/content";
import { getPage, requirePageEnabled } from "@/lib/data/pages";
import { safeExternalUrl } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage("DELIVERY");
  return {
    title: page.metaTitle || page.label,
    description: page.metaDescription || undefined,
    alternates: { canonical: "/delivery" },
  };
}

export default async function DeliveryPage() {
  const page = await requirePageEnabled("DELIVERY");
  const [options, media] = await Promise.all([
    getActiveDeliveryOptions(),
    getMediaSlotUrls(),
  ]);

  return (
    <>
      <PageHero
        eyebrow="Delivery"
        title={page.headline || page.label}
        intro={page.intro}
        imageUrl={media["capa-delivery"]}
      />

      <div className="site-container py-16 sm:py-20">
        {options.length === 0 ? (
          <p className="rounded-[var(--card-radius)] border border-dashed border-[rgb(var(--brand-text-rgb)/0.16)] px-6 py-14 text-center text-[var(--brand-muted)]">
            Ainda não há canais de entrega cadastrados. Fale com a gente pelo WhatsApp.
          </p>
        ) : (
          <RevealGroup className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {options.map((option) => (
              <RevealItem key={option.id}>
                <a
                  href={safeExternalUrl(option.url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="surface-card group flex h-full flex-col gap-4 p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_-24px_rgba(28,25,23,0.4)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    {option.logoUrl ? (
                      <span className="relative size-14 shrink-0 overflow-hidden rounded-2xl bg-[rgb(var(--brand-text-rgb)/0.05)]">
                        <Image
                          src={option.logoUrl}
                          alt={option.name}
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                      </span>
                    ) : null}
                    <ArrowUpRight
                      className="size-5 shrink-0 text-[var(--brand-muted)] transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--brand-primary)]"
                      aria-hidden
                    />
                  </div>

                  <div className="space-y-1.5">
                    <h2 className="font-heading text-xl font-semibold">{option.name}</h2>
                    {option.description ? (
                      <p className="text-pretty text-sm leading-relaxed text-[var(--brand-muted)]">
                        {option.description}
                      </p>
                    ) : null}
                  </div>

                  <span className="mt-auto text-sm font-semibold text-[var(--brand-primary)]">
                    Pedir por aqui
                  </span>
                </a>
              </RevealItem>
            ))}
          </RevealGroup>
        )}
      </div>
    </>
  );
}
