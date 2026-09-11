import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Leaf, TriangleAlert } from "lucide-react";

import { ProductShowcase } from "@/components/menu/product-showcase";
import { SiteButton } from "@/components/site/blocks";
import { Reveal } from "@/components/site/motion";
import { getMenu, getProductBySlug } from "@/lib/data/menu";
import { isPageEnabled } from "@/lib/data/pages";
import { getRestaurantSettings } from "@/lib/data/settings";
import { resolveOrderLink } from "@/lib/order";
import { formatCurrency } from "@/lib/utils";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Produto não encontrado" };

  return {
    title: product.name,
    description: product.shortDescription || product.description.slice(0, 180),
    openGraph: product.imageUrl
      ? { images: [{ url: product.imageUrl }], title: product.name }
      : { title: product.name },
    alternates: { canonical: `/cardapio/${product.slug}` },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const [product, settings, deliveryEnabled] = await Promise.all([
    getProductBySlug(slug),
    getRestaurantSettings(),
    isPageEnabled("DELIVERY"),
  ]);

  if (!product) notFound();

  const orderLink = resolveOrderLink(product, settings, deliveryEnabled);
  const hasPromo = product.promoPrice !== null;

  const menu = await getMenu();
  const related = menu
    .find((category) => category.id === product.categoryId)
    ?.products.filter((item) => item.id !== product.id)
    .slice(0, 3)
    .map((item) => ({
      ...item,
      orderLink: resolveOrderLink(item, settings, deliveryEnabled),
    }));

  return (
    <>
      <article className="site-container pb-20 pt-28 sm:pt-36">
        <nav aria-label="Você está em" className="mb-6 flex flex-wrap items-center gap-1 text-sm text-[var(--brand-muted)]">
          <Link href="/cardapio" className="transition-colors hover:text-[var(--brand-primary)]">
            Cardápio
          </Link>
          {product.category ? (
            <>
              <ChevronRight className="size-3.5" aria-hidden />
              <Link
                href={`/cardapio#categoria-${product.category.slug}`}
                className="transition-colors hover:text-[var(--brand-primary)]"
              >
                {product.category.name}
              </Link>
            </>
          ) : null}
          <ChevronRight className="size-3.5" aria-hidden />
          <span className="text-[var(--brand-text)]">{product.name}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-2 lg:gap-14">
          <Reveal className="space-y-3">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--card-radius)] bg-[rgb(var(--brand-text-rgb)/0.05)] shadow-card">
              {product.imageUrl ? (
                <Image
                  src={product.imageUrl}
                  alt={product.imageAlt || product.name}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 640px"
                  className="object-cover"
                />
              ) : null}
            </div>

            {product.images.length > 0 ? (
              <div className="grid grid-cols-4 gap-3">
                {product.images.slice(0, 4).map((image) => (
                  <div
                    key={image.id}
                    className="relative aspect-square overflow-hidden rounded-[calc(var(--card-radius)/1.6)] bg-[rgb(var(--brand-text-rgb)/0.05)]"
                  >
                    <Image
                      src={image.url}
                      alt={image.alt || product.name}
                      fill
                      sizes="160px"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            ) : null}
          </Reveal>

          <Reveal delay={0.08} className="space-y-6">
            <div className="space-y-3">
              {product.category ? <p className="eyebrow">{product.category.name}</p> : null}
              <h1 className="display-2 text-balance font-heading">{product.name}</h1>
              {product.shortDescription ? (
                <p className="lead text-pretty">{product.shortDescription}</p>
              ) : null}
            </div>

            <p className="flex items-baseline gap-3">
              <span className="font-heading text-3xl font-semibold">
                {formatCurrency(
                  hasPromo ? product.promoPrice : product.price,
                  settings.currency,
                  settings.locale,
                )}
              </span>
              {hasPromo ? (
                <span className="text-lg text-[var(--brand-muted)] line-through">
                  {formatCurrency(product.price, settings.currency, settings.locale)}
                </span>
              ) : null}
            </p>

            {product.soldOut ? (
              <p className="rounded-[var(--card-radius)] bg-[rgb(var(--brand-text-rgb)/0.06)] px-4 py-3 text-sm">
                Este item está esgotado no momento.
              </p>
            ) : orderLink ? (
              <SiteButton href={orderLink}>{settings.orderLabel}</SiteButton>
            ) : null}

            {product.description ? (
              <div className="space-y-3 border-t border-[rgb(var(--brand-text-rgb)/0.1)] pt-6">
                {product.description.split(/\n{2,}/).map((paragraph, index) => (
                  <p key={index} className="text-pretty leading-relaxed text-[var(--brand-muted)]">
                    {paragraph}
                  </p>
                ))}
              </div>
            ) : null}

            {product.ingredients.length > 0 ? (
              <InfoBlock icon={<Leaf className="size-4" aria-hidden />} title="Ingredientes">
                {product.ingredients.join(" · ")}
              </InfoBlock>
            ) : null}

            {product.allergens.length > 0 ? (
              <InfoBlock
                icon={<TriangleAlert className="size-4" aria-hidden />}
                title="Contém alergênicos"
                tone="warning"
              >
                {product.allergens.join(" · ")}
              </InfoBlock>
            ) : null}

            {product.nutrition ? (
              <InfoBlock title="Informação nutricional">
                {[
                  product.nutrition.calories && `Calorias: ${product.nutrition.calories}`,
                  product.nutrition.protein && `Proteínas: ${product.nutrition.protein}`,
                  product.nutrition.carbs && `Carboidratos: ${product.nutrition.carbs}`,
                  product.nutrition.fat && `Gorduras: ${product.nutrition.fat}`,
                  product.nutrition.notes,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </InfoBlock>
            ) : null}

            {product.tags.length > 0 ? (
              <ul className="flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <li
                    key={tag}
                    className="rounded-full border border-[rgb(var(--brand-text-rgb)/0.14)] px-3 py-1 text-xs"
                  >
                    {tag}
                  </li>
                ))}
              </ul>
            ) : null}
          </Reveal>
        </div>
      </article>

      {related && related.length > 0 ? (
        <section className="site-container pb-24">
          <h2 className="mb-8 font-heading text-2xl font-semibold sm:text-3xl">
            Combina com
          </h2>
          <ProductShowcase
            products={related}
            currency={settings.currency}
            locale={settings.locale}
            orderLabel={settings.orderLabel}
          />
        </section>
      ) : null}
    </>
  );
}

function InfoBlock({
  title,
  children,
  icon,
  tone = "default",
}: {
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  tone?: "default" | "warning";
}) {
  return (
    <div
      className={
        tone === "warning"
          ? "rounded-[var(--card-radius)] bg-amber-50 px-4 py-3 text-amber-900"
          : "rounded-[var(--card-radius)] bg-[rgb(var(--brand-text-rgb)/0.04)] px-4 py-3"
      }
    >
      <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider opacity-70">
        {icon}
        {title}
      </p>
      <p className="text-sm leading-relaxed">{children}</p>
    </div>
  );
}
