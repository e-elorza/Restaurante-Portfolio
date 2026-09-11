import type { Metadata } from "next";

import { LocationCard } from "@/components/home/sections";
import { PageHero } from "@/components/site/blocks";
import { RevealGroup, RevealItem } from "@/components/site/motion";
import { getActiveLocations, getMediaSlotUrls } from "@/lib/data/content";
import { getPage, requirePageEnabled } from "@/lib/data/pages";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage("LOCATIONS");
  return {
    title: page.metaTitle || page.label,
    description: page.metaDescription || undefined,
    alternates: { canonical: "/unidades" },
  };
}

export default async function LocationsPage() {
  const page = await requirePageEnabled("LOCATIONS");
  const [locations, media] = await Promise.all([
    getActiveLocations(),
    getMediaSlotUrls(),
  ]);

  return (
    <>
      <PageHero
        eyebrow="Unidades"
        title={page.headline || page.label}
        intro={page.intro}
        imageUrl={media["capa-unidades"]}
      />

      <div className="site-container py-16 sm:py-20">
        {locations.length === 0 ? (
          <p className="rounded-[var(--card-radius)] border border-dashed border-[rgb(var(--brand-text-rgb)/0.16)] px-6 py-14 text-center text-[var(--brand-muted)]">
            Nenhuma unidade cadastrada ainda.
          </p>
        ) : (
          <RevealGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {locations.map((location) => (
              <RevealItem key={location.id}>
                <LocationCard location={location} />
              </RevealItem>
            ))}
          </RevealGroup>
        )}
      </div>
    </>
  );
}
