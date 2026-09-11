import { describe, expect, it } from "vitest";

import { getMenuGridLayout, splitIntoRows } from "@/lib/menu-layout";

/**
 * O layout adaptativo do cardápio é um dos requisitos centrais do projeto:
 * a grade nunca pode deixar uma última fileira quebrada.
 */
describe("splitIntoRows", () => {
  it("mantém tudo em uma fileira quando cabe", () => {
    expect(splitIntoRows(3, 4, 3)).toEqual([3]);
    expect(splitIntoRows(2, 3, 2)).toEqual([2]);
  });

  it("usa o menor número de fileiras possível", () => {
    expect(splitIntoRows(12, 4, 3)).toEqual([4, 4, 4]);
    expect(splitIntoRows(8, 4, 3)).toEqual([4, 4]);
  });

  it("coloca as fileiras com cards maiores primeiro", () => {
    expect(splitIntoRows(7, 4, 3)).toEqual([3, 4]);
    expect(splitIntoRows(10, 4, 3)).toEqual([3, 3, 4]);
    expect(splitIntoRows(11, 4, 3)).toEqual([3, 4, 4]);
  });

  it("devolve null quando não existe combinação exata", () => {
    expect(splitIntoRows(5, 4, 3)).toBeNull();
  });

  it("nunca deixa uma fileira incompleta", () => {
    for (let total = 1; total <= 40; total += 1) {
      const rows = splitIntoRows(total, 4, 3);
      if (rows === null) continue;
      expect(rows.reduce((sum, row) => sum + row, 0)).toBe(total);
      for (const row of rows) {
        expect(row === 4 || row === 3 || row === total).toBe(true);
      }
    }
  });
});

describe("getMenuGridLayout", () => {
  it("lista vazia não gera classes", () => {
    const layout = getMenuGridLayout(0);
    expect(layout.itemClasses).toHaveLength(0);
  });

  it("1 produto vira um card largo e em destaque", () => {
    const layout = getMenuGridLayout(1);
    expect(layout.emphasis).toBe("hero");
    expect(layout.desktopRows).toEqual([1]);
    expect(layout.itemClasses[0]).toContain("lg:col-span-12");
  });

  it("2 produtos ficam equilibrados lado a lado", () => {
    const layout = getMenuGridLayout(2);
    expect(layout.emphasis).toBe("large");
    expect(layout.desktopRows).toEqual([2]);
    expect(layout.itemClasses.every((item) => item.includes("lg:col-span-6"))).toBe(true);
  });

  it("3 produtos ocupam três colunas iguais", () => {
    const layout = getMenuGridLayout(3);
    expect(layout.desktopRows).toEqual([3]);
    expect(layout.itemClasses.every((item) => item.includes("lg:col-span-4"))).toBe(true);
  });

  it("4 produtos formam uma fileira de quatro no desktop e 2x2 no tablet", () => {
    const layout = getMenuGridLayout(4);
    expect(layout.desktopRows).toEqual([4]);
    expect(layout.tabletRows).toEqual([2, 2]);
  });

  it("5 produtos usam a composição 2 + 3 para não sobrar card solto", () => {
    const layout = getMenuGridLayout(5);
    expect(layout.desktopRows).toEqual([2, 3]);
    expect(layout.itemClasses[0]).toContain("lg:col-span-6");
    expect(layout.itemClasses[2]).toContain("lg:col-span-4");
  });

  it("6 produtos formam duas fileiras de três", () => {
    expect(getMenuGridLayout(6).desktopRows).toEqual([3, 3]);
  });

  it("gera uma classe por produto em qualquer quantidade", () => {
    for (let total = 1; total <= 40; total += 1) {
      const layout = getMenuGridLayout(total);
      expect(layout.itemClasses).toHaveLength(total);
      expect(layout.desktopRows.reduce((sum, row) => sum + row, 0)).toBe(total);
      expect(layout.tabletRows.reduce((sum, row) => sum + row, 0)).toBe(total);
    }
  });

  it("no celular usa uma coluna com poucos itens e duas com muitos", () => {
    expect(getMenuGridLayout(3).containerClass).toContain("grid-cols-1");
    expect(getMenuGridLayout(9).containerClass).toContain("grid-cols-2");
  });

  it("com quantidade ímpar no celular, o último card ocupa a linha inteira", () => {
    const layout = getMenuGridLayout(7);
    expect(layout.itemClasses[6]).toContain("col-span-2");
    expect(layout.itemClasses[0].startsWith("col-span-1")).toBe(true);
  });
});
