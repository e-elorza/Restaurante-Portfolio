"use server";

import { redirect } from "next/navigation";

import {
  clearSessionCookie,
  getSession,
  login,
  setSessionCookie,
} from "@/lib/auth";
import { changePasswordSchema, firstAdminSchema, loginSchema } from "@/lib/validators";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activity";
import { seedAdminUser } from "@/server/demo-content";
import { fail, fromZodError, ok } from "@/server/actions/helpers";
import type { ActionState } from "@/lib/types";

const MISSING_SECRET =
  "O site ainda não tem a variável AUTH_SECRET configurada, então não é possível manter você conectado. Configure-a nas variáveis de ambiente e publique o site de novo.";

/** Rotas do painel permitidas como destino após o login. */
function safeRedirect(target: string): string {
  if (!target.startsWith("/admin")) return "/admin";
  if (target.includes("//") || target.includes("..")) return "/admin";
  return target;
}

export async function loginAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    redirectTo: formData.get("redirectTo") ?? "/admin",
  });

  if (!parsed.success) return fromZodError(parsed.error);

  const result = await login(parsed.data.email, parsed.data.password);
  if (!result.ok) return fail(result.error);

  try {
    await setSessionCookie(result.session);
  } catch {
    return fail(MISSING_SECRET);
  }

  await logActivity({
    userId: result.session.userId,
    action: "login",
    entity: "user",
    entityId: result.session.userId,
    message: `${result.session.name} entrou no painel`,
  });

  redirect(safeRedirect(parsed.data.redirectTo));
}

export async function logoutAction(): Promise<void> {
  await clearSessionCookie();
  redirect("/admin/login");
}

export async function changePasswordAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await getSession();
  if (!session) return fail("Sua sessão expirou. Entre novamente.");

  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) return fromZodError(parsed.error);

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user) return fail("Usuário não encontrado.");

  const valid = await verifyPassword(parsed.data.currentPassword, user.passwordHash);
  if (!valid) return fail("A senha atual não confere.");

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await hashPassword(parsed.data.newPassword) },
  });

  await logActivity({
    userId: user.id,
    action: "update",
    entity: "user",
    entityId: user.id,
    message: `${user.name} alterou a própria senha`,
  });

  return ok("Senha alterada com sucesso.");
}

/**
 * Cria o primeiro administrador do painel.
 *
 * Só funciona enquanto não existir nenhum usuário — é o fluxo de primeiro
 * acesso logo depois de publicar o site, para ninguém precisar de linha de
 * comando. A partir do segundo usuário, novos acessos saem de dentro do painel.
 */
export async function createFirstAdminAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = firstAdminSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) return fromZodError(parsed.error);

  let total: number;
  try {
    total = await prisma.user.count();
  } catch {
    return fail(
      "Não foi possível falar com o banco de dados. Confira a variável DATABASE_URL e publique o site de novo.",
    );
  }

  if (total > 0) {
    return fail(
      "Este painel já tem um administrador. Use o formulário de login para entrar.",
    );
  }

  const email = await seedAdminUser(prisma, {
    email: parsed.data.email,
    password: parsed.data.password,
    name: parsed.data.name,
  });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return fail("Não foi possível criar o acesso. Tente novamente.");

  const session = {
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };

  try {
    await setSessionCookie(session);
  } catch {
    return fail(MISSING_SECRET);
  }

  await logActivity({
    userId: user.id,
    action: "create",
    entity: "user",
    entityId: user.id,
    message: `${user.name} criou o primeiro acesso ao painel`,
  });

  redirect("/admin");
}
