import { describe, expect, it } from "vitest";
import type { Page } from "@prisma/client";

import {
  enabledPageKeys,
  footerNavigation,
  isPageVisible,
  menuNavigation,
} from "@/lib/navigation";
import { isSectionVisible, mergeSectionConfig } from "@/lib/home-sections";
import { HERO_DEFAULT, PAGE_DEFINITIONS } from "@/lib/constants";

function page(overrides: Partial<Page> & Pick<Page, "key">): Page {
  const definition = PAGE_DEFINITIONS.find((item) => item.key === overrides.key)!;
  return {
    label: definition.label,
    path: definition.path,
    enabled: definition.locked,
    lockedEnabled: definition.locked,
    position: definition.position,
    showInMenu: true,
    showInFooter: true,
    headline: "",
    intro: "",
    metaTitle: "",
    metaDescription: "",
    socialImageUrl: null,
    updatedAt: new Date(0),
    ...overrides,
  };
}

describe("visibilidade das páginas", () => {
  it("Início e Cardápio são sempre visíveis", () => {
    expect(isPageVisible(page({ key: "HOME", enabled: false }))).toBe(true);
    expect(isPageVisible(page({ key: "MENU", enabled: false }))).toBe(true);
  });

  it("páginas opcionais desligadas ficam invisíveis", () => {
    expect(isPageVisible(page({ key: "DELIVERY", enabled: false }))).toBe(false);
    expect(isPageVisible(page({ key: "EVENTS", enabled: false }))).toBe(false);
    expect(isPageVisible(page({ key: "LOCATIONS", enabled: false }))).toBe(false);
    expect(isPageVisible(page({ key: "CONTACT", enabled: false }))).toBe(false);
  });

  it("páginas opcionais ligadas ficam visíveis", () => {
    expect(isPageVisible(page({ key: "DELIVERY", enabled: true }))).toBe(true);
  });
});

describe("menu e rodapé", () => {
  const pages = [
    page({ key: "HOME" }),
    page({ key: "MENU" }),
    page({ key: "DELIVERY", enabled: false }),
    page({ key: "EVENTS", enabled: true }),
    page({ key: "LOCATIONS", enabled: true, showInMenu: false }),
    page({ key: "CONTACT", enabled: true, showInFooter: false }),
  ];

  it("esconde do menu as páginas desligadas", () => {
    const items = menuNavigation(pages).map((item) => item.key);
    expect(items).not.toContain("DELIVERY");
    expect(items).toContain("EVENTS");
  });

  it("respeita a opção de não exibir no menu", () => {
    const items = menuNavigation(pages).map((item) => item.key);
    expect(items).not.toContain("LOCATIONS");
  });

  it("respeita a opção de não exibir no rodapé", () => {
    const items = footerNavigation(pages).map((item) => item.key);
    expect(items).not.toContain("CONTACT");
    expect(items).toContain("LOCATIONS");
  });

  it("devolve os links com o endereço correto", () => {
    const home = menuNavigation(pages).find((item) => item.key === "HOME");
    expect(home?.path).toBe("/");
    const menu = menuNavigation(pages).find((item) => item.key === "MENU");
    expect(menu?.path).toBe("/cardapio");
  });

  it("lista as chaves das páginas ligadas", () => {
    const keys = enabledPageKeys(pages);
    expect(keys.has("HOME")).toBe(true);
    expect(keys.has("DELIVERY")).toBe(false);
    expect(keys.has("EVENTS")).toBe(true);
  });
});

describe("seções da página inicial", () => {
  const enabled = new Set(["HOME", "MENU", "LOCATIONS"] as const);

  it("seção desativada não aparece", () => {
    expect(
      isSectionVisible({ type: "HERO", enabled: false }, enabled as never),
    ).toBe(false);
  });

  it("seção sem dependência aparece quando ativada", () => {
    expect(isSectionVisible({ type: "HERO", enabled: true }, enabled as never)).toBe(true);
  });

  it("seção de Delivery some quando a página Delivery está desligada", () => {
    expect(
      isSectionVisible({ type: "DELIVERY_CTA", enabled: true }, enabled as never),
    ).toBe(false);
  });

  it("seção de Unidades aparece quando a página Unidades está ligada", () => {
    expect(
      isSectionVisible({ type: "LOCATIONS", enabled: true }, enabled as never),
    ).toBe(true);
  });
});

describe("configuração das seções", () => {
  it("usa os valores padrão quando não há nada salvo", () => {
    expect(mergeSectionConfig("HERO", null)).toEqual(HERO_DEFAULT);
    expect(mergeSectionConfig("HERO", undefined)).toEqual(HERO_DEFAULT);
  });

  it("ignora conteúdo inválido salvo no banco", () => {
    expect(mergeSectionConfig("HERO", ["a", "b"])).toEqual(HERO_DEFAULT);
    expect(mergeSectionConfig("HERO", "texto")).toEqual(HERO_DEFAULT);
  });

  it("mantém os campos salvos e completa o que falta", () => {
    const config = mergeSectionConfig("HERO", { title: "x", overlay: 10 });
    expect(config.overlay).toBe(10);
    expect(config.buttonLabel).toBe(HERO_DEFAULT.buttonLabel);
    expect(config.height).toBe(HERO_DEFAULT.height);
  });
});
