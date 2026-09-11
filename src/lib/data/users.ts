import { cache } from "react";

import { prisma } from "@/lib/prisma";

/**
 * Estado do acesso ao painel, usado pela tela de login.
 *
 * - `sem-banco`: não conseguimos falar com o banco de dados;
 * - `primeiro-acesso`: o banco está pronto, mas ainda não existe nenhum usuário;
 * - `pronto`: já existe pelo menos um administrador.
 */
export type AdminAccessState = "sem-banco" | "primeiro-acesso" | "pronto";

export const getAdminAccessState = cache(async (): Promise<AdminAccessState> => {
  try {
    const total = await prisma.user.count();
    return total === 0 ? "primeiro-acesso" : "pronto";
  } catch {
    return "sem-banco";
  }
});

/** Quantos usuários existem (0 quando o banco não responde). */
export async function countUsers(): Promise<number> {
  try {
    return await prisma.user.count();
  } catch {
    return 0;
  }
}
