import type { Metadata } from "next";

import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { WhatsappButton } from "@/components/site/whatsapp-button";
import { getFooterNavigation, getNavigation } from "@/lib/data/pages";
import {
  getActiveSocialLinks,
  getAppearance,
  getFooterSettings,
  getHeaderSettings,
  getRestaurantSettings,
} from "@/lib/data/settings";
import { getMediaSlotUrls } from "@/lib/data/content";
import { googleFontsHref, themeStyleSheet } from "@/lib/theme";
import { safeExternalUrl, whatsappLink } from "@/lib/utils";

/**
 * O conteúdo do site é editável a qualquer momento pelo painel, por isso as
 * páginas são renderizadas a cada requisição — o que o gerente salva aparece
 * imediatamente, sem precisar de novo deploy.
 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default async function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [
    navigation,
    footerNavigation,
    settings,
    appearance,
    header,
    footer,
    socials,
    media,
  ] = await Promise.all([
    getNavigation(),
    getFooterNavigation(),
    getRestaurantSettings(),
    getAppearance(),
    getHeaderSettings(),
    getFooterSettings(),
    getActiveSocialLinks(),
    getMediaSlotUrls(),
  ]);

  const logoUrl = header.logoUrl || media["logo-principal"] || settings.logoUrl || null;
  const footerLogoUrl = footer.logoUrl || media["logo-rodape"] || logoUrl;
  const whatsapp = whatsappLink(settings.whatsapp, settings.whatsappMessage);

  const ctaUrl = header.ctaUrl || whatsapp || settings.orderUrl || "";
  const cta =
    header.ctaEnabled && header.ctaLabel && ctaUrl
      ? { label: header.ctaLabel, url: safeExternalUrl(ctaUrl) }
      : null;

  return (
    <div className="site-body flex min-h-screen flex-col">
      {/* Fontes escolhidas em Admin > Aparência */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link
        rel="stylesheet"
        href={googleFontsHref([appearance.fontHeading, appearance.fontBody])}
      />
      <style
        // Variáveis de cor/tipografia controladas pelo painel
        dangerouslySetInnerHTML={{ __html: themeStyleSheet(appearance) }}
      />
      {/* Sem JavaScript as animações de entrada não acontecem — o conteúdo
          precisa aparecer mesmo assim. */}
      <noscript>
        <style>{"[data-reveal]{opacity:1!important;transform:none!important}"}</style>
      </noscript>

      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-[var(--brand-primary)] focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Pular para o conteúdo
      </a>

      <SiteHeader
        navigation={navigation}
        restaurantName={settings.name}
        logoUrl={logoUrl}
        showLogoText={header.showLogoText}
        transparentOnTop={header.transparentOnTop}
        sticky={header.sticky}
        cta={cta}
      />

      <main id="conteudo" className="flex-1">
        {children}
      </main>

      <SiteFooter
        navigation={footerNavigation}
        footer={{ ...footer, logoUrl: footerLogoUrl }}
        settings={settings}
        socials={socials}
        backgroundUrl={media["rodape-imagem"]}
      />

      {settings.whatsappEnabled && whatsapp ? (
        <WhatsappButton href={whatsapp} label="Falar no WhatsApp" />
      ) : null}
    </div>
  );
}
