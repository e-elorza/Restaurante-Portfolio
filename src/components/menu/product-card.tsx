"use client";

import * as React from "react";
import Image from "next/image";
import { ImageOff } from "lucide-react";

import { cn, formatCurrency } from "@/lib/utils";
import type { MenuEmphasis } from "@/lib/menu-layout";
import type { MenuProduct } from "@/components/menu/types";

export function ProductBadges({ product }: { product: MenuProduct }) {
  const badges: Array<{ label: string; className: string }> = [];

  if (product.soldOut) {
    badges.push({ label: "Esgotado", className: "bg-stone-900/85 text-white" });
  }
  if (product.promoPrice !== null && !product.soldOut) {
    badges.push({ label: "Promoção", className: "bg-[var(--brand-primary)] text-white" });
  }
  if (product.isNew) {
    badges.push({ label: "Novidade", className: "bg-[var(--brand-accent)] text-stone-900" });
  }
  if (product.bestSeller) {
    badges.push({ label: "Mais vendido", className: "bg-white/95 text-stone-900" });
  }

  if (badges.length === 0) return null;

  return (
    <div className="pointer-events-none absolute left-3 top-3 z-10 flex flex-wrap gap-1.5">
      {badges.map((badge) => (
        <span
          key={badge.label}
          className={cn(
            "rounded-full px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wider shadow-sm",
            badge.className,
          )}
        >
          {badge.label}
        </span>
      ))}
    </div>
  );
}

export function ProductPrice({
  product,
  currency,
  locale,
  className,
}: {
  product: MenuProduct;
  currency: string;
  locale: string;
  className?: string;
}) {
  const hasPromo = product.promoPrice !== null;
  return (
    <p className={cn("flex items-baseline gap-2", className)}>
      <span className="font-heading text-lg font-semibold tracking-tight sm:text-xl">
        {formatCurrency(hasPromo ? product.promoPrice : product.price, currency, locale)}
      </span>
      {hasPromo ? (
        <span className="text-sm line-through opacity-55">
          {formatCurrency(product.price, currency, locale)}
        </span>
      ) : null}
    </p>
  );
}

function ImagePlaceholder({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center bg-[rgb(var(--brand-text-rgb)/0.05)]",
        className,
      )}
    >
      <ImageOff
        className="size-7 text-[rgb(var(--brand-text-rgb)/0.25)]"
        aria-hidden
      />
    </div>
  );
}

export function ProductCard({
  product,
  emphasis,
  currency,
  locale,
  onOpen,
}: {
  product: MenuProduct;
  emphasis: MenuEmphasis;
  currency: string;
  locale: string;
  onOpen: (product: MenuProduct) => void;
}) {
  const horizontal = emphasis === "hero";

  return (
    <article className="group h-full">
      <button
        type="button"
        onClick={() => onOpen(product)}
        aria-label={`Ver detalhes de ${product.name}`}
        className={cn(
          "surface-card relative flex h-full w-full overflow-hidden text-left shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_-24px_rgba(28,25,23,0.45)]",
          horizontal ? "flex-col md:flex-row md:items-stretch" : "flex-col",
          product.soldOut && "opacity-85",
        )}
      >
        <div
          className={cn(
            "relative overflow-hidden",
            horizontal
              ? "aspect-[4/3] w-full md:aspect-auto md:w-[52%]"
              : emphasis === "large"
                ? "aspect-[4/3] w-full"
                : "aspect-[4/3] w-full",
          )}
        >
          <ProductBadges product={product} />
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.imageAlt || product.name}
              fill
              sizes={
                horizontal
                  ? "(max-width: 768px) 100vw, 640px"
                  : "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 420px"
              }
              className={cn(
                "object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]",
                product.soldOut && "grayscale-[0.55]",
              )}
            />
          ) : (
            <ImagePlaceholder />
          )}
        </div>

        <div
          className={cn(
            "flex flex-1 flex-col gap-2 p-4 sm:p-5",
            horizontal && "justify-center md:p-8 lg:p-10",
          )}
        >
          {product.category && horizontal ? (
            <p className="eyebrow">{product.category.name}</p>
          ) : null}

          <h3
            className={cn(
              "font-heading font-semibold leading-tight",
              horizontal ? "text-2xl sm:text-3xl lg:text-4xl" : emphasis === "large" ? "text-xl sm:text-2xl" : "text-base sm:text-lg",
            )}
          >
            {product.name}
          </h3>

          {product.shortDescription ? (
            <p
              className={cn(
                "text-pretty leading-relaxed text-[var(--brand-muted)]",
                horizontal ? "max-w-prose text-base" : "line-clamp-2 text-sm",
              )}
            >
              {product.shortDescription}
            </p>
          ) : null}

          {horizontal && product.tags.length > 0 ? (
            <ul className="flex flex-wrap gap-1.5 pt-1">
              {product.tags.slice(0, 4).map((tag) => (
                <li
                  key={tag}
                  className="rounded-full border border-[rgb(var(--brand-text-rgb)/0.14)] px-2.5 py-0.5 text-xs"
                >
                  {tag}
                </li>
              ))}
            </ul>
          ) : null}

          <div className="mt-auto flex items-center justify-between gap-3 pt-2">
            <ProductPrice product={product} currency={currency} locale={locale} />
            <span
              className="text-xs font-semibold uppercase tracking-wider text-[var(--brand-primary)] opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100 sm:text-sm"
              aria-hidden
            >
              Ver mais
            </span>
          </div>
        </div>
      </button>
    </article>
  );
}
