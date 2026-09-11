import { describe, expect, it } from "vitest";

import {
  appearanceSchema,
  categorySchema,
  deliveryOptionSchema,
  eventSchema,
  locationSchema,
  pageSettingsSchema,
  productSchema,
} from "@/lib/validators";

const produtoValido = {
  name: "Hambúrguer da casa",
  price: "38,90",
  active: "on",
};

describe("produto", () => {
  it("aceita o mínimo necessário", () => {
    const result = productSchema.safeParse(produtoValido);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.price).toBe(38.9);
      expect(result.data.active).toBe(true);
      expect(result.data.soldOut).toBe(false);
    }
  });

  it("exige o nome", () => {
    const result = productSchema.safeParse({ ...produtoValido, name: "  " });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.name?.[0]).toMatch(/nome/i);
    }
  });

  it("recusa preço inválido ou negativo", () => {
    expect(productSchema.safeParse({ ...produtoValido, price: "abc" }).success).toBe(false);
    expect(productSchema.safeParse({ ...produtoValido, price: "-5" }).success).toBe(false);
  });

  it("aceita preço com vírgula ou ponto", () => {
    const comVirgula = productSchema.safeParse({ ...produtoValido, price: "12,50" });
    const comPonto = productSchema.safeParse({ ...produtoValido, price: "12.50" });
    expect(comVirgula.success && comVirgula.data.price).toBe(12.5);
    expect(comPonto.success && comPonto.data.price).toBe(12.5);
  });

  it("preço promocional vazio vira nulo", () => {
    const result = productSchema.safeParse({ ...produtoValido, promoPrice: "" });
    expect(result.success && result.data.promoPrice).toBeNull();
  });

  it("transforma listas separadas por vírgula", () => {
    const result = productSchema.safeParse({
      ...produtoValido,
      ingredients: "pão, carne , queijo,,",
      allergens: "glúten\nleite",
    });
    expect(result.success && result.data.ingredients).toEqual(["pão", "carne", "queijo"]);
    expect(result.success && result.data.allergens).toEqual(["glúten", "leite"]);
  });

  it("recusa link de pedido que não é endereço web", () => {
    const result = productSchema.safeParse({
      ...produtoValido,
      orderUrl: "javascript:alert(1)",
    });
    expect(result.success).toBe(false);
  });

  it("aceita link interno do próprio site", () => {
    const result = productSchema.safeParse({ ...produtoValido, orderUrl: "/delivery" });
    expect(result.success).toBe(true);
  });
});

describe("categoria", () => {
  it("exige nome", () => {
    expect(categorySchema.safeParse({ name: "" }).success).toBe(false);
  });

  it("desmarcado significa desativada", () => {
    const result = categorySchema.safeParse({ name: "Bebidas" });
    expect(result.success && result.data.active).toBe(false);
  });

  it("marcado significa ativa", () => {
    const result = categorySchema.safeParse({ name: "Bebidas", active: "on" });
    expect(result.success && result.data.active).toBe(true);
  });
});

describe("configuração de páginas", () => {
  it("aceita apenas chaves conhecidas", () => {
    expect(pageSettingsSchema.safeParse({ key: "HOME", label: "Início" }).success).toBe(true);
    expect(pageSettingsSchema.safeParse({ key: "OUTRA", label: "X" }).success).toBe(false);
  });

  it("exige o nome do menu", () => {
    expect(pageSettingsSchema.safeParse({ key: "MENU", label: "" }).success).toBe(false);
  });
});

describe("aparência", () => {
  const base = {
    colorPrimary: "#C2410C",
    colorSecondary: "#1C1917",
    colorAccent: "#F59E0B",
    colorBackground: "#FDFCF9",
    colorSurface: "#FFFFFF",
    colorText: "#1C1917",
    colorMuted: "#78716C",
    colorButton: "#C2410C",
    colorButtonText: "#FFFFFF",
    fontHeading: "Playfair Display",
    fontBody: "Inter",
    cardRadius: "18",
    cardShadow: "SOFT",
    cardStyle: "ELEVATED",
    buttonStyle: "PILL",
  };

  it("aceita configuração válida", () => {
    const result = appearanceSchema.safeParse(base);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.cardRadius).toBe(18);
  });

  it("recusa cor fora do formato hexadecimal", () => {
    expect(appearanceSchema.safeParse({ ...base, colorPrimary: "laranja" }).success).toBe(
      false,
    );
  });

  it("recusa raio de borda fora do limite", () => {
    expect(appearanceSchema.safeParse({ ...base, cardRadius: "999" }).success).toBe(false);
  });
});

describe("delivery, eventos e unidades", () => {
  it("canal de delivery exige link válido", () => {
    expect(
      deliveryOptionSchema.safeParse({ name: "iFood", url: "wa.me/551199" }).success,
    ).toBe(false);
    expect(
      deliveryOptionSchema.safeParse({ name: "iFood", url: "https://ifood.com.br" })
        .success,
    ).toBe(true);
  });

  it("evento exige data válida", () => {
    expect(eventSchema.safeParse({ name: "Show", startsAt: "não é data" }).success).toBe(
      false,
    );
    expect(
      eventSchema.safeParse({ name: "Show", startsAt: "2026-05-20T20:00" }).success,
    ).toBe(true);
  });

  it("unidade exige nome e endereço", () => {
    expect(locationSchema.safeParse({ name: "Centro" }).success).toBe(false);
    expect(
      locationSchema.safeParse({ name: "Centro", address: "Rua X, 10" }).success,
    ).toBe(true);
  });
});
