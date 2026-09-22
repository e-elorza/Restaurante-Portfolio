import { cache } from "react";
import type { Role } from "@prisma/client";

import { prisma, safeQuery } from "@/lib/prisma";

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

/** Tipo de acesso mostrado no painel. */
export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  active: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
};

/** Todos os acessos ao painel, do mais antigo para o mais novo. */
export async function getAdminUsers(): Promise<AdminUser[]> {
  return safeQuery(
    () =>
      prisma.user.findMany({
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          active: true,
          lastLoginAt: true,
          createdAt: true,
        },
      }),
    [],
  );
}
