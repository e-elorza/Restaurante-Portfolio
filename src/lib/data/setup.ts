import { prisma } from "@/lib/prisma";

/**
 * O site ainda não tem nenhum conteúdo próprio?
 * Usado no painel para oferecer o atalho de carregar a demonstração.
 */
export async function isSiteEmpty(): Promise<boolean> {
  try {
    const [products, sections] = await Promise.all([
      prisma.product.count({ where: { deletedAt: null } }),
      prisma.homeSection.count(),
    ]);
    return products === 0 && sections === 0;
  } catch {
    return false;
  }
}
