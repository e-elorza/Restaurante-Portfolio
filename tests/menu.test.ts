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

const { UNCATEGORIZED_ID, getCategoryMenu, getMenu } = await import(
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

describe("getCategoryMenu", () => {
  beforeEach(() => {
    findFirstCategory.mockReset();
  });

  it("usa a categoria escolhida na seção", async () => {
    findFirstCategory.mockResolvedValue(
      category("Hambúrgueres", [product({ name: "Brasa", categoryId: "Hambúrgueres" })]),
    );

    const menu = await getCategoryMenu("Hambúrgueres");
    expect(menu?.name).toBe("Hambúrgueres");
    expect(menu?.products.map((item: { name: string }) => item.name)).toEqual(["Brasa"]);

    const args = findFirstCategory.mock.calls[0][0];
    expect(args.where).toMatchObject({
      id: "Hambúrgueres",
      active: true,
      deletedAt: null,
    });
    // Só produtos publicados entram na lista de preços.
    expect(args.include.products.where).toMatchObject({
      active: true,
      deletedAt: null,
    });
  });

  it("cai na primeira categoria ativa quando nenhuma foi escolhida", async () => {
    findFirstCategory.mockResolvedValue(category("Entradas", []));

    await getCategoryMenu();
    const args = findFirstCategory.mock.calls[0][0];
    expect(args.where.id).toBeUndefined();
    expect(args.orderBy).toEqual({ position: "asc" });
  });

  it("cai na primeira ativa quando a categoria escolhida foi escondida", async () => {
    // A primeira busca (pela escolhida) não acha nada; a segunda é o fallback.
    findFirstCategory
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(category("Entradas", []));

    const menu = await getCategoryMenu("categoria-escondida");
    expect(menu?.name).toBe("Entradas");
    expect(findFirstCategory).toHaveBeenCalledTimes(2);
  });

  it("devolve nulo quando não há nenhuma categoria ativa", async () => {
    findFirstCategory.mockResolvedValue(null);
    expect(await getCategoryMenu()).toBeNull();
  });
});
