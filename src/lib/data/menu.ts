import { cache } from "react";
import type { Category, Prisma, Product, ProductImage } from "@prisma/client";

import { prisma, safeQuery } from "@/lib/prisma";
import type { NutritionInfo, PublicCategory, PublicProduct } from "@/lib/types";

type ProductWithRelations = Product & {
  images: ProductImage[];
  category: Pick<Category, "id" | "name" | "slug"> | null;
};

const productInclude = {
  images: { orderBy: { position: "asc" } },
  category: { select: { id: true, name: true, slug: true } },
} satisfies Prisma.ProductInclude;

function parseNutrition(value: Prisma.JsonValue | null): NutritionInfo | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;
  const pick = (key: string) =>
    typeof record[key] === "string" && record[key] !== "" ? (record[key] as string) : undefined;
  const info: NutritionInfo = {
    calories: pick("calories"),
    protein: pick("protein"),
    carbs: pick("carbs"),
    fat: pick("fat"),
    notes: pick("notes"),
  };
  return Object.values(info).some(Boolean) ? info : null;
}

/** Converte o registro do Prisma (com Decimal) em objeto serializável. */
export function toPublicProduct(product: ProductWithRelations): PublicProduct {
  const { price, promoPrice, nutrition, ...rest } = product;
  return {
    ...rest,
    price: Number(price),
    promoPrice: promoPrice === null ? null : Number(promoPrice),
    nutrition: parseNutrition(nutrition),
  };
}

const activeProductWhere = {
  active: true,
  deletedAt: null,
} satisfies Prisma.ProductWhereInput;

/**
 * Identificador da seção que recolhe os produtos publicados que ainda não
 * foram colocados em nenhuma categoria. Ela não existe no banco: é montada na
 * hora, só para que nenhum produto publicado fique invisível no cardápio.
 */
export const UNCATEGORIZED_ID = "sem-categoria";
export const UNCATEGORIZED_SLUG = "sem-categoria";
const UNCATEGORIZED_NAME = "Outros";

/** Monta a seção virtual que acolhe os produtos sem categoria. */
function uncategorizedGroup(products: PublicProduct[]): PublicCategory {
  const now = new Date(0);
  return {
    id: UNCATEGORIZED_ID,
    name: UNCATEGORIZED_NAME,
    slug: UNCATEGORIZED_SLUG,
    description: "",
    imageUrl: null,
    imageAlt: "",
    active: true,
    // Sempre por último, depois de todas as categorias de verdade.
    position: Number.MAX_SAFE_INTEGER,
    deletedAt: null,
    createdAt: now,
    updatedAt: now,
    products,
  };
}

/**
 * Categorias ativas com os produtos disponíveis, prontas para o site.
 *
 * Produtos publicados que ficaram sem categoria — porque o administrador
 * escolheu "Sem categoria" ou porque a categoria deles foi excluída — entram
 * numa seção "Outros" no fim da página. Sem isso eles sumiriam do cardápio sem
 * nenhum aviso, mesmo aparecendo como publicados no painel.
 */
export const getMenu = cache(async (): Promise<PublicCategory[]> => {
  const [categories, orphans] = await Promise.all([
    safeQuery(
      () =>
        prisma.category.findMany({
          where: { active: true, deletedAt: null },
          orderBy: { position: "asc" },
          include: {
            products: {
              where: activeProductWhere,
              orderBy: [{ position: "asc" }, { createdAt: "desc" }],
              include: productInclude,
            },
          },
        }),
      [],
    ),
    safeQuery(
      () =>
        prisma.product.findMany({
          where: { ...activeProductWhere, categoryId: null },
          orderBy: [{ position: "asc" }, { createdAt: "desc" }],
          include: productInclude,
        }),
      [],
    ),
  ]);

  const menu: PublicCategory[] = categories.map((category) => ({
    ...category,
    products: category.products.map(toPublicProduct),
  }));

  if (orphans.length > 0) {
    menu.push(uncategorizedGroup(orphans.map(toPublicProduct)));
  }

  return menu;
});

/** Todos os produtos ativos, independentemente de categoria. */
export const getActiveProducts = cache(async (): Promise<PublicProduct[]> => {
  const products = await safeQuery(
    () =>
      prisma.product.findMany({
        where: activeProductWhere,
        orderBy: [{ position: "asc" }, { createdAt: "desc" }],
        include: productInclude,
      }),
    [],
  );
  return products.map(toPublicProduct);
});

export const getProductBySlug = cache(
  async (slug: string): Promise<PublicProduct | null> => {
    const product = await safeQuery(
      () =>
        prisma.product.findFirst({
          where: { slug, ...activeProductWhere },
          include: productInclude,
        }),
      null,
    );
    return product ? toPublicProduct(product) : null;
  },
);

export const getActiveCategories = cache(async (): Promise<Category[]> =>
  safeQuery(
    () =>
      prisma.category.findMany({
        where: { active: true, deletedAt: null },
        orderBy: { position: "asc" },
      }),
    [],
  ),
);

/**
 * Uma categoria com os produtos publicados dela, usada pelo "Cardápio simples"
 * da página inicial.
 *
 * Sem categoria escolhida — ou quando a escolhida foi escondida ou excluída —
 * cai na primeira categoria ativa, para a seção continuar mostrando alguma
 * coisa em vez de sumir da página sem explicação.
 */
export const getCategoryMenu = cache(
  async (categoryId?: string): Promise<PublicCategory | null> => {
    const include = {
      products: {
        where: activeProductWhere,
        orderBy: [{ position: "asc" }, { createdAt: "desc" }],
        include: productInclude,
      },
    } satisfies Prisma.CategoryInclude;

    const category = await safeQuery(async () => {
      const escolhida = categoryId
        ? await prisma.category.findFirst({
            where: { id: categoryId, active: true, deletedAt: null },
            include,
          })
        : null;

      return (
        escolhida ??
        prisma.category.findFirst({
          where: { active: true, deletedAt: null },
          orderBy: { position: "asc" },
          include,
        })
      );
    }, null);

    if (!category) return null;
    return { ...category, products: category.products.map(toPublicProduct) };
  },
);

export type FeaturedSource = "FEATURED" | "BEST_SELLER" | "NEW" | "CATEGORY";

/** Produtos usados pela seção "Produtos em destaque" da Home. */
export const getFeaturedProducts = cache(
  async (
    source: FeaturedSource,
    limit: number,
    categoryId?: string,
  ): Promise<PublicProduct[]> => {
    const where: Prisma.ProductWhereInput = { ...activeProductWhere };
    if (source === "FEATURED") where.featured = true;
    if (source === "BEST_SELLER") where.bestSeller = true;
    if (source === "NEW") where.isNew = true;
    if (source === "CATEGORY" && categoryId) where.categoryId = categoryId;

    const products = await safeQuery(
      () =>
        prisma.product.findMany({
          where,
          orderBy: [{ position: "asc" }, { createdAt: "desc" }],
          take: Math.min(Math.max(limit, 1), 24),
          include: productInclude,
        }),
      [],
    );
    return products.map(toPublicProduct);
  },
);

// ---------------------------------------------------------------------------
// Leituras do painel administrativo (inclui itens desativados)
// ---------------------------------------------------------------------------

export async function getAdminCategories() {
  return safeQuery(
    () =>
      prisma.category.findMany({
        where: { deletedAt: null },
        orderBy: { position: "asc" },
        include: { _count: { select: { products: { where: { deletedAt: null } } } } },
      }),
    [],
  );
}

export async function getAdminProducts(options?: {
  categoryId?: string;
  search?: string;
}) {
  const where: Prisma.ProductWhereInput = { deletedAt: null };
  if (options?.categoryId) where.categoryId = options.categoryId;
  if (options?.search) {
    where.OR = [
      { name: { contains: options.search, mode: "insensitive" } },
      { shortDescription: { contains: options.search, mode: "insensitive" } },
    ];
  }

  const products = await safeQuery(
    () =>
      prisma.product.findMany({
        where,
        orderBy: [{ position: "asc" }, { createdAt: "desc" }],
        include: productInclude,
      }),
    [],
  );
  return products.map(toPublicProduct);
}

export async function getAdminProduct(id: string) {
  const product = await safeQuery(
    () => prisma.product.findFirst({ where: { id, deletedAt: null }, include: productInclude }),
    null,
  );
  return product ? toPublicProduct(product) : null;
}

export async function getAdminCategory(id: string) {
  return safeQuery(
    () => prisma.category.findFirst({ where: { id, deletedAt: null } }),
    null,
  );
}
