"use server";

import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activity";
import { seedDemoContent } from "@/server/demo-content";
import { ok, revalidateSite, withActionState } from "@/server/actions/helpers";

/**
 * Preenche o site com o conteúdo de demonstração.
 *
 * Serve para quem acabou de publicar e quer ver o site "cheio" antes de
 * cadastrar o cardápio de verdade. É seguro rodar mais de uma vez: tudo usa
 * `upsert` e nada que já existe é sobrescrito — inclusive a página inicial, que
 * só é montada se ainda estiver vazia.
 */
export const loadDemoContentAction = withActionState(async (session) => {
  await seedDemoContent(prisma);

  await logActivity({
    userId: session.userId,
    action: "create",
    entity: "settings",
    message: `${session.name} carregou o conteúdo de demonstração`,
  });

  revalidateSite(["/admin"]);
  return ok("Conteúdo de demonstração carregado. Veja como o site ficou!");
});
