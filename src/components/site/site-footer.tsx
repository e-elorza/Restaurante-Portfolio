import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import type { FooterSettings, RestaurantSettings, SocialLink } from "@prisma/client";

import { SocialIcon } from "@/components/site/social-icon";
import type { NavigationItem } from "@/lib/types";
import { safeExternalUrl } from "@/lib/utils";

export function SiteFooter({
  navigation,
  footer,
  settings,
  socials,
  backgroundUrl,
}: {
  navigation: NavigationItem[];
  footer: FooterSettings;
  settings: RestaurantSettings;
  socials: SocialLink[];
  backgroundUrl?: string | null;
}) {
  const year = new Date().getFullYear();
  const copyright =
    footer.copyright || `© ${year} ${settings.name}. Todos os direitos reservados.`;

  return (
    <footer className="relative mt-24 overflow-hidden bg-[var(--brand-secondary)] text-white/80">
      {backgroundUrl ? (
        <div aria-hidden className="absolute inset-0 opacity-[0.14]">
          <Image
            src={backgroundUrl}
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
          />
        </div>
      ) : null}

      <div className="site-container relative py-14 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr]">
          <div className="space-y-5">
            {footer.logoUrl ? (
              <Image
                src={footer.logoUrl}
                alt={settings.name}
                width={220}
                height={64}
                unoptimized
                className="h-10 w-auto"
              />
            ) : (
              <p className="font-heading text-2xl text-white">{settings.name}</p>
            )}
            {footer.about ? (
              <p className="max-w-sm text-sm leading-relaxed">{footer.about}</p>
            ) : null}

            {socials.length > 0 && footer.showSocial ? (
              <ul className="flex flex-wrap gap-2 pt-1">
                {socials.map((social) => (
                  <li key={social.id}>
                    <a
                      href={safeExternalUrl(social.url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                      className="inline-flex size-10 items-center justify-center rounded-full border border-white/20 text-white transition-colors hover:border-white/60 hover:bg-white/10"
                    >
                      <SocialIcon network={social.network} className="size-4" />
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <nav aria-label="Links do rodapé">
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-white/50">
              Navegação
            </h2>
            <ul className="space-y-2.5 text-sm">
              {navigation.map((item) => (
                <li key={item.key}>
                  <Link
                    href={item.path}
                    className="transition-colors hover:text-white"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-white/50">
              Contato
            </h2>
            <ul className="space-y-3 text-sm">
              {footer.address || settings.address ? (
                <li className="flex gap-2.5">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-white/50" aria-hidden />
                  <span>{footer.address || settings.address}</span>
                </li>
              ) : null}
              {footer.phone || settings.phone ? (
                <li className="flex gap-2.5">
                  <Phone className="mt-0.5 size-4 shrink-0 text-white/50" aria-hidden />
                  <a
                    href={`tel:${(footer.phone || settings.phone || "").replace(/\D/g, "")}`}
                    className="transition-colors hover:text-white"
                  >
                    {footer.phone || settings.phone}
                  </a>
                </li>
              ) : null}
              {settings.email ? (
                <li className="flex gap-2.5">
                  <Mail className="mt-0.5 size-4 shrink-0 text-white/50" aria-hidden />
                  <a
                    href={`mailto:${settings.email}`}
                    className="break-all transition-colors hover:text-white"
                  >
                    {settings.email}
                  </a>
                </li>
              ) : null}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <p>{copyright}</p>
          {settings.tagline ? <p className="italic">{settings.tagline}</p> : null}
        </div>
      </div>
    </footer>
  );
}
