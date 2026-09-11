"use server";

import { redirect } from "next/navigation";

import {
  clearSessionCookie,
  getSession,
  login,
  setSessionCookie,
} from "@/lib/auth";
import { changePasswordSchema, loginSchema } from "@/lib/validators";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activity";
import { fail, fromZodError, ok } from "@/server/actions/helpers";
import type { ActionState } from "@/lib/types";

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

  await setSessionCookie(result.session);
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
