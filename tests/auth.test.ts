import { beforeAll, describe, expect, it } from "vitest";

import { hashPassword, verifyPassword } from "@/lib/auth/password";
import {
  createSessionToken,
  sessionMaxAgeSeconds,
  verifySessionToken,
} from "@/lib/auth/session";
import { changePasswordSchema, loginSchema } from "@/lib/validators";

const SESSION = {
  userId: "user_1",
  email: "admin@restaurante.com",
  name: "Administrador",
  role: "ADMIN" as const,
};

beforeAll(() => {
  process.env.AUTH_SECRET = "segredo-de-teste-com-mais-de-32-caracteres-ok";
});

describe("senha", () => {
  it("gera um hash diferente da senha original", async () => {
    const hash = await hashPassword("senha-super-secreta");
    expect(hash).not.toContain("senha-super-secreta");
    expect(hash.startsWith("$2")).toBe(true);
  });

  it("valida a senha correta e rejeita a errada", async () => {
    const hash = await hashPassword("senha-super-secreta");
    expect(await verifyPassword("senha-super-secreta", hash)).toBe(true);
    expect(await verifyPassword("outra-senha", hash)).toBe(false);
  });

  it("não aceita senha curta demais", async () => {
    await expect(hashPassword("1234")).rejects.toThrow();
  });

  it("não quebra quando o hash é inválido", async () => {
    expect(await verifyPassword("qualquer", "hash-invalido")).toBe(false);
    expect(await verifyPassword("", "")).toBe(false);
  });
});

describe("sessão", () => {
  it("cria e valida um token com os dados do usuário", async () => {
    const token = await createSessionToken(SESSION);
    const payload = await verifySessionToken(token);
    expect(payload).toEqual(SESSION);
  });

  it("recusa token adulterado", async () => {
    const token = await createSessionToken(SESSION);
    const adulterado = `${token.slice(0, -3)}abc`;
    expect(await verifySessionToken(adulterado)).toBeNull();
  });

  it("recusa token assinado com outro segredo", async () => {
    const token = await createSessionToken(SESSION);
    process.env.AUTH_SECRET = "outro-segredo-completamente-diferente-aqui";
    expect(await verifySessionToken(token)).toBeNull();
    process.env.AUTH_SECRET = "segredo-de-teste-com-mais-de-32-caracteres-ok";
  });

  it("recusa valores vazios", async () => {
    expect(await verifySessionToken(undefined)).toBeNull();
    expect(await verifySessionToken("")).toBeNull();
    expect(await verifySessionToken("nao-e-um-jwt")).toBeNull();
  });

  it("exige um segredo configurado", async () => {
    const anterior = process.env.AUTH_SECRET;
    process.env.AUTH_SECRET = "";
    await expect(createSessionToken(SESSION)).rejects.toThrow(/AUTH_SECRET/);
    process.env.AUTH_SECRET = anterior;
  });

  it("usa a duração configurada nas variáveis de ambiente", () => {
    const anterior = process.env.AUTH_SESSION_DAYS;
    process.env.AUTH_SESSION_DAYS = "2";
    expect(sessionMaxAgeSeconds()).toBe(2 * 24 * 60 * 60);
    process.env.AUTH_SESSION_DAYS = "valor-invalido";
    expect(sessionMaxAgeSeconds()).toBe(7 * 24 * 60 * 60);
    process.env.AUTH_SESSION_DAYS = anterior;
  });
});

describe("formulário de login", () => {
  it("aceita dados válidos", () => {
    const result = loginSchema.safeParse({
      email: " Admin@Restaurante.com ",
      password: "123456",
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.email).toBe("Admin@Restaurante.com");
  });

  it("recusa e-mail inválido", () => {
    const result = loginSchema.safeParse({ email: "sem-arroba", password: "123456" });
    expect(result.success).toBe(false);
  });

  it("recusa senha vazia", () => {
    const result = loginSchema.safeParse({ email: "a@b.com", password: "" });
    expect(result.success).toBe(false);
  });
});

describe("troca de senha", () => {
  it("exige que a confirmação seja igual", () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: "antiga",
      newPassword: "nova-senha-123",
      confirmPassword: "outra-coisa",
    });
    expect(result.success).toBe(false);
  });

  it("exige o tamanho mínimo", () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: "antiga",
      newPassword: "curta",
      confirmPassword: "curta",
    });
    expect(result.success).toBe(false);
  });

  it("aceita uma troca válida", () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: "antiga",
      newPassword: "nova-senha-123",
      confirmPassword: "nova-senha-123",
    });
    expect(result.success).toBe(true);
  });
});
