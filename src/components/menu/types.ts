import type { PublicProduct } from "@/lib/types";

/** Produto pronto para o cardápio, já com o link de pedido resolvido. */
export type MenuProduct = PublicProduct & { orderLink: string };

export type MenuCategoryView = {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string | null;
  products: MenuProduct[];
};

export type MenuCurrency = { currency: string; locale: string };
