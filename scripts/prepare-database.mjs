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

import {
  ehUrlPrismaAccelerate,
  normalizarDatabaseUrl,
  resolverConexaoDireta,
} from "../src/lib/database-url.mjs";

const aviso = (mensagem) => console.warn(`\n⚠  ${mensagem}\n`);

const origemConexao = normalizarDatabaseUrl();
const databaseUrl = process.env.DATABASE_URL?.trim();

const conexaoDireta = resolverConexaoDireta(
  process.env,
  origemConexao ? [origemConexao] : [],
);
const directUrl = conexaoDireta?.url;

if (origemConexao && origemConexao !== "DATABASE_URL") {
  console.log(`→ Conexão do banco encontrada em ${origemConexao}.`);
}

// O Prisma Postgres entrega uma URL que o cliente padrão não abre.
const urlAccelerate = Object.entries(process.env).find(([, valor]) =>
  ehUrlPrismaAccelerate(valor),
);

if (!databaseUrl && urlAccelerate) {
  aviso(
    [
      `A variável ${urlAccelerate[0]} usa o formato "prisma+postgres://" (Prisma Accelerate),`,
      "que o cliente Prisma deste projeto não abre diretamente.",
      "Use um PostgreSQL comum (Neon, Supabase, Vercel Postgres) ou adicione",
      "o pacote @prisma/extension-accelerate ao projeto.",
    ].join("\n   "),
  );
  process.exit(0);
}

if (!databaseUrl) {
  aviso(
    [
      "DATABASE_URL não está configurada — as migrations foram puladas.",
      "O site vai subir, mas sem banco de dados (conteúdo padrão e painel indisponível).",
      "Configure DATABASE_URL nas variáveis de ambiente e refaça o deploy.",
      "Se você conectou o banco por uma integração da Vercel, confira se ela",
      "chegou a criar alguma variável com a URL de conexão.",
    ].join("\n   "),
  );
  process.exit(0);
}

console.log(
  `→ Aplicando migrations${
    directUrl ? ` (conexão direta via ${conexaoDireta.origem})` : ""
  }...`,
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

// ---------------------------------------------------------------------------
// Cardápio inicial (opcional)
// ---------------------------------------------------------------------------

/**
 * Com SEED_CARDAPIO=1 nas variáveis de ambiente, o build também cadastra a
 * lista de produtos de `scripts/seed-cardapio.mjs`. Serve para encher o
 * cardápio de um site recém-publicado sem precisar de linha de comando.
 *
 * O script é aditivo e idempotente: pula os produtos que já existem e nunca
 * altera o que foi cadastrado pelo painel. Por isso é seguro mesmo que o build
 * seja repetido. Ainda assim, remova a variável depois de usá-la — ela só faz
 * sentido uma vez.
 */
if (process.env.SEED_CARDAPIO === "1") {
  console.log("→ SEED_CARDAPIO=1: cadastrando os produtos do cardápio...");

  const cardapio = spawnSync("node", ["scripts/seed-cardapio.mjs"], {
    stdio: "inherit",
    env: process.env,
    shell: process.platform === "win32",
  });

  if (cardapio.status !== 0) {
    aviso(
      [
        "Não foi possível cadastrar os produtos do cardápio.",
        "O build continua normalmente — nada foi alterado no banco.",
      ].join("\n   "),
    );
  }
}
