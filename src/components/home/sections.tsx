import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock, MapPin, Phone } from "lucide-react";
import type { Category, Location, SocialLink } from "@prisma/client";

import { cn, formatCurrency, safeExternalUrl } from "@/lib/utils";
import { SectionHeading, SiteButton } from "@/components/site/blocks";
import { Reveal, RevealGroup, RevealItem } from "@/components/site/motion";
import { SocialIcon } from "@/components/site/social-icon";
import type {
  AboutConfig,
  BannerConfig,
  CategoriesConfig,
  PublicCategory,
  PublicProduct,
  DeliveryCtaConfig,
  GalleryConfig,
  LocationsConfig,
  SectionAlign,
  SectionHeightValue,
  SocialConfig,
} from "@/lib/types";

const SECTION_PADDING = "py-16 sm:py-20 lg:py-24";

const BANNER_HEIGHT: Record<SectionHeightValue, string> = {
  COMPACT: "min-h-[280px] sm:min-h-[320px]",
  MEDIUM: "min-h-[360px] sm:min-h-[440px]",
  TALL: "min-h-[460px] sm:min-h-[560px]",
  FULLSCREEN: "min-h-[90svh]",
};

const BANNER_ALIGN: Record<SectionAlign, string> = {
  LEFT: "items-start text-left",
  CENTER: "items-center text-center",
  RIGHT: "items-end text-right",
};

// ---------------------------------------------------------------------------

export function CategoriesSection({
  title,
  subtitle,
  config,
  categories,
  simpleMenu,
  currency,
  locale,
}: {
  title: string;
  subtitle: string;
  config: CategoriesConfig;
  categories: Category[];
  /** Categoria escolhida na seção, com seus produtos, usada pelo layout SIMPLE. */
  simpleMenu?: PublicCategory | null;
  currency: string;
  locale: string;
}) {
  if (config.layout === "SIMPLE") {
    return (
      <SimpleMenu
        title={title}
        subtitle={subtitle}
        config={config}
        category={simpleMenu ?? null}
        currency={currency}
        locale={locale}
      />
    );
  }

  const items = categories.slice(0, config.limit || 6);
  if (items.length === 0) return null;

  return (
    <section className={SECTION_PADDING}>
      <div className="site-container">
        <SectionHeading
          eyebrow="Cardápio"
          title={title}
          subtitle={subtitle}
          action={
            config.buttonLabel ? (
              <SiteButton href="/cardapio" variant="outline">
                {config.buttonLabel}
              </SiteButton>
            ) : null
          }
        />

        <RevealGroup className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3">
          {items.map((category) => (
            <RevealItem key={category.id}>
              <Link
                href={`/cardapio#categoria-${category.slug}`}
                className="group relative block aspect-[4/5] overflow-hidden rounded-[var(--card-radius)] bg-[var(--brand-secondary)] shadow-card sm:aspect-[4/3]"
              >
                {category.imageUrl ? (
                  <Image
                    src={category.imageUrl}
                    alt={category.imageAlt || category.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 420px"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.07]"
                  />
                ) : null}
                <span
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent"
                />
                <span className="absolute inset-x-0 bottom-0 p-4 text-white sm:p-5">
                  <span className="flex items-center gap-2 font-heading text-lg font-semibold sm:text-xl">
                    {category.name}
                    <ArrowRight
                      className="size-4 -translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
                      aria-hidden
                    />
                  </span>
                  {config.showDescription && category.description ? (
                    <span className="mt-1 line-clamp-2 block text-xs leading-relaxed text-white/75 sm:text-sm">
                      {category.description}
                    </span>
                  ) : null}
                </span>
              </Link>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}

/**
 * Cardápio simples: a categoria escolhida como uma lista de preços, no formato
 * de um cardápio impresso — nome, linha de condução até o preço e a descrição
 * logo abaixo. Em duas colunas no computador, preenchendo de cima para baixo
 * como se lê um cardápio de papel.
 */
function SimpleMenu({
  title,
  subtitle,
  config,
  category,
  currency,
  locale,
}: {
  title: string;
  subtitle: string;
  config: CategoriesConfig;
  category: PublicCategory | null;
  currency: string;
  locale: string;
}) {
  if (!category || category.products.length === 0) return null;

  return (
    <section className={SECTION_PADDING}>
      <div className="site-container">
        <SectionHeading
          eyebrow={category.name}
          title={title}
          subtitle={subtitle}
        />

        <Reveal>
          {/* columns (e não grid) para a leitura descer a primeira coluna
              inteira antes de passar para a segunda, como num cardápio. */}
          <ul className="gap-x-14 lg:columns-2">
            {category.products.map((product) => (
              <li key={product.id} className="break-inside-avoid pb-7 last:pb-0">
                <SimpleMenuItem
                  product={product}
                  currency={currency}
                  locale={locale}
                />
              </li>
            ))}
          </ul>
        </Reveal>

        {config.buttonLabel ? (
          <div className="mt-12 flex justify-center">
            <SiteButton href="/cardapio">{config.buttonLabel}</SiteButton>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function SimpleMenuItem({
  product,
  currency,
  locale,
}: {
  product: PublicProduct;
  currency: string;
  locale: string;
}) {
  const hasPromo = product.promoPrice !== null;

  return (
    <Link
      href={`/cardapio/${product.slug}`}
      className="group block rounded-[var(--card-radius)] outline-none transition-opacity focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] focus-visible:ring-offset-4"
    >
      <span className="flex items-baseline gap-3">
        <span className="font-heading text-lg font-semibold leading-snug text-[var(--brand-text)] transition-colors group-hover:text-[var(--brand-primary)] sm:text-xl">
          {product.name}
        </span>

        {product.soldOut ? (
          <span className="shrink-0 rounded-full bg-[var(--brand-text)]/10 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider text-[var(--brand-muted)]">
            Esgotado
          </span>
        ) : null}

        {/* A linha que liga o nome ao preço: ocupa o espaço que sobrar. */}
        <span
          aria-hidden
          className="mx-1 min-w-6 flex-1 translate-y-[-0.3em] border-b border-dotted border-[var(--brand-text)]/25"
        />

        <span className="flex shrink-0 items-baseline gap-2 tabular-nums">
          {hasPromo ? (
            <span className="text-sm text-[var(--brand-muted)] line-through">
              {formatCurrency(product.price, currency, locale)}
            </span>
          ) : null}
          <span className="font-heading text-lg font-semibold text-[var(--brand-text)] sm:text-xl">
            {formatCurrency(
              hasPromo ? product.promoPrice : product.price,
              currency,
              locale,
            )}
          </span>
        </span>
      </span>

      {product.shortDescription ? (
        <span className="mt-1.5 block max-w-[46ch] text-sm leading-relaxed text-[var(--brand-muted)]">
          {product.shortDescription}
        </span>
      ) : null}
    </Link>
  );
}

// ---------------------------------------------------------------------------

export function BannerSection({
  title,
  subtitle,
  config,
}: {
  title: string;
  subtitle: string;
  config: BannerConfig;
}) {
  return (
    <section className="py-8 sm:py-12">
      <div className="site-container">
        <Reveal>
          <div
            className={cn(
              "relative isolate flex overflow-hidden rounded-[var(--card-radius)] bg-[var(--brand-secondary)] text-white",
              BANNER_HEIGHT[config.height] ?? BANNER_HEIGHT.MEDIUM,
            )}
          >
            {config.imageMobileUrl ? (
              <Image
                src={config.imageMobileUrl}
                alt={config.imageAlt || ""}
                fill
                sizes="100vw"
                className="-z-10 object-cover sm:hidden"
              />
            ) : null}
            {config.imageUrl ? (
              <Image
                src={config.imageUrl}
                alt={config.imageAlt || ""}
                fill
                sizes="(max-width: 1360px) 100vw, 1360px"
                className={cn(
                  "-z-10 object-cover",
                  config.imageMobileUrl && "hidden sm:block",
                )}
              />
            ) : null}
            <span
              aria-hidden
              className="absolute inset-0 -z-10 bg-black"
              style={{ opacity: (config.overlay ?? 40) / 100 }}
            />

            <div
              className={cn(
                "flex w-full flex-col justify-center gap-4 p-7 sm:p-12 lg:p-16",
                BANNER_ALIGN[config.align] ?? BANNER_ALIGN.CENTER,
              )}
            >
              {title ? (
                <h2 className="max-w-2xl text-balance font-heading text-2xl font-semibold leading-tight sm:text-4xl">
                  {title}
                </h2>
              ) : null}
              {subtitle ? (
                <p className="max-w-xl text-pretty text-sm leading-relaxed text-white/80 sm:text-base">
                  {subtitle}
                </p>
              ) : null}
              {config.buttonLabel ? (
                <div className="pt-2">
                  <SiteButton href={config.buttonUrl || "/cardapio"} variant="light">
                    {config.buttonLabel}
                  </SiteButton>
                </div>
              ) : null}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------

export function AboutSection({
  title,
  subtitle,
  config,
}: {
  title: string;
  subtitle: string;
  config: AboutConfig;
}) {
  if (!config.text && !title) return null;

  return (
    <section className={SECTION_PADDING}>
      <div className="site-container">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:items-stretch lg:gap-16">
          {config.imageUrl ? (
            <Reveal
              className={cn(
                "relative aspect-[4/5] overflow-hidden rounded-[var(--card-radius)] shadow-card sm:aspect-[3/2]",
                // No computador a foto deixa de ter proporção fixa e passa a
                // acompanhar a altura do texto ao lado. O piso evita uma faixa
                // fina quando o texto é curto; o teto evita que ela volte a
                // virar uma torre quando alguém escreve muitos parágrafos.
                "lg:aspect-auto lg:h-full lg:max-h-[30rem] lg:min-h-[22rem]",
                config.imagePosition === "RIGHT" && "lg:order-2",
              )}
            >
              <Image
                src={config.imageUrl}
                alt={config.imageAlt || ""}
                fill
                sizes="(max-width: 1024px) 100vw, 620px"
                className="object-cover"
              />
            </Reveal>
          ) : null}

          <Reveal delay={0.08} className="space-y-5">
            {subtitle ? <p className="eyebrow">{subtitle}</p> : null}
            {title ? (
              <h2 className="display-2 text-balance font-heading">{title}</h2>
            ) : null}
            {config.text ? (
              <div className="space-y-4">
                {config.text.split(/\n{2,}/).map((paragraph, index) => (
                  <p
                    key={index}
                    className="text-pretty leading-relaxed text-[var(--brand-muted)]"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            ) : null}
            {config.buttonLabel ? (
              <div className="pt-1">
                <SiteButton href={config.buttonUrl || "/cardapio"} variant="outline">
                  {config.buttonLabel}
                </SiteButton>
              </div>
            ) : null}
          </Reveal>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------

export function GallerySection({
  title,
  subtitle,
  config,
}: {
  title: string;
  subtitle: string;
  config: GalleryConfig;
}) {
  const images = config.images ?? [];
  if (images.length === 0) return null;

  const columns =
    config.columns === 2
      ? "sm:grid-cols-2"
      : config.columns === 4
        ? "sm:grid-cols-3 lg:grid-cols-4"
        : "sm:grid-cols-3";

  return (
    <section className={SECTION_PADDING}>
      <div className="site-container">
        <SectionHeading title={title} subtitle={subtitle} align="center" />
        <RevealGroup className={cn("grid grid-cols-2 gap-3 sm:gap-4", columns)}>
          {images.map((image, index) => (
            <RevealItem key={`${image.url}-${index}`}>
              <div className="group relative aspect-square overflow-hidden rounded-[var(--card-radius)] bg-[rgb(var(--brand-text-rgb)/0.05)]">
                <Image
                  src={image.url}
                  alt={image.alt ?? ""}
                  fill
                  sizes="(max-width: 640px) 50vw, 33vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------

export function DeliveryCtaSection({
  title,
  subtitle,
  config,
}: {
  title: string;
  subtitle: string;
  config: DeliveryCtaConfig;
}) {
  return (
    <section className="py-8 sm:py-12">
      <div className="site-container">
        <Reveal>
          <div className="relative isolate grid overflow-hidden rounded-[var(--card-radius)] bg-[var(--brand-secondary)] text-white lg:grid-cols-2">
            {config.imageUrl ? (
              <div className="relative aspect-[16/9] lg:order-2 lg:aspect-auto lg:min-h-[380px]">
                <Image
                  src={config.imageUrl}
                  alt={config.imageAlt || ""}
                  fill
                  sizes="(max-width: 1024px) 100vw, 680px"
                  className="object-cover"
                />
              </div>
            ) : null}

            <div className="flex flex-col justify-center gap-4 p-7 sm:p-12 lg:p-16">
              {subtitle ? (
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-white/55">
                  {subtitle}
                </p>
              ) : null}
              <h2 className="text-balance font-heading text-2xl font-semibold leading-tight sm:text-4xl">
                {title}
              </h2>
              {config.text ? (
                <p className="max-w-md text-pretty leading-relaxed text-white/75">
                  {config.text}
                </p>
              ) : null}
              {config.buttonLabel ? (
                <div className="pt-2">
                  <SiteButton href={config.buttonUrl || "/delivery"}>
                    {config.buttonLabel}
                  </SiteButton>
                </div>
              ) : null}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------

export function LocationsSection({
  title,
  subtitle,
  config,
  locations,
}: {
  title: string;
  subtitle: string;
  config: LocationsConfig;
  locations: Location[];
}) {
  const items = locations.slice(0, config.limit || 3);
  if (items.length === 0) return null;

  return (
    <section className={SECTION_PADDING}>
      <div className="site-container">
        <SectionHeading
          eyebrow="Unidades"
          title={title}
          subtitle={subtitle}
          action={
            config.buttonLabel ? (
              <SiteButton href="/unidades" variant="outline">
                {config.buttonLabel}
              </SiteButton>
            ) : null
          }
        />

        <RevealGroup className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((location) => (
            <RevealItem key={location.id}>
              <LocationCard location={location} />
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}

export function LocationCard({ location }: { location: Location }) {
  return (
    <article className="surface-card group h-full overflow-hidden shadow-card">
      {location.imageUrl ? (
        <div className="relative aspect-[16/10] overflow-hidden">
          <Image
            src={location.imageUrl}
            alt={location.imageAlt || location.name}
            fill
            sizes="(max-width: 640px) 100vw, 420px"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>
      ) : null}

      <div className="space-y-3 p-5">
        <h3 className="font-heading text-lg font-semibold">{location.name}</h3>

        <ul className="space-y-2 text-sm text-[var(--brand-muted)]">
          <li className="flex gap-2">
            <MapPin className="mt-0.5 size-4 shrink-0 opacity-60" aria-hidden />
            <span>
              {location.address}
              {location.city ? `, ${location.city}` : ""}
            </span>
          </li>
          {location.openingHours ? (
            <li className="flex gap-2">
              <Clock className="mt-0.5 size-4 shrink-0 opacity-60" aria-hidden />
              <span className="whitespace-pre-line">{location.openingHours}</span>
            </li>
          ) : null}
          {location.phone ? (
            <li className="flex gap-2">
              <Phone className="mt-0.5 size-4 shrink-0 opacity-60" aria-hidden />
              <a
                href={`tel:${location.phone.replace(/\D/g, "")}`}
                className="transition-colors hover:text-[var(--brand-primary)]"
              >
                {location.phone}
              </a>
            </li>
          ) : null}
        </ul>

        <div className="flex flex-wrap gap-2 pt-1">
          {location.mapsUrl ? (
            <a
              href={safeExternalUrl(location.mapsUrl)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-[var(--brand-primary)] underline-offset-4 hover:underline"
            >
              Como chegar
            </a>
          ) : null}
          {location.deliveryUrl ? (
            <a
              href={safeExternalUrl(location.deliveryUrl)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-[var(--brand-primary)] underline-offset-4 hover:underline"
            >
              Pedir desta unidade
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}

// ---------------------------------------------------------------------------

export function SocialSection({
  title,
  subtitle,
  config,
  socials,
}: {
  title: string;
  subtitle: string;
  config: SocialConfig;
  socials: SocialLink[];
}) {
  const images = config.images ?? [];
  if (socials.length === 0 && images.length === 0) return null;

  return (
    <section className={SECTION_PADDING}>
      <div className="site-container">
        <SectionHeading
          eyebrow={config.handle || undefined}
          title={title}
          subtitle={subtitle || config.text}
          align="center"
        />

        {socials.length > 0 ? (
          <ul className="mb-10 flex flex-wrap items-center justify-center gap-3">
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
        ) : null}

        {images.length > 0 ? (
          <RevealGroup className="grid grid-cols-3 gap-2 sm:gap-3 lg:grid-cols-6">
            {images.slice(0, 6).map((image, index) => (
              <RevealItem key={`${image.url}-${index}`}>
                <div className="relative aspect-square overflow-hidden rounded-[calc(var(--card-radius)/1.6)] bg-[rgb(var(--brand-text-rgb)/0.05)]">
                  <Image
                    src={image.url}
                    alt={image.alt ?? ""}
                    fill
                    sizes="(max-width: 1024px) 33vw, 16vw"
                    className="object-cover transition-transform duration-700 hover:scale-110"
                  />
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        ) : null}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------

export function FeaturedProductsSection({
  title,
  subtitle,
  buttonLabel,
  buttonUrl,
  children,
}: {
  title: string;
  subtitle: string;
  buttonLabel: string;
  buttonUrl: string;
  children: React.ReactNode;
}) {
  return (
    <section className={SECTION_PADDING}>
      <div className="site-container">
        <SectionHeading
          eyebrow="Destaques"
          title={title}
          subtitle={subtitle}
          action={
            buttonLabel ? (
              <SiteButton href={buttonUrl || "/cardapio"} variant="outline">
                {buttonLabel}
              </SiteButton>
            ) : null
          }
        />
        {children}
      </div>
    </section>
  );
}
