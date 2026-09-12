/**
 * Aplica as migrations durante o build (usado no deploy da Vercel).
 *
 * Duas decisões importantes aqui:
 *
 * 1. As migrations usam a conexão direta (sem pooler) quando ela existe.
 *    Provedores como Neon e Supabase oferecem uma URL com pooler (pgBouncer)
 *    para a aplicação e outra direta para migrations — o pooler não aceita os
 *    comandos do `prisma migrate`. Além da nossa `DIRECT_URL`, aceitamos os
 *    nomes que as integrações da Vercel criam sozinhas, para que ninguém
 *    precise copiar a URL na mão.
 *
 * 2. Uma falha aqui NÃO derruba o build. No primeiro deploy é comum o banco
 *    ainda não estar configurado; nesse caso o site sobe mostrando os valores
 *    padrão e o aviso abaixo explica o que fazer. Assim ninguém fica com um
 *    deploy vermelho por causa de uma variável de ambiente faltando.
 */
import { spawnSync } from "node:child_process";

const aviso = (mensagem) => console.warn(`\n⚠  ${mensagem}\n`);

/**
 * Nomes usados para a conexão direta, em ordem de preferência:
 * - DIRECT_URL ................ definida manualmente (documentada no .env.example);
 * - DATABASE_URL_UNPOOLED ..... criada pela integração do Neon;
 * - POSTGRES_URL_NON_POOLING .. criada pelas integrações Vercel Postgres/Supabase.
 */
const VARIAVEIS_CONEXAO_DIRETA = [
  "DIRECT_URL",
  "DATABASE_URL_UNPOOLED",
  "POSTGRES_URL_NON_POOLING",
];

const databaseUrl = process.env.DATABASE_URL?.trim();

const origemDireta = VARIAVEIS_CONEXAO_DIRETA.find(
  (nome) => process.env[nome]?.trim(),
);
const directUrl = origemDireta ? process.env[origemDireta].trim() : undefined;

if (!databaseUrl) {
  aviso(
    [
      "DATABASE_URL não está configurada — as migrations foram puladas.",
      "O site vai subir, mas sem banco de dados (conteúdo padrão e painel indisponível).",
      "Configure DATABASE_URL nas variáveis de ambiente e refaça o deploy.",
    ].join("\n   "),
  );
  process.exit(0);
}

console.log(
  `→ Aplicando migrations${directUrl ? ` (conexão direta via ${origemDireta})` : ""}...`,
);

const resultado = spawnSync(
  "npx",
  ["prisma", "migrate", "deploy"],
  {
    stdio: "inherit",
    env: { ...process.env, DATABASE_URL: directUrl || databaseUrl },
    shell: process.platform === "win32",
  },
);

if (resultado.status !== 0) {
  aviso(
    [
      "Não foi possível aplicar as migrations.",
      "O build continua, mas o site pode aparecer vazio até o banco estar pronto.",
      "Confira a DATABASE_URL (e a DIRECT_URL, se o seu provedor usa pooler)",
      "Se o seu banco usa pooler e a migration reclamou de transação preparada,",
      "informe a conexão direta em DIRECT_URL.",
      "ou rode `npm run db:deploy` a partir da sua máquina.",
    ].join("\n   "),
  );
  process.exit(0);
}

console.log("✔ Banco de dados atualizado.\n");
