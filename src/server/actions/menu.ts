"use server";

import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activity";
import { categorySchema, productSchema } from "@/lib/validators";
import { slugify } from "@/lib/utils";
import type { NutritionInfo } from "@/lib/types";
import {
  fail,
  formToObject,
  fromZodError,
  list,
  ok,
  requireActionSession,
  revalidateSite,
  str,
  withActionState,
} from "@/server/actions/helpers";

/** Garante um slug único acrescentando um sufixo numérico quando preciso. */
async function uniqueSlug(
  table: "category" | "product",
  desired: string,
  currentId?: string,
): Promise<string> {
  const base = slugify(desired) || "item";
  let candidate = base;
  let counter = 2;

  for (;;) {
    const existing =
      table === "category"
        ? await prisma.category.findUnique({ where: { slug: candidate } })
        : await prisma.product.findUnique({ where: { slug: candidate } });
    if (!existing || existing.id === currentId) return candidate;
    candidate = `${base}-${counter}`;
    counter += 1;
  }
}

async function nextPosition(table: "category" | "product"): Promise<number> {
  const last =
    table === "category"
      ? await prisma.category.findFirst({
          where: { deletedAt: null },
          orderBy: { position: "desc" },
        })
      : await prisma.product.findFirst({
          where: { deletedAt: null },
          orderBy: { position: "desc" },
        });
  return (last?.position ?? -1) + 1;
}

// ---------------------------------------------------------------------------
// Categorias
// ---------------------------------------------------------------------------

export const saveCategoryAction = withActionState(async (session, formData) => {
  const parsed = categorySchema.safeParse(formToObject(formData));
  if (!parsed.success) return fromZodError(parsed.error);

  const data = parsed.data;
  const slug = await uniqueSlug("category", data.slug || data.name, data.id);

  const payload = {
    name: data.name,
    slug,
    description: data.description,
    imageUrl: data.imageUrl || null,
    imageAlt: data.imageAlt,
    active: data.active,
  };

  if (data.id) {
    const updated = await prisma.category.update({
      where: { id: data.id },
      data: payload,
    });
    await logActivity({
      userId: session.userId,
      action: "update",
      entity: "category",
      entityId: updated.id,
      message: `Categoria "${updated.name}" atualizada`,
    });
  } else {
    const created = await prisma.category.create({
      data: { ...payload, position: await nextPosition("category") },
    });
    await logActivity({
      userId: session.userId,
      action: "create",
      entity: "category",
      entityId: created.id,
      message: `Categoria "${created.name}" criada`,
    });
  }

  revalidateSite(["/admin/categorias"]);
  return ok("Categoria salva com sucesso.");
});

/** Exclusão suave: o conteúdo some do site mas continua recuperável no banco. */
export async function deleteCategoryAction(formData: FormData): Promise<void> {
  const session = await requireActionSession();
  const id = str(formData, "id");
  if (!id) return;

  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) return;

  await prisma.$transaction([
    prisma.product.updateMany({
      where: { categoryId: id },
      data: { categoryId: null },
    }),
    prisma.category.update({
      where: { id },
      data: { deletedAt: new Date(), active: false, isPrimary: false },
    }),
  ]);

  await logActivity({
    userId: session.userId,
    action: "delete",
    entity: "category",
    entityId: id,
    message: `Categoria "${category.name}" excluída`,
  });

  revalidateSite(["/admin/categorias"]);
}

/**
 * Marca (ou desmarca) a categoria principal — a que o "Cardápio simples" da
 * página inicial exibe. Só uma fica marcada por vez, então marcar uma desmarca
 * a anterior na mesma transação.
 */
export async function setPrimaryCategoryAction(formData: FormData): Promise<void> {
  const session = await requireActionSession();
  const id = str(formData, "id");
  if (!id) return;

  const category = await prisma.category.findFirst({
    where: { id, deletedAt: null },
  });
  if (!category) return;

  const passaASerPrincipal = !category.isPrimary;

  await prisma.$transaction([
    prisma.category.updateMany({
      where: { isPrimary: true },
      data: { isPrimary: false },
    }),
    ...(passaASerPrincipal
      ? [prisma.category.update({ where: { id }, data: { isPrimary: true } })]
      : []),
  ]);

  await logActivity({
    userId: session.userId,
    action: "update",
    entity: "category",
    entityId: id,
    message: passaASerPrincipal
      ? `Categoria "${category.name}" definida como principal`
      : `Categoria "${category.name}" deixou de ser a principal`,
  });

  revalidateSite(["/admin/categorias"]);
}

export async function toggleCategoryAction(formData: FormData): Promise<void> {
  const session = await requireActionSession();
  const id = str(formData, "id");
  const active = str(formData, "active") === "true";
  if (!id) return;

  const category = await prisma.category.update({
    where: { id },
    data: { active },
  });

  await logActivity({
    userId: session.userId,
    action: "update",
    entity: "category",
    entityId: id,
    message: `Categoria "${category.name}" ${active ? "publicada" : "escondida"} no site`,
  });

  revalidateSite(["/admin/categorias"]);
}

export async function reorderCategoriesAction(formData: FormData): Promise<void> {
  await requireActionSession();
  const ids = list(formData, "ids");
  if (ids.length === 0) return;

  await prisma.$transaction(
    ids.map((id, index) =>
      prisma.category.update({ where: { id }, data: { position: index } }),
    ),
  );

  revalidateSite(["/admin/categorias"]);
}

// ---------------------------------------------------------------------------
// Produtos
// ---------------------------------------------------------------------------

function buildNutrition(data: {
  nutritionCalories: string;
  nutritionProtein: string;
  nutritionCarbs: string;
  nutritionFat: string;
  nutritionNotes: string;
}): Prisma.InputJsonValue | typeof Prisma.JsonNull {
  const info: NutritionInfo = {
    calories: data.nutritionCalories || undefined,
    protein: data.nutritionProtein || undefined,
    carbs: data.nutritionCarbs || undefined,
    fat: data.nutritionFat || undefined,
    notes: data.nutritionNotes || undefined,
  };
  const hasValue = Object.values(info).some(Boolean);
  return hasValue ? (info as Prisma.InputJsonValue) : Prisma.JsonNull;
}

function parseGallery(raw: string): Array<{ url: string; alt: string }> {
  return raw
    .split(/\n+/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .slice(0, 12)
    .map((line) => {
      const [url, ...rest] = line.split("|");
      return { url: url.trim(), alt: rest.join("|").trim() };
    })
    .filter((image) => /^(https?:\/\/|\/)/i.test(image.url));
}

export const saveProductAction = withActionState(async (session, formData) => {
  const parsed = productSchema.safeParse(formToObject(formData));
  if (!parsed.success) return fromZodError(parsed.error);

  const data = parsed.data;

  if (data.promoPrice !== null && data.promoPrice >= data.price) {
    return fail("O preço promocional precisa ser menor que o preço normal.", {
      promoPrice: ["O preço promocional precisa ser menor que o preço normal."],
    });
  }

  const slug = await uniqueSlug("product", data.slug || data.name, data.id);
  const gallery = parseGallery(data.gallery);

  const payload = {
    name: data.name,
    slug,
    shortDescription: data.shortDescription,
    description: data.description,
    price: data.price,
    promoPrice: data.promoPrice,
    imageUrl: data.imageUrl || null,
    imageAlt: data.imageAlt,
    categoryId: data.categoryId || null,
    tags: data.tags,
    ingredients: data.ingredients,
    allergens: data.allergens,
    nutrition: buildNutrition(data),
    featured: data.featured,
    isNew: data.isNew,
    bestSeller: data.bestSeller,
    active: data.active,
    soldOut: data.soldOut,
    orderUrl: data.orderUrl || null,
  };

  let productId = data.id ?? "";

  if (data.id) {
    const updated = await prisma.product.update({
      where: { id: data.id },
      data: payload,
    });
    productId = updated.id;
    await logActivity({
      userId: session.userId,
      action: "update",
      entity: "product",
      entityId: updated.id,
      message: `Produto "${updated.name}" atualizado`,
    });
  } else {
    const created = await prisma.product.create({
      data: { ...payload, position: await nextPosition("product") },
    });
    productId = created.id;
    await logActivity({
      userId: session.userId,
      action: "create",
      entity: "product",
      entityId: created.id,
      message: `Produto "${created.name}" criado`,
    });
  }

  await prisma.productImage.deleteMany({ where: { productId } });
  if (gallery.length > 0) {
    await prisma.productImage.createMany({
      data: gallery.map((image, index) => ({
        productId,
        url: image.url,
        alt: image.alt,
        position: index,
      })),
    });
  }

  revalidateSite(["/admin/produtos"]);

  if (!data.id) redirect(`/admin/produtos/${productId}?criado=1`);
  return ok("Produto salvo com sucesso.");
});

export async function deleteProductAction(formData: FormData): Promise<void> {
  const session = await requireActionSession();
  const id = str(formData, "id");
  if (!id) return;

  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return;

  await prisma.product.update({
    where: { id },
    data: { deletedAt: new Date(), active: false },
  });

  await logActivity({
    userId: session.userId,
    action: "delete",
    entity: "product",
    entityId: id,
    message: `Produto "${product.name}" excluído`,
  });

  revalidateSite(["/admin/produtos"]);
}

export async function toggleProductAction(formData: FormData): Promise<void> {
  const session = await requireActionSession();
  const id = str(formData, "id");
  const field = str(formData, "field");
  const value = str(formData, "value") === "true";
  if (!id || !["active", "soldOut", "featured"].includes(field)) return;

  const product = await prisma.product.update({
    where: { id },
    data: { [field]: value } as Prisma.ProductUpdateInput,
  });

  const labels: Record<string, [string, string]> = {
    active: ["publicado no site", "escondido do site"],
    soldOut: ["marcado como esgotado", "marcado como disponível"],
    featured: ["marcado como destaque", "removido dos destaques"],
  };

  await logActivity({
    userId: session.userId,
    action: "update",
    entity: "product",
    entityId: id,
    message: `Produto "${product.name}" ${labels[field][value ? 0 : 1]}`,
  });

  revalidateSite(["/admin/produtos"]);
}

export async function reorderProductsAction(formData: FormData): Promise<void> {
  await requireActionSession();
  const ids = list(formData, "ids");
  if (ids.length === 0) return;

  await prisma.$transaction(
    ids.map((id, index) =>
      prisma.product.update({ where: { id }, data: { position: index } }),
    ),
  );

  revalidateSite(["/admin/produtos"]);
}
