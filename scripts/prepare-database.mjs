/**
 * Aplica as migrations durante o build (usado no deploy da Vercel).
 *
 * Duas decisões importantes aqui:
 *
 * 1. Se existir `DIRECT_URL`, as migrations usam essa conexão. Provedores como
 *    Neon e Supabase oferecem uma URL com pooler (pgBouncer) para a aplicação e
 *    outra direta para migrations — o pooler não aceita os comandos do
 *    `prisma migrate`.
 *
 * 2. Uma falha aqui NÃO derruba o build. No primeiro deploy é comum o banco
 *    ainda não estar configurado; nesse caso o site sobe mostrando os valores
 *    padrão e o aviso abaixo explica o que fazer. Assim ninguém fica com um
 *    deploy vermelho por causa de uma variável de ambiente faltando.
 */
import { spawnSync } from "node:child_process";

const aviso = (mensagem) => console.warn(`\n⚠  ${mensagem}\n`);

const databaseUrl = process.env.DATABASE_URL?.trim();
const directUrl = process.env.DIRECT_URL?.trim();

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
  `→ Aplicando migrations${directUrl ? " (usando DIRECT_URL)" : ""}...`,
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
      "ou rode `npm run db:deploy` a partir da sua máquina.",
    ].join("\n   "),
  );
  process.exit(0);
}

console.log("✔ Banco de dados atualizado.\n");
