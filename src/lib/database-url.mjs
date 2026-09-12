/**
 * Descoberta da conexão com o banco de dados.
 *
 * O Prisma lê sempre `DATABASE_URL`, mas as integrações de banco da Vercel
 * criam variáveis com nomes próprios — e algumas exigem um prefixo escolhido
 * na hora de conectar (`MEUBANCO_URL`, `STORAGE_URL`, ...). Em vez de obrigar
 * o dono do site a descobrir o nome certo e duplicar a variável na mão, o
 * projeto procura a conexão nos nomes conhecidos e, se não achar, varre o
 * ambiente atrás de qualquer variável que contenha uma URL de PostgreSQL.
 *
 * Arquivo em JavaScript puro de propósito: é usado tanto pela aplicação
 * (TypeScript) quanto pelo script de build que roda antes do Next.js.
 */

/** Nomes conhecidos da conexão da aplicação, em ordem de preferência. */
const NOMES_CONEXAO = [
  "DATABASE_URL",
  "POSTGRES_PRISMA_URL",
  "POSTGRES_URL",
];

/** Nomes conhecidos da conexão direta (sem pooler), usada pelas migrations. */
const NOMES_CONEXAO_DIRETA = [
  "DIRECT_URL",
  "DATABASE_URL_UNPOOLED",
  "POSTGRES_URL_NON_POOLING",
];

/**
 * @typedef {Record<string, string | undefined>} Ambiente
 * @typedef {{ url: string, origem: string }} Conexao
 */

/**
 * Uma URL de PostgreSQL que o Prisma consegue abrir.
 * @param {unknown} valor
 * @returns {valor is string}
 */
function ehUrlPostgres(valor) {
  return typeof valor === "string" && /^postgres(ql)?:\/\/\S+/i.test(valor.trim());
}

/**
 * O Prisma Postgres entrega `prisma+postgres://...`, que exige a extensão
 * Accelerate no cliente. Detectamos para avisar com clareza em vez de falhar
 * com um erro de conexão genérico.
 * @param {unknown} valor
 * @returns {boolean}
 */
export function ehUrlPrismaAccelerate(valor) {
  return typeof valor === "string" && /^prisma\+postgres:\/\//i.test(valor.trim());
}

/**
 * @param {Ambiente} env
 * @param {readonly string[]} nomes
 * @returns {Conexao | null}
 */
function procurarNasVariaveis(env, nomes) {
  for (const nome of nomes) {
    const valor = env[nome]?.trim();
    if (ehUrlPostgres(valor)) return { url: valor, origem: nome };
  }
  return null;
}

/**
 * Última tentativa: qualquer variável de ambiente cujo valor seja uma URL de
 * PostgreSQL. É o que salva quem conectou o banco pela Vercel com um prefixo
 * personalizado. `excluir` evita reaproveitar a mesma variável já escolhida.
 * @param {Ambiente} env
 * @param {{ apenasDireta?: boolean, excluir?: readonly string[] }} [opcoes]
 * @returns {Conexao | null}
 */
function varrerAmbiente(env, { apenasDireta = false, excluir = [] } = {}) {
  const nomes = Object.keys(env)
    .filter((nome) => !excluir.includes(nome))
    .filter((nome) => /URL/i.test(nome))
    .sort();

  for (const nome of nomes) {
    const direta = /(UNPOOLED|NON_POOLING|DIRECT)/i.test(nome);
    if (direta !== apenasDireta) continue;
    const valor = env[nome]?.trim();
    if (ehUrlPostgres(valor)) return { url: valor, origem: nome };
  }
  return null;
}

/**
 * Conexão usada pela aplicação.
 * @param {Ambiente} [env]
 * @returns {Conexao | null}
 */
export function resolverConexao(env = process.env) {
  return (
    procurarNasVariaveis(env, NOMES_CONEXAO) ??
    varrerAmbiente(env) ??
    null
  );
}

/**
 * Conexão sem pooler, usada apenas pelas migrations.
 * @param {Ambiente} [env]
 * @param {readonly string[]} [excluir]
 * @returns {Conexao | null}
 */
export function resolverConexaoDireta(env = process.env, excluir = []) {
  return (
    procurarNasVariaveis(env, NOMES_CONEXAO_DIRETA) ??
    varrerAmbiente(env, { apenasDireta: true, excluir }) ??
    null
  );
}

/**
 * Garante que `DATABASE_URL` esteja definida, copiando de onde a conexão foi
 * encontrada. Devolve a origem usada (ou null quando não havia nada).
 * @param {Ambiente} [env]
 * @returns {string | null}
 */
export function normalizarDatabaseUrl(env = process.env) {
  if (ehUrlPostgres(env.DATABASE_URL)) return "DATABASE_URL";

  const encontrada = resolverConexao(env);
  if (!encontrada) return null;

  env.DATABASE_URL = encontrada.url;
  return encontrada.origem;
}
