import { PrismaClient } from "@prisma/client";

import { normalizarDatabaseUrl } from "@/lib/database-url.mjs";

// As integrações de banco da Vercel criam a variável com nomes próprios (e às
// vezes com um prefixo escolhido na hora de conectar). Copiamos a conexão para
// DATABASE_URL antes de instanciar o cliente, que é o nome que o Prisma lê.
const origemDaConexao = normalizarDatabaseUrl();

if (origemDaConexao && origemDaConexao !== "DATABASE_URL") {
  console.info(`[db] conexão encontrada em ${origemDaConexao}`);
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Instância única do Prisma Client.
 *
 * Em ambiente serverless (Vercel) cada invocação pode reaproveitar o mesmo
 * processo Node, por isso guardamos a instância no escopo global para não
 * abrir conexões novas a cada requisição.
 */
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

/**
 * Executa uma leitura no banco devolvendo um valor padrão caso a conexão
 * falhe. Isso mantém `next build` e o site no ar mesmo antes do banco estar
 * configurado (útil no primeiro deploy da Vercel).
 */
export async function safeQuery<T>(
  run: () => Promise<T>,
  fallback: T,
): Promise<T> {
  try {
    return await run();
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "[db] leitura ignorada — o banco de dados não respondeu:",
        error instanceof Error ? error.message : error,
      );
    }
    return fallback;
  }
}
