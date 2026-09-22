"use server";

import { hashPassword } from "@/lib/auth/password";
import { logActivity } from "@/lib/activity";
import { prisma } from "@/lib/prisma";
import { newUserSchema } from "@/lib/validators";
import {
  fail,
  ok,
  requireActionSession,
  revalidateSite,
  str,
  withActionState,
} from "@/server/actions/helpers";
import type { SessionPayload } from "@/lib/auth";

const SEM_PERMISSAO =
  "Somente administradores podem gerenciar os acessos ao painel.";

/**
 * Gerenciar acessos é a única área restrita a administradores. Um editor entra
 * no painel e cuida do conteúdo, mas não cria nem remove contas.
 */
function assertAdmin(session: SessionPayload): void {
  if (session.role !== "ADMIN") throw new Error(SEM_PERMISSAO);
}

/** Quantos administradores ativos existem além deste. */
async function outrosAdminsAtivos(id: string): Promise<number> {
  return prisma.user.count({
    where: { role: "ADMIN", active: true, id: { not: id } },
  });
}

/** Cria um novo acesso ao painel. Quem cria já precisa estar logado. */
export const createUserAction = withActionState(async (session, formData) => {
  assertAdmin(session);

  const parsed = newUserSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    role: formData.get("role") || "ADMIN",
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) throw parsed.error;

  const email = parsed.data.email.toLowerCase();

  // Nunca sobrescrevemos um acesso existente: isso trocaria a senha de outra
  // pessoa sem ela saber.
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return fail("Já existe um acesso com esse e-mail.", {
      email: ["Já existe um acesso com esse e-mail."],
    });
  }

  const created = await prisma.user.create({
    data: {
      email,
      name: parsed.data.name,
      role: parsed.data.role,
      passwordHash: await hashPassword(parsed.data.password),
    },
  });

  await logActivity({
    userId: session.userId,
    action: "create",
    entity: "user",
    entityId: created.id,
    message: `${session.name} criou o acesso de ${created.name} (${created.email})`,
  });

  revalidateSite(["/admin/usuarios"]);
  return ok(
    `Acesso criado. ${created.name} já pode entrar com o e-mail ${created.email}.`,
  );
});

/** Liga ou desliga um acesso. Desligado, a pessoa não consegue mais entrar. */
export async function toggleUserAction(formData: FormData): Promise<void> {
  const session = await requireActionSession();
  if (session.role !== "ADMIN") return;

  const id = str(formData, "id");
  const active = str(formData, "active") === "true";
  if (!id || id === session.userId) return;

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return;

  // Não deixamos o painel ficar sem nenhum administrador capaz de entrar.
  if (!active && user.role === "ADMIN" && (await outrosAdminsAtivos(id)) === 0) {
    return;
  }

  await prisma.user.update({ where: { id }, data: { active } });

  await logActivity({
    userId: session.userId,
    action: "update",
    entity: "user",
    entityId: id,
    message: `${session.name} ${active ? "reativou" : "desativou"} o acesso de ${user.name}`,
  });

  revalidateSite(["/admin/usuarios"]);
}

/** Remove um acesso de vez. O histórico de alterações dele é preservado. */
export async function deleteUserAction(formData: FormData): Promise<void> {
  const session = await requireActionSession();
  if (session.role !== "ADMIN") return;

  const id = str(formData, "id");
  if (!id || id === session.userId) return;

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return;

  if (user.role === "ADMIN" && (await outrosAdminsAtivos(id)) === 0) return;

  await prisma.user.delete({ where: { id } });

  await logActivity({
    userId: session.userId,
    action: "delete",
    entity: "user",
    entityId: id,
    message: `${session.name} removeu o acesso de ${user.name} (${user.email})`,
  });

  revalidateSite(["/admin/usuarios"]);
}
