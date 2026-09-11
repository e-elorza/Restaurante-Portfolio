"use client";

import * as React from "react";

import { ProductGrid } from "@/components/menu/product-grid";
import { ProductDialog } from "@/components/menu/product-dialog";
import type { MenuProduct } from "@/components/menu/types";

/** Vitrine de produtos reutilizável (Home e páginas internas). */
export function ProductShowcase({
  products,
  currency,
  locale,
  orderLabel,
}: {
  products: MenuProduct[];
  currency: string;
  locale: string;
  orderLabel: string;
}) {
  const [selected, setSelected] = React.useState<MenuProduct | null>(null);

  return (
    <>
      <ProductGrid
        products={products}
        currency={currency}
        locale={locale}
        onOpen={setSelected}
      />
      <ProductDialog
        product={selected}
        currency={currency}
        locale={locale}
        orderLabel={orderLabel}
        onClose={() => setSelected(null)}
      />
    </>
  );
}
