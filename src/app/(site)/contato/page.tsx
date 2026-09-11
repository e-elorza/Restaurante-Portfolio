import type { Metadata } from "next";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";

import { PageHero } from "@/components/site/blocks";
import { Reveal, RevealGroup, RevealItem } from "@/components/site/motion";
import { SocialIcon } from "@/components/site/social-icon";
import { getMediaSlotUrls } from "@/lib/data/content";
import { getPage, requirePageEnabled } from "@/lib/data/pages";
import { getActiveSocialLinks, getRestaurantSettings } from "@/lib/data/settings";
import { onlyDigits, safeExternalUrl, whatsappLink } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage("CONTACT");
  return {
    title: page.metaTitle || page.label,
    description: page.metaDescription || undefined,
    alternates: { canonical: "/contato" },
  };
}

export default async function ContactPage() {
  const page = await requirePageEnabled("CONTACT");
  const [settings, socials, media] = await Promise.all([
    getRestaurantSettings(),
    getActiveSocialLinks(),
    getMediaSlotUrls(),
  ]);

  const whatsapp = whatsappLink(settings.whatsapp, settings.whatsappMessage);

  const channels = [
    settings.whatsapp && {
      icon: <MessageCircle className="size-5" aria-hidden />,
      label: "WhatsApp",
      value: settings.whatsapp,
      href: whatsapp,
      cta: "Chamar no WhatsApp",
    },
    settings.phone && {
      icon: <Phone className="size-5" aria-hidden />,
      label: "Telefone",
      value: settings.phone,
      href: `tel:${onlyDigits(settings.phone)}`,
      cta: "Ligar agora",
    },
    settings.email && {
      icon: <Mail className="size-5" aria-hidden />,
      label: "E-mail",
      value: settings.email,
      href: `mailto:${settings.email}`,
      cta: "Enviar e-mail",
    },
  ].filter(Boolean) as Array<{
    icon: React.ReactNode;
    label: string;
    value: string;
    href: string;
    cta: string;
  }>;

  return (
    <>
      <PageHero
        eyebrow="Contato"
        title={page.headline || page.label}
        intro={page.intro}
        imageUrl={media["capa-contato"]}
      />

      <div className="site-container py-16 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <div className="space-y-6">
            <RevealGroup className="grid gap-4 sm:grid-cols-2">
              {channels.map((channel) => (
                <RevealItem key={channel.label}>
                  <a
                    href={channel.href}
                    target={channel.href.startsWith("http") ? "_blank" : undefined}
                    rel={channel.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="surface-card group flex h-full flex-col gap-2 p-5 shadow-card transition-all duration-300 hover:-translate-y-1"
                  >
                    <span className="flex size-11 items-center justify-center rounded-full bg-[rgb(var(--brand-primary-rgb)/0.1)] text-[var(--brand-primary)]">
                      {channel.icon}
                    </span>
                    <span className="mt-1 text-xs font-semibold uppercase tracking-wider text-[var(--brand-muted)]">
                      {channel.label}
                    </span>
                    <span className="font-heading text-lg font-semibold">
                      {channel.value}
                    </span>
                    <span className="mt-auto pt-2 text-sm font-semibold text-[var(--brand-primary)]">
                      {channel.cta}
                    </span>
                  </a>
                </RevealItem>
              ))}
            </RevealGroup>

            {socials.length > 0 ? (
              <Reveal className="space-y-3">
                <h2 className="font-heading text-xl font-semibold">Nossas redes</h2>
                <ul className="flex flex-wrap gap-2">
                  {socials.map((social) => (
                    <li key={social.id}>
                      <a
                        href={safeExternalUrl(social.url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-full border border-[rgb(var(--brand-text-rgb)/0.16)] px-4 py-2 text-sm font-medium transition-all hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)]"
                      >
                        <SocialIcon network={social.network} className="size-4" />
                        {social.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </Reveal>
            ) : null}
          </div>

          <Reveal delay={0.1} className="space-y-6">
            {settings.address ? (
              <div className="surface-card space-y-2 p-6 shadow-card">
                <h2 className="flex items-center gap-2 font-heading text-lg font-semibold">
                  <MapPin className="size-5 text-[var(--brand-primary)]" aria-hidden />
                  Endereço
                </h2>
                <p className="text-[var(--brand-muted)]">
                  {settings.address}
                  {settings.city ? (
                    <>
                      <br />
                      {settings.city}
                    </>
                  ) : null}
                </p>
              </div>
            ) : null}

            {settings.openingHours ? (
              <div className="surface-card space-y-2 p-6 shadow-card">
                <h2 className="flex items-center gap-2 font-heading text-lg font-semibold">
                  <Clock className="size-5 text-[var(--brand-primary)]" aria-hidden />
                  Horário de funcionamento
                </h2>
                <p className="whitespace-pre-line text-[var(--brand-muted)]">
                  {settings.openingHours}
                </p>
              </div>
            ) : null}
          </Reveal>
        </div>
      </div>
    </>
  );
}
