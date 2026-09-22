import { beforeEach, describe, expect, it, vi } from "vitest";

const findManyCategory = vi.fn();
const findManyProduct = vi.fn();
const findFirstCategory = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    category: { findMany: findManyCategory, findFirst: findFirstCategory },
    product: { findMany: findManyProduct },
  },
  safeQuery: async <T,>(run: () => Promise<T>, fallback: T) => {
    try {
      return await run();
    } catch {
      return fallback;
    }
  },
}));

const { UNCATEGORIZED_ID, getMenu, getPrimaryCategoryMenu } = await import(
  "@/lib/data/menu"
);

type ProductOverrides = { name: string; categoryId?: string | null };

/** Registro mínimo de produto, com os campos que o cardápio lê. */
function product({ name, categoryId = null }: ProductOverrides) {
  return {
    id: name,
    name,
    slug: name,
    categoryId,
    price: 10,
    promoPrice: null,
    nutrition: null,
    images: [],
    category: null,
  };
}

function category(name: string, products: ReturnType<typeof product>[]) {
  return {
    id: name,
    name,
    slug: name,
    description: "",
    imageUrl: null,
    imageAlt: "",
    active: true,
    isPrimary: false,
    position: 0,
    deletedAt: null,
    createdAt: new Date(0),
    updatedAt: new Date(0),
    products,
  };
}

describe("getMenu", () => {
  beforeEach(() => {
    findManyCategory.mockReset();
    findManyProduct.mockReset();
  });

  it("devolve as categorias ativas com seus produtos", async () => {
    findManyCategory.mockResolvedValue([
      category("Hambúrgueres", [product({ name: "Brasa", categoryId: "Hambúrgueres" })]),
    ]);
    findManyProduct.mockResolvedValue([]);

    const menu = await getMenu();
    expect(menu).toHaveLength(1);
    expect(menu[0].products.map((item) => item.name)).toEqual(["Brasa"]);
  });

  it("mostra em “Outros” os produtos publicados que ficaram sem categoria", async () => {
    findManyCategory.mockResolvedValue([
      category("Bebidas", [product({ name: "Limonada", categoryId: "Bebidas" })]),
    ]);
    findManyProduct.mockResolvedValue([product({ name: "Item Solto" })]);

    const menu = await getMenu();
    expect(menu).toHaveLength(2);

    const ultimo = menu.at(-1)!;
    expect(ultimo.id).toBe(UNCATEGORIZED_ID);
    expect(ultimo.name).toBe("Outros");
    expect(ultimo.products.map((item) => item.name)).toEqual(["Item Solto"]);

    // Consulta apenas produtos publicados e realmente órfãos.
    expect(findManyProduct.mock.calls[0][0].where).toMatchObject({
      active: true,
      deletedAt: null,
      categoryId: null,
    });
  });

  it("não cria a seção “Outros” quando não há produtos soltos", async () => {
    findManyCategory.mockResolvedValue([category("Bebidas", [])]);
    findManyProduct.mockResolvedValue([]);

    const menu = await getMenu();
    expect(menu.map((item) => item.id)).toEqual(["Bebidas"]);
  });
});

describe("getPrimaryCategoryMenu", () => {
  beforeEach(() => {
    findFirstCategory.mockReset();
  });

  it("pede a categoria marcada como principal antes das outras", async () => {
    findFirstCategory.mockResolvedValue(
      category("Hambúrgueres", [product({ name: "Brasa", categoryId: "Hambúrgueres" })]),
    );

    const menu = await getPrimaryCategoryMenu();
    expect(menu?.name).toBe("Hambúrgueres");
    expect(menu?.products.map((item) => item.name)).toEqual(["Brasa"]);

    const args = findFirstCategory.mock.calls[0][0];
    // A principal vem primeiro; sem nenhuma marcada, cai na primeira da ordem
    // definida no painel — por isso a consulta nunca filtra por isPrimary.
    expect(args.orderBy).toEqual([{ isPrimary: "desc" }, { position: "asc" }]);
    expect(args.where).toMatchObject({ active: true, deletedAt: null });
    expect(args.where.isPrimary).toBeUndefined();
  });

  it("só traz produtos publicados", async () => {
    findFirstCategory.mockResolvedValue(category("Bebidas", []));

    await getPrimaryCategoryMenu();
    expect(findFirstCategory.mock.calls[0][0].include.products.where).toMatchObject({
      active: true,
      deletedAt: null,
    });
  });

  it("devolve nulo quando não há nenhuma categoria ativa", async () => {
    findFirstCategory.mockResolvedValue(null);
    expect(await getPrimaryCategoryMenu()).toBeNull();
  });
});
