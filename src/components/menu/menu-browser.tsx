"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Search, UtensilsCrossed, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { ProductGrid } from "@/components/menu/product-grid";
import { ProductDialog } from "@/components/menu/product-dialog";
import type { MenuCategoryView, MenuProduct } from "@/components/menu/types";

const ALL = "todos";

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

/** Texto pesquisável de um produto: nome, descrição, ingredientes e tags. */
function searchIndex(product: MenuProduct, categoryName: string): string {
  return normalize(
    [
      product.name,
      product.shortDescription,
      product.description,
      categoryName,
      product.tags.join(" "),
      product.ingredients.join(" "),
    ].join(" "),
  );
}

export function MenuBrowser({
  categories,
  currency,
  locale,
  orderLabel,
}: {
  categories: MenuCategoryView[];
  currency: string;
  locale: string;
  orderLabel: string;
}) {
  const reduced = useReducedMotion();
  const [query, setQuery] = React.useState("");
  const [active, setActive] = React.useState<string>(ALL);
  const [selected, setSelected] = React.useState<MenuProduct | null>(null);

  const deferredQuery = React.useDeferredValue(query);

  const indexed = React.useMemo(
    () =>
      categories.flatMap((category) =>
        category.products.map((product) => ({
          product,
          categorySlug: category.slug,
          haystack: searchIndex(product, category.name),
        })),
      ),
    [categories],
  );

  const searching = deferredQuery.trim().length > 0;

  const results = React.useMemo(() => {
    if (!searching) return [];
    const terms = normalize(deferredQuery).split(/\s+/).filter(Boolean);
    return indexed
      .filter((entry) => terms.every((term) => entry.haystack.includes(term)))
      .map((entry) => entry.product);
  }, [deferredQuery, indexed, searching]);

  const visibleCategories = React.useMemo(
    () =>
      active === ALL
        ? categories
        : categories.filter((category) => category.slug === active),
    [active, categories],
  );

  const totalProducts = indexed.length;

  return (
    <>
      <div className="sticky top-16 z-30 -mx-5 border-b border-[rgb(var(--brand-text-rgb)/0.08)] bg-[var(--brand-background)]/95 px-5 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <CategoryChips
            categories={categories}
            active={active}
            disabled={searching}
            onSelect={(slug) => {
              setActive(slug);
              setQuery("");
            }}
          />

          <div className="relative lg:w-72 lg:shrink-0">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[var(--brand-muted)]"
              aria-hidden
            />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar no cardápio..."
              aria-label="Buscar no cardápio"
              className="w-full rounded-full border border-[rgb(var(--brand-text-rgb)/0.14)] bg-[var(--brand-surface)] py-2.5 pl-10 pr-9 text-sm text-[var(--brand-text)] outline-none transition-colors placeholder:text-[var(--brand-muted)] focus:border-[var(--brand-primary)]"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Limpar busca"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--brand-muted)] transition-colors hover:text-[var(--brand-text)]"
              >
                <X className="size-4" aria-hidden />
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="pt-10 sm:pt-12">
        {searching ? (
          <section aria-live="polite">
            <p className="mb-6 text-sm text-[var(--brand-muted)]">
              {results.length === 0
                ? "Nenhum item encontrado."
                : `${results.length} ${results.length === 1 ? "item encontrado" : "itens encontrados"} para “${deferredQuery.trim()}”.`}
            </p>

            {results.length > 0 ? (
              <ProductGrid
                products={results}
                currency={currency}
                locale={locale}
                onOpen={setSelected}
                animate={false}
              />
            ) : (
              <EmptyResults onClear={() => setQuery("")} />
            )}
          </section>
        ) : (
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={active}
              initial={reduced ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduced ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-16 sm:space-y-20"
            >
              {visibleCategories.map((category) => (
                <section
                  key={category.id}
                  id={`categoria-${category.slug}`}
                  aria-labelledby={`titulo-${category.slug}`}
                  className="scroll-mt-36"
                >
                  <header className="mb-7 max-w-2xl">
                    <h2
                      id={`titulo-${category.slug}`}
                      className="font-heading text-2xl font-semibold sm:text-3xl"
                    >
                      {category.name}
                    </h2>
                    {category.description ? (
                      <p className="mt-2 text-pretty text-sm leading-relaxed text-[var(--brand-muted)] sm:text-base">
                        {category.description}
                      </p>
                    ) : null}
                  </header>

                  {category.products.length > 0 ? (
                    <ProductGrid
                      products={category.products}
                      currency={currency}
                      locale={locale}
                      onOpen={setSelected}
                    />
                  ) : (
                    <p className="rounded-[var(--card-radius)] border border-dashed border-[rgb(var(--brand-text-rgb)/0.16)] px-5 py-8 text-center text-sm text-[var(--brand-muted)]">
                      Ainda não há itens nesta categoria.
                    </p>
                  )}
                </section>
              ))}

              {totalProducts === 0 ? (
                <div className="flex flex-col items-center rounded-[var(--card-radius)] border border-dashed border-[rgb(var(--brand-text-rgb)/0.16)] px-6 py-16 text-center">
                  <UtensilsCrossed
                    className="mb-3 size-8 text-[var(--brand-muted)]"
                    aria-hidden
                  />
                  <p className="font-heading text-xl">O cardápio está sendo preparado</p>
                  <p className="mt-2 max-w-sm text-sm text-[var(--brand-muted)]">
                    Em breve você encontra aqui todos os nossos itens. Fale com a gente
                    pelo WhatsApp enquanto isso.
                  </p>
                </div>
              ) : null}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

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

function CategoryChips({
  categories,
  active,
  disabled,
  onSelect,
}: {
  categories: MenuCategoryView[];
  active: string;
  disabled: boolean;
  onSelect: (slug: string) => void;
}) {
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Mantém o chip ativo visível no scroll horizontal do celular.
  React.useEffect(() => {
    const container = containerRef.current;
    const current = container?.querySelector<HTMLElement>('[data-active="true"]');
    current?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [active]);

  if (categories.length === 0) return null;

  return (
    <div
      ref={containerRef}
      role="tablist"
      aria-label="Categorias do cardápio"
      className={cn(
        "no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 py-0.5",
        disabled && "pointer-events-none opacity-45",
      )}
    >
      {[{ slug: ALL, name: "Todos" }, ...categories].map((category) => {
        const isActive = active === category.slug;
        return (
          <button
            key={category.slug}
            type="button"
            role="tab"
            aria-selected={isActive}
            data-active={isActive}
            onClick={() => onSelect(category.slug)}
            className={cn(
              "shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200",
              isActive
                ? "border-transparent bg-[var(--brand-primary)] text-white shadow-sm"
                : "border-[rgb(var(--brand-text-rgb)/0.14)] text-[var(--brand-text)] hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)]",
            )}
          >
            {category.name}
          </button>
        );
      })}
    </div>
  );
}

function EmptyResults({ onClear }: { onClear: () => void }) {
  return (
    <div className="flex flex-col items-center rounded-[var(--card-radius)] border border-dashed border-[rgb(var(--brand-text-rgb)/0.16)] px-6 py-14 text-center">
      <Search className="mb-3 size-7 text-[var(--brand-muted)]" aria-hidden />
      <p className="font-heading text-lg">Nada encontrado com esse termo</p>
      <p className="mt-1 max-w-sm text-sm text-[var(--brand-muted)]">
        Tente procurar por outro nome, ingrediente ou categoria.
      </p>
      <button
        type="button"
        onClick={onClear}
        className="mt-5 text-sm font-semibold text-[var(--brand-primary)] underline underline-offset-4"
      >
        Limpar a busca
      </button>
    </div>
  );
}
