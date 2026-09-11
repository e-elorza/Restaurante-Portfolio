import Link from "next/link";
import { Plus, Search, UtensilsCrossed } from "lucide-react";

import { ProductList } from "@/components/admin/product-list";
import { Button } from "@/components/ui/button";
import { EmptyState, PageHeader } from "@/components/ui/misc";
import { Input, Select } from "@/components/ui/form";
import { getAdminCategories, getAdminProducts } from "@/lib/data/menu";
import { getRestaurantSettings } from "@/lib/data/settings";

export const metadata = { title: "Produtos" };

type PageProps = {
  searchParams: Promise<{ busca?: string; categoria?: string }>;
};

export default async function ProductsPage({ searchParams }: PageProps) {
  const { busca = "", categoria = "" } = await searchParams;

  const [products, categories, settings] = await Promise.all([
    getAdminProducts({ search: busca || undefined, categoryId: categoria || undefined }),
    getAdminCategories(),
    getRestaurantSettings(),
  ]);

  const filtering = Boolean(busca || categoria);

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Produtos"
        description="Cadastre os itens do cardápio. Arraste pela alça à esquerda para mudar a ordem em que aparecem no site."
      >
        <Button asChild>
          <Link href="/admin/produtos/novo">
            <Plus aria-hidden />
            Novo produto
          </Link>
        </Button>
      </PageHeader>

      <form className="admin-card mb-4 flex flex-col gap-3 p-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle-foreground"
            aria-hidden
          />
          <Input
            type="search"
            name="busca"
            defaultValue={busca}
            placeholder="Buscar por nome ou descrição..."
            aria-label="Buscar produtos"
            className="pl-9"
          />
        </div>

        <Select
          name="categoria"
          defaultValue={categoria}
          aria-label="Filtrar por categoria"
          className="sm:w-56"
        >
          <option value="">Todas as categorias</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </Select>

        <div className="flex gap-2">
          <Button type="submit" variant="outline">
            Filtrar
          </Button>
          {filtering ? (
            <Button asChild type="button" variant="ghost">
              <Link href="/admin/produtos">Limpar</Link>
            </Button>
          ) : null}
        </div>
      </form>

      {products.length === 0 ? (
        filtering ? (
          <EmptyState
            icon={<Search className="size-5" aria-hidden />}
            title="Nenhum produto encontrado"
            description="Tente outro termo ou remova o filtro de categoria."
            actionLabel="Limpar filtros"
            actionHref="/admin/produtos"
          />
        ) : (
          <EmptyState
            icon={<UtensilsCrossed className="size-5" aria-hidden />}
            title="Nenhum produto cadastrado ainda"
            description="Adicione o primeiro item do cardápio — leva menos de um minuto."
            actionLabel="+ Adicionar primeiro produto"
            actionHref="/admin/produtos/novo"
          />
        )
      ) : (
        <>
          <p className="admin-hint mb-2">
            {products.length}{" "}
            {products.length === 1 ? "produto encontrado" : "produtos encontrados"}
            {filtering ? " (a ordenação por arrastar fica disponível sem filtros)" : ""}
          </p>
          <ProductList
            products={products}
            currency={settings.currency}
            locale={settings.locale}
            sortable={!filtering}
          />
        </>
      )}
    </div>
  );
}
