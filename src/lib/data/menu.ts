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

/** Categorias ativas com os produtos disponíveis, prontas para o site. */
export const getMenu = cache(async (): Promise<PublicCategory[]> => {
  const categories = await safeQuery(
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
  );

  return categories.map((category) => ({
    ...category,
    products: category.products.map(toPublicProduct),
  }));
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
