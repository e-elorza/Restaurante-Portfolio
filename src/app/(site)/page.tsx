import type { Metadata } from "next";

import { HomeSections } from "@/components/home/home-sections";
import { SiteButton } from "@/components/site/blocks";
import { getVisibleHomeSections } from "@/lib/data/home";
import { getPage, isPageEnabled } from "@/lib/data/pages";
import { getRestaurantSettings, getSeoSettings } from "@/lib/data/settings";

export async function generateMetadata(): Promise<Metadata> {
  const [page, seo] = await Promise.all([getPage("HOME"), getSeoSettings()]);
  return {
    title: page.metaTitle || seo.siteTitle,
    description: page.metaDescription || seo.description,
    openGraph: page.socialImageUrl
      ? { images: [{ url: page.socialImageUrl }] }
      : undefined,
    alternates: { canonical: "/" },
  };
}

export default async function HomePage() {
  const [sections, settings, deliveryEnabled] = await Promise.all([
    getVisibleHomeSections(),
    getRestaurantSettings(),
    isPageEnabled("DELIVERY"),
  ]);

  if (sections.length === 0) {
    return <EmptyHome name={settings.name} />;
  }

  return (
    <HomeSections
      sections={sections}
      settings={settings}
      deliveryEnabled={deliveryEnabled}
    />
  );
}

/**
 * Primeiro acesso: a Home ainda não tem nenhuma seção configurada.
 *
 * O texto é escrito para o cliente, não para o administrador: esta é uma
 * página pública, então não mencionamos nem damos atalho para o painel.
 */
function EmptyHome({ name }: { name: string }) {
  return (
    <section className="flex min-h-[80svh] items-center bg-[var(--brand-secondary)] text-white">
      <div className="site-container py-24 text-center">
        <p className="eyebrow mb-4 text-white/60">Bem-vindo</p>
        <h1 className="display-1 mx-auto max-w-3xl text-balance font-heading">{name}</h1>
        <p className="mx-auto mt-5 max-w-xl text-pretty text-white/70">
          Estamos preparando esta página. Enquanto isso, o cardápio completo já
          está disponível.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <SiteButton href="/cardapio">Ver o cardápio</SiteButton>
        </div>
      </div>
    </section>
  );
}
