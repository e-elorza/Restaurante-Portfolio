import "server-only";

import { prisma } from "@/lib/prisma";

export type ActivityInput = {
  userId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  message: string;
};

/**
 * Registra uma alteração feita no painel. Nunca lança erro: o histórico é um
 * recurso auxiliar e não pode impedir o administrador de salvar o conteúdo.
 */
export async function logActivity(input: ActivityInput): Promise<void> {
  try {
    await prisma.activityLog.create({
      data: {
        userId: input.userId ?? null,
        action: input.action,
        entity: input.entity,
        entityId: input.entityId ?? null,
        message: input.message.slice(0, 300),
      },
    });
  } catch {
    // silencioso por design
  }
}

export async function getRecentActivity(take = 8) {
  try {
    return await prisma.activityLog.findMany({
      orderBy: { createdAt: "desc" },
      take,
      include: { user: { select: { name: true } } },
    });
  } catch {
    return [];
  }
}
