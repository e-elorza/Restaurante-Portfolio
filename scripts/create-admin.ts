/**
 * Cria (ou atualiza) o usuário administrador do painel.
 *
 * Uso:
 *   npm run create:admin
 *
 * Lê ADMIN_EMAIL, ADMIN_PASSWORD e ADMIN_NAME das variáveis de ambiente.
 * Também aceita argumentos na linha de comando:
 *   npm run create:admin -- email@restaurante.com "minha-senha" "Maria"
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const [argEmail, argPassword, argName] = process.argv.slice(2);

  const email = (argEmail ?? process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
  const password = argPassword ?? process.env.ADMIN_PASSWORD ?? "";
  const name = argName ?? process.env.ADMIN_NAME ?? "Administrador";

  if (!email || !email.includes("@")) {
    throw new Error(
      "Informe um e-mail válido em ADMIN_EMAIL ou como primeiro argumento.",
    );
  }

  if (password.length < 8) {
    throw new Error(
      "A senha precisa ter pelo menos 8 caracteres. Defina ADMIN_PASSWORD ou passe como segundo argumento.",
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.upsert({
    where: { email },
    update: { name, passwordHash, role: "ADMIN", active: true },
    create: { email, name, passwordHash, role: "ADMIN" },
  });

  console.log(`✔ Administrador pronto: ${user.email}`);
  console.log("  Acesse /admin/login para entrar no painel.");
}

main()
  .catch((error) => {
    console.error(`✖ ${error instanceof Error ? error.message : error}`);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
