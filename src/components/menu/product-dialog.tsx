"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink, Leaf, TriangleAlert } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { ProductPrice } from "@/components/menu/product-card";
import type { MenuProduct } from "@/components/menu/types";
import { cn } from "@/lib/utils";

/** Detalhe do produto em uma janela elegante, sem sair do cardápio. */
export function ProductDialog({
  product,
  currency,
  locale,
  orderLabel,
  onClose,
}: {
  product: MenuProduct | null;
  currency: string;
  locale: string;
  orderLabel: string;
  onClose: () => void;
}) {
  const open = product !== null;

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? null : onClose())}>
      <DialogContent className="max-h-[92svh] max-w-3xl overflow-y-auto border-0 bg-[var(--brand-surface)] p-0 text-[var(--brand-text)]">
        {product ? (
          <div className="grid md:grid-cols-2">
            <div className="relative aspect-[4/3] w-full md:aspect-auto md:h-full md:min-h-[420px]">
              {product.imageUrl ? (
                <Image
                  src={product.imageUrl}
                  alt={product.imageAlt || product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 480px"
                  className="object-cover"
                />
              ) : (
                <div className="h-full w-full bg-[rgb(var(--brand-text-rgb)/0.05)]" />
              )}
              {product.soldOut ? (
                <span className="absolute left-4 top-4 rounded-full bg-stone-900/85 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white">
                  Esgotado
                </span>
              ) : null}
            </div>

            <div className="flex flex-col gap-4 p-5 sm:p-7">
              {product.category ? (
                <p className="eyebrow">{product.category.name}</p>
              ) : null}

              <DialogTitle className="font-heading text-2xl font-semibold leading-tight sm:text-3xl">
                {product.name}
              </DialogTitle>

              <DialogDescription className="sr-only">
                Detalhes do produto {product.name}
              </DialogDescription>

              {product.description || product.shortDescription ? (
                <p className="text-pretty text-sm leading-relaxed text-[var(--brand-muted)] sm:text-base">
                  {product.description || product.shortDescription}
                </p>
              ) : null}

              {product.tags.length > 0 ? (
                <ul className="flex flex-wrap gap-1.5">
                  {product.tags.map((tag) => (
                    <li
                      key={tag}
                      className="rounded-full border border-[rgb(var(--brand-text-rgb)/0.14)] px-2.5 py-0.5 text-xs"
                    >
                      {tag}
                    </li>
                  ))}
                </ul>
              ) : null}

              {product.ingredients.length > 0 ? (
                <DetailBlock
                  icon={<Leaf className="size-4" aria-hidden />}
                  title="Ingredientes"
                >
                  {product.ingredients.join(" · ")}
                </DetailBlock>
              ) : null}

              {product.allergens.length > 0 ? (
                <DetailBlock
                  icon={<TriangleAlert className="size-4" aria-hidden />}
                  title="Contém alergênicos"
                  tone="warning"
                >
                  {product.allergens.join(" · ")}
                </DetailBlock>
              ) : null}

              {product.nutrition ? (
                <DetailBlock title="Informação nutricional">
                  {[
                    product.nutrition.calories && `Calorias: ${product.nutrition.calories}`,
                    product.nutrition.protein && `Proteínas: ${product.nutrition.protein}`,
                    product.nutrition.carbs && `Carboidratos: ${product.nutrition.carbs}`,
                    product.nutrition.fat && `Gorduras: ${product.nutrition.fat}`,
                    product.nutrition.notes,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </DetailBlock>
              ) : null}

              <div className="mt-auto space-y-3 pt-2">
                <ProductPrice
                  product={product}
                  currency={currency}
                  locale={locale}
                  className="text-xl"
                />

                {product.soldOut ? (
                  <p className="rounded-[var(--card-radius)] bg-[rgb(var(--brand-text-rgb)/0.06)] px-4 py-3 text-sm">
                    Este item está esgotado hoje. Volte amanhã!
                  </p>
                ) : product.orderLink ? (
                  <OrderButton href={product.orderLink} label={orderLabel} />
                ) : null}

                <Link
                  href={`/cardapio/${product.slug}`}
                  className="inline-block text-xs font-medium text-[var(--brand-muted)] underline underline-offset-4 transition-colors hover:text-[var(--brand-primary)]"
                >
                  Abrir a página deste produto
                </Link>
              </div>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function OrderButton({ href, label }: { href: string; label: string }) {
  const external = href.startsWith("http");
  const className = "btn-primary w-full";

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {label}
        <ExternalLink className="size-4" aria-hidden />
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {label}
    </Link>
  );
}

function DetailBlock({
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
  if (!children) return null;
  return (
    <div
      className={cn(
        "rounded-[var(--card-radius)] px-4 py-3",
        tone === "warning"
          ? "bg-amber-50 text-amber-900"
          : "bg-[rgb(var(--brand-text-rgb)/0.04)]",
      )}
    >
      <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider opacity-70">
        {icon}
        {title}
      </p>
      <p className="text-sm leading-relaxed">{children}</p>
    </div>
  );
}
