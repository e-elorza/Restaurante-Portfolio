"use client";

import * as React from "react";

import { getMenuGridLayout } from "@/lib/menu-layout";
import { ProductCard } from "@/components/menu/product-card";
import { RevealGroup, RevealItem } from "@/components/site/motion";
import type { MenuProduct } from "@/components/menu/types";

/**
 * Grade do cardápio que se ajusta sozinha à quantidade de produtos.
 * A matemática do layout vive em `src/lib/menu-layout.ts` (com testes).
 */
export function ProductGrid({
  products,
  currency,
  locale,
  onOpen,
  animate = true,
}: {
  products: MenuProduct[];
  currency: string;
  locale: string;
  onOpen: (product: MenuProduct) => void;
  animate?: boolean;
}) {
  const layout = React.useMemo(
    () => getMenuGridLayout(products.length),
    [products.length],
  );

  if (products.length === 0) return null;

  const cards = products.map((product, index) => {
    const card = (
      <ProductCard
        product={product}
        emphasis={layout.emphasis}
        currency={currency}
        locale={locale}
        onOpen={onOpen}
      />
    );

    return animate ? (
      <RevealItem key={product.id} className={`${layout.itemClasses[index]} h-full`}>
        {card}
      </RevealItem>
    ) : (
      <div key={product.id} className={`${layout.itemClasses[index]} h-full`}>
        {card}
      </div>
    );
  });

  if (!animate) return <div className={layout.containerClass}>{cards}</div>;

  return <RevealGroup className={layout.containerClass}>{cards}</RevealGroup>;
}
