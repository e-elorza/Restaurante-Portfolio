import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import {
  SESSION_COOKIE,
  createSessionToken,
  sessionMaxAgeSeconds,
  verifySessionToken,
  type SessionPayload,
} from "@/lib/auth/session";
import { verifyPassword } from "@/lib/auth/password";

export type { SessionPayload };
export { SESSION_COOKIE };

/** Lê a sessão atual a partir do cookie (sem consultar o banco). */
export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  return verifySessionToken(store.get(SESSION_COOKIE)?.value);
}

/**
 * Garante que existe uma sessão válida. Redireciona para o login caso
 * contrário. Usado por todas as páginas e Server Actions do /admin.
 */
export async function requireSession(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  return session;
}

/** Igual a `requireSession`, mas também exige o papel ADMIN. */
export async function requireAdmin(): Promise<SessionPayload> {
  const session = await requireSession();
  if (session.role !== "ADMIN") redirect("/admin?erro=permissao");
  return session;
}

export async function setSessionCookie(payload: SessionPayload): Promise<void> {
  const token = await createSessionToken(payload);
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: sessionMaxAgeSeconds(),
  });
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export type LoginResult =
  | { ok: true; session: SessionPayload }
  | { ok: false; error: string };

/**
 * Valida e-mail e senha contra o banco. A mensagem de erro é sempre a mesma
 * para não revelar se o e-mail existe.
 */
export async function login(
  email: string,
  password: string,
): Promise<LoginResult> {
  const genericError = "E-mail ou senha incorretos.";
  const normalized = email.trim().toLowerCase();

  const user = await prisma.user.findUnique({ where: { email: normalized } });
  if (!user || !user.active) return { ok: false, error: genericError };

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) return { ok: false, error: genericError };

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  return {
    ok: true,
    session: {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  };
}
