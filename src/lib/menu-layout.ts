/**
 * Layout adaptativo do cardápio.
 *
 * A quantidade de produtos de uma categoria muda o desenho da grade para que
 * nunca sobre uma "linha órfã" (uma última fileira com um único card perdido).
 *
 * Estratégia:
 *  - 1 produto  → card único, largo e centralizado (destaque total);
 *  - 2 produtos → dois cards equilibrados;
 *  - 3 produtos → três colunas;
 *  - 5 produtos → composição 2 + 3;
 *  - demais     → o total é decomposto em fileiras de 4 e de 3 itens
 *                 (4a + 3b = n), sempre completas. As fileiras de 3 (cards
 *                 maiores) vêm primeiro, dando destaque aos primeiros itens.
 *
 * O mesmo raciocínio é aplicado ao tablet com fileiras de 3 e 2 itens, e no
 * celular usamos 1 coluna (poucos itens) ou 2 colunas — nesse caso, um total
 * ímpar faz o último card ocupar a largura inteira.
 */

export type MenuEmphasis = "hero" | "large" | "normal";

export type MenuGridLayout = {
  /** Classes do container `grid`. */
  containerClass: string;
  /** Classes de cada item, na ordem dos produtos. */
  itemClasses: string[];
  /** Destaque visual sugerido para os cards. */
  emphasis: MenuEmphasis;
  /** Fileiras calculadas para o desktop (usado nos testes e na depuração). */
  desktopRows: number[];
  /** Fileiras calculadas para o tablet. */
  tabletRows: number[];
};

const DESKTOP_COLUMNS = 12;
const TABLET_COLUMNS = 6;

const DESKTOP_SPAN_CLASS: Record<number, string> = {
  3: "lg:col-span-3",
  4: "lg:col-span-4",
  6: "lg:col-span-6",
  12: "lg:col-span-12",
};

const TABLET_SPAN_CLASS: Record<number, string> = {
  2: "md:col-span-2",
  3: "md:col-span-3",
  6: "md:col-span-6",
};

/**
 * Decompõe `total` em fileiras de `many` e `few` itens, usando o menor número
 * possível de fileiras. Retorna `null` quando não existe combinação exata
 * (por exemplo 5 itens em fileiras de 4 e 3).
 */
export function splitIntoRows(
  total: number,
  many: number,
  few: number,
): number[] | null {
  if (total <= 0) return [];
  if (total <= few) return [total];

  for (let manyRows = Math.floor(total / many); manyRows >= 0; manyRows--) {
    const rest = total - manyRows * many;
    if (rest % few === 0) {
      const fewRows = rest / few;
      // Fileiras com menos itens (cards maiores) primeiro.
      return [
        ...Array.from({ length: fewRows }, () => few),
        ...Array.from({ length: manyRows }, () => many),
      ];
    }
  }

  return null;
}

function desktopRowPlan(total: number): number[] {
  if (total <= 0) return [];
  if (total <= 3) return [total];
  if (total === 5) return [2, 3];
  return splitIntoRows(total, 4, 3) ?? [total];
}

function tabletRowPlan(total: number): number[] {
  if (total <= 0) return [];
  if (total <= 2) return [total];
  return splitIntoRows(total, 3, 2) ?? [total];
}

/** Converte um plano de fileiras em uma lista de spans por item. */
function rowsToSpans(rows: number[], columns: number): number[] {
  const spans: number[] = [];
  for (const row of rows) {
    const span = Math.max(1, Math.round(columns / row));
    for (let i = 0; i < row; i += 1) spans.push(span);
  }
  return spans;
}

export function getMenuGridLayout(count: number): MenuGridLayout {
  if (count <= 0) {
    return {
      containerClass: "grid grid-cols-1 gap-6",
      itemClasses: [],
      emphasis: "normal",
      desktopRows: [],
      tabletRows: [],
    };
  }

  const desktopRows = desktopRowPlan(count);
  const tabletRows = tabletRowPlan(count);
  const desktopSpans = rowsToSpans(desktopRows, DESKTOP_COLUMNS);
  const tabletSpans = rowsToSpans(tabletRows, TABLET_COLUMNS);

  const mobileColumns = count <= 4 ? 1 : 2;
  const oddOnMobile = mobileColumns === 2 && count % 2 === 1;

  const containerClass =
    mobileColumns === 1
      ? "grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-6 lg:grid-cols-12"
      : "grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-6 lg:grid-cols-12 lg:gap-6";

  const itemClasses = Array.from({ length: count }, (_, index) => {
    const isLast = index === count - 1;
    const mobileClass =
      mobileColumns === 1 ? "col-span-1" : oddOnMobile && isLast ? "col-span-2" : "col-span-1";
    const tabletClass = TABLET_SPAN_CLASS[tabletSpans[index] ?? 3] ?? "md:col-span-3";
    const desktopClass = DESKTOP_SPAN_CLASS[desktopSpans[index] ?? 4] ?? "lg:col-span-4";
    return `${mobileClass} ${tabletClass} ${desktopClass}`;
  });

  const emphasis: MenuEmphasis = count === 1 ? "hero" : count === 2 ? "large" : "normal";

  return { containerClass, itemClasses, emphasis, desktopRows, tabletRows };
}
