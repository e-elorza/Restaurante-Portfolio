import Link from "next/link";
import {
  ArrowRight,
  CircleOff,
  FolderTree,
  Files,
  Plus,
  Sparkles,
  UtensilsCrossed,
} from "lucide-react";

import { PageHeader } from "@/components/ui/misc";
import { Badge, EmptyState } from "@/components/ui/misc";
import { Button } from "@/components/ui/button";
import { getRecentActivity } from "@/lib/activity";
import { prisma, safeQuery } from "@/lib/prisma";
import { getPages } from "@/lib/data/pages";
import { getRestaurantSettings } from "@/lib/data/settings";
import { formatCurrency, formatDateTime } from "@/lib/utils";

export const metadata = { title: "Dashboard" };

async function getCounts() {
  return safeQuery(
    async () => {
      const [active, unavailable, categories, featured, products] = await Promise.all([
        prisma.product.count({ where: { deletedAt: null, active: true } }),
        prisma.product.count({
          where: { deletedAt: null, OR: [{ active: false }, { soldOut: true }] },
        }),
        prisma.category.count({ where: { deletedAt: null, active: true } }),
        prisma.product.count({ where: { deletedAt: null, featured: true } }),
        prisma.product.findMany({
          where: { deletedAt: null },
          orderBy: { createdAt: "desc" },
          take: 5,
          include: { category: { select: { name: true } } },
        }),
      ]);
      return { active, unavailable, categories, featured, products };
    },
    { active: 0, unavailable: 0, categories: 0, featured: 0, products: [] },
  );
}

export default async function DashboardPage() {
  const [counts, pages, activity, settings] = await Promise.all([
    getCounts(),
    getPages(),
    getRecentActivity(8),
    getRestaurantSettings(),
  ]);

  const enabledPages = pages.filter((page) => page.enabled || page.lockedEnabled);

  const stats = [
    {
      label: "Produtos publicados",
      value: counts.active,
      hint: "Aparecem no cardápio do site.",
      icon: <UtensilsCrossed className="size-4" aria-hidden />,
      href: "/admin/produtos",
    },
    {
      label: "Indisponíveis ou escondidos",
      value: counts.unavailable,
      hint: "Esgotados ou fora do ar.",
      icon: <CircleOff className="size-4" aria-hidden />,
      href: "/admin/produtos",
    },
    {
      label: "Categorias ativas",
      value: counts.categories,
      hint: "Seções do cardápio.",
      icon: <FolderTree className="size-4" aria-hidden />,
      href: "/admin/categorias",
    },
    {
      label: "Itens em destaque",
      value: counts.featured,
      hint: "Aparecem na página inicial.",
      icon: <Sparkles className="size-4" aria-hidden />,
      href: "/admin/produtos",
    },
    {
      label: "Páginas no ar",
      value: enabledPages.length,
      hint: enabledPages.map((page) => page.label).join(", "),
      icon: <Files className="size-4" aria-hidden />,
      href: "/admin/paginas",
    },
  ];

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title={`Olá! Este é o painel do ${settings.name}`}
        description="Tudo o que você alterar aqui aparece no site na hora."
      >
        <Button asChild>
          <Link href="/admin/produtos/novo">
            <Plus aria-hidden />
            Novo produto
          </Link>
        </Button>
      </PageHeader>

      <section aria-label="Resumo" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="admin-card group p-4 transition-colors hover:border-primary/40"
          >
            <div className="flex items-center justify-between gap-2 text-subtle-foreground">
              <span className="flex items-center gap-2 text-sm font-medium">
                {stat.icon}
                {stat.label}
              </span>
              <ArrowRight
                className="size-4 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100"
                aria-hidden
              />
            </div>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
              {stat.value}
            </p>
            <p className="admin-hint mt-1 line-clamp-1">{stat.hint}</p>
          </Link>
        ))}
      </section>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <section className="admin-card p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="admin-section-title">Últimos produtos adicionados</h2>
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/produtos">Ver todos</Link>
            </Button>
          </div>

          {counts.products.length === 0 ? (
            <EmptyState
              title="Nenhum produto cadastrado ainda"
              description="Comece adicionando o primeiro item do seu cardápio."
              actionLabel="+ Adicionar primeiro produto"
              actionHref="/admin/produtos/novo"
            />
          ) : (
            <ul className="divide-y divide-border">
              {counts.products.map((product) => (
                <li key={product.id}>
                  <Link
                    href={`/admin/produtos/${product.id}`}
                    className="flex items-center justify-between gap-3 py-2.5 transition-colors hover:text-primary"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">
                        {product.name}
                      </span>
                      <span className="admin-hint">
                        {product.category?.name ?? "Sem categoria"}
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-2">
                      {!product.active ? (
                        <Badge tone="neutral">Escondido</Badge>
                      ) : product.soldOut ? (
                        <Badge tone="warning">Esgotado</Badge>
                      ) : null}
                      <span className="text-sm font-semibold">
                        {formatCurrency(
                          Number(product.promoPrice ?? product.price),
                          settings.currency,
                          settings.locale,
                        )}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="admin-card p-4 sm:p-5">
          <h2 className="admin-section-title mb-4">Últimas alterações</h2>

          {activity.length === 0 ? (
            <p className="admin-hint">
              Assim que você começar a editar o site, o histórico aparece aqui.
            </p>
          ) : (
            <ul className="space-y-3">
              {activity.map((entry) => (
                <li key={entry.id} className="flex gap-3">
                  <span
                    aria-hidden
                    className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary"
                  />
                  <div className="min-w-0">
                    <p className="text-sm text-foreground">{entry.message}</p>
                    <p className="admin-hint">
                      {entry.user?.name ? `${entry.user.name} · ` : ""}
                      {formatDateTime(entry.createdAt, settings.locale)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
