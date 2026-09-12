import { describe, expect, it } from "vitest";

// Módulo em JavaScript puro, compartilhado com o script de build.
import {
  ehUrlPrismaAccelerate,
  normalizarDatabaseUrl,
  resolverConexao,
  resolverConexaoDireta,
} from "@/lib/database-url.mjs";

const POOL = "postgresql://u:s@host-pooler.neon.tech/db?sslmode=require";
const DIRETA = "postgresql://u:s@host.neon.tech/db?sslmode=require";

describe("descoberta da conexão do banco", () => {
  it("usa DATABASE_URL quando ela existe", () => {
    const env = { DATABASE_URL: POOL };
    expect(normalizarDatabaseUrl(env)).toBe("DATABASE_URL");
    expect(env.DATABASE_URL).toBe(POOL);
  });

  it("encontra a conexão criada pelo Vercel Postgres", () => {
    const env: Record<string, string> = { POSTGRES_URL: POOL };
    expect(normalizarDatabaseUrl(env)).toBe("POSTGRES_URL");
    expect(env.DATABASE_URL).toBe(POOL);
  });

  it("encontra a conexão mesmo com prefixo personalizado da integração", () => {
    const env: Record<string, string> = { MEU_RESTAURANTE_URL: POOL };
    expect(normalizarDatabaseUrl(env)).toBe("MEU_RESTAURANTE_URL");
    expect(env.DATABASE_URL).toBe(POOL);
  });

  it("ignora variáveis que não são endereços de PostgreSQL", () => {
    const env = { SITE_URL: "https://exemplo.com", OUTRA: "texto" };
    expect(normalizarDatabaseUrl(env)).toBeNull();
    expect(resolverConexao(env)).toBeNull();
  });

  it("prefere a conexão com pooler para a aplicação", () => {
    const env = { LOJA_URL: POOL, LOJA_URL_UNPOOLED: DIRETA };
    expect(resolverConexao(env)?.origem).toBe("LOJA_URL");
  });
});

describe("conexão direta para as migrations", () => {
  it("reconhece DIRECT_URL", () => {
    expect(resolverConexaoDireta({ DIRECT_URL: DIRETA })?.origem).toBe("DIRECT_URL");
  });

  it("reconhece o nome criado pelo Neon", () => {
    const env = { DATABASE_URL: POOL, DATABASE_URL_UNPOOLED: DIRETA };
    expect(resolverConexaoDireta(env)?.origem).toBe("DATABASE_URL_UNPOOLED");
  });

  it("reconhece o nome criado pelo Vercel Postgres", () => {
    const env = { POSTGRES_URL: POOL, POSTGRES_URL_NON_POOLING: DIRETA };
    expect(resolverConexaoDireta(env)?.origem).toBe("POSTGRES_URL_NON_POOLING");
  });

  it("reconhece a versão sem pooler mesmo com prefixo personalizado", () => {
    const env = { LOJA_URL: POOL, LOJA_URL_UNPOOLED: DIRETA };
    expect(resolverConexaoDireta(env, ["LOJA_URL"])?.origem).toBe("LOJA_URL_UNPOOLED");
  });

  it("não devolve a mesma variável já usada pela aplicação", () => {
    const env = { LOJA_URL: POOL };
    expect(resolverConexaoDireta(env, ["LOJA_URL"])).toBeNull();
  });
});

describe("Prisma Accelerate", () => {
  it("identifica o formato prisma+postgres://", () => {
    expect(
      ehUrlPrismaAccelerate("prisma+postgres://accelerate.prisma-data.net/?api_key=x"),
    ).toBe(true);
    expect(ehUrlPrismaAccelerate(POOL)).toBe(false);
  });

  it("não trata a URL do Accelerate como conexão válida", () => {
    const env = { DATABASE_URL: "prisma+postgres://accelerate.prisma-data.net/?api_key=x" };
    expect(resolverConexao(env)).toBeNull();
  });
});
