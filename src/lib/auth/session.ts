import { SignJWT, jwtVerify } from "jose";

/**
 * Utilitários de sessão baseados em JWT assinado (HS256) guardado em cookie
 * httpOnly. Este arquivo é compatível com o Edge Runtime (usa apenas `jose`),
 * por isso pode ser importado pelo middleware.
 */

export const SESSION_COOKIE = "cardapio_session";

export type SessionPayload = {
  userId: string;
  email: string;
  name: string;
  role: "ADMIN" | "EDITOR";
};

const encoder = new TextEncoder();

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error(
      "AUTH_SECRET não configurado. Defina uma chave com pelo menos 32 caracteres nas variáveis de ambiente.",
    );
  }
  return encoder.encode(secret);
}

export function sessionMaxAgeSeconds(): number {
  const days = Number(process.env.AUTH_SESSION_DAYS ?? 7);
  const safeDays = Number.isFinite(days) && days > 0 ? days : 7;
  return Math.floor(safeDays * 24 * 60 * 60);
}

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setSubject(payload.userId)
    .setExpirationTime(`${sessionMaxAgeSeconds()}s`)
    .sign(getSecret());
}

export async function verifySessionToken(
  token: string | undefined | null,
): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret(), {
      algorithms: ["HS256"],
    });
    if (
      typeof payload.userId !== "string" ||
      typeof payload.email !== "string" ||
      typeof payload.name !== "string" ||
      (payload.role !== "ADMIN" && payload.role !== "EDITOR")
    ) {
      return null;
    }
    return {
      userId: payload.userId,
      email: payload.email,
      name: payload.name,
      role: payload.role,
    };
  } catch {
    return null;
  }
}
