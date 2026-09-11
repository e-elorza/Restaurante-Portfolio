"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff, ImageOff, Pencil, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/misc";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { SortableList } from "@/components/admin/sortable-list";
import {
  deleteProductAction,
  reorderProductsAction,
  toggleProductAction,
} from "@/server/actions/menu";
import { formatCurrency } from "@/lib/utils";
import type { PublicProduct } from "@/lib/types";

export function ProductList({
  products,
  currency,
  locale,
  sortable,
}: {
  products: PublicProduct[];
  currency: string;
  locale: string;
  /** A ordenação só faz sentido quando a lista inteira está visível. */
  sortable: boolean;
}) {
  const rows = products.map((product) => ({
    id: product.id,
    content: (
      <ProductRow product={product} currency={currency} locale={locale} />
    ),
  }));

  if (!sortable) {
    return (
      <ul className="space-y-2">
        {rows.map((row) => (
          <li key={row.id} className="admin-card overflow-hidden">
            {row.content}
          </li>
        ))}
      </ul>
    );
  }

  return <SortableList items={rows} action={reorderProductsAction} />;
}

function ProductRow({
  product,
  currency,
  locale,
}: {
  product: PublicProduct;
  currency: string;
  locale: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 p-2.5 sm:flex-nowrap">
      <span className="relative size-14 shrink-0 overflow-hidden rounded-md bg-secondary">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt=""
            fill
            unoptimized
            sizes="56px"
            className="object-cover"
          />
        ) : (
          <span className="flex h-full items-center justify-center text-subtle-foreground">
            <ImageOff className="size-4" aria-hidden />
          </span>
        )}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <Link
            href={`/admin/produtos/${product.id}`}
            className="truncate text-sm font-medium text-foreground hover:text-primary"
          >
            {product.name}
          </Link>
          {!product.active ? <Badge tone="neutral">Escondido</Badge> : null}
          {product.soldOut ? <Badge tone="warning">Esgotado</Badge> : null}
          {product.featured ? <Badge tone="brand">Destaque</Badge> : null}
          {product.promoPrice !== null ? <Badge tone="success">Promoção</Badge> : null}
        </div>
        <p className="admin-hint truncate">
          {product.category?.name ?? "Sem categoria"}
          {product.shortDescription ? ` · ${product.shortDescription}` : ""}
        </p>
      </div>

      <span className="shrink-0 text-sm font-semibold text-foreground">
        {formatCurrency(product.promoPrice ?? product.price, currency, locale)}
      </span>

      <div className="flex shrink-0 items-center gap-1">
        <form action={toggleProductAction}>
          <input type="hidden" name="id" value={product.id} />
          <input type="hidden" name="field" value="active" />
          <input type="hidden" name="value" value={product.active ? "false" : "true"} />
          <Button
            type="submit"
            variant="ghost"
            size="icon"
            title={product.active ? "Esconder do site" : "Mostrar no site"}
            aria-label={product.active ? "Esconder do site" : "Mostrar no site"}
          >
            {product.active ? <Eye aria-hidden /> : <EyeOff aria-hidden />}
          </Button>
        </form>

        <Button asChild variant="ghost" size="icon" title="Editar produto">
          <Link href={`/admin/produtos/${product.id}`} aria-label={`Editar ${product.name}`}>
            <Pencil aria-hidden />
          </Link>
        </Button>

        <ConfirmDialog
          title="Excluir produto"
          description={`Tem certeza que deseja excluir o produto “${product.name}”? Ele sai do site imediatamente.`}
          action={deleteProductAction}
          hiddenFields={{ id: product.id }}
          trigger={
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive hover:bg-destructive/10"
              title="Excluir produto"
              aria-label={`Excluir ${product.name}`}
            >
              <Trash2 aria-hidden />
            </Button>
          }
        />
      </div>
    </div>
  );
}
