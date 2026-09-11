/**
 * Popula o banco com conteúdo fictício de demonstração.
 *
 * Executar com: npm run db:seed
 *
 * O conteúdo em si vive em `src/server/demo-content.ts`, porque também é usado
 * pelo botão "Carregar conteúdo de demonstração" do painel.
 */
import { PrismaClient } from "@prisma/client";

import { seedAdminUser, seedDemoContent } from "../src/server/demo-content";

const prisma = new PrismaClient();

async function main() {
  console.log("Populando o banco com conteúdo de demonstração...");

  const email = process.env.ADMIN_EMAIL ?? "admin@restaurante.com";
  const password = process.env.ADMIN_PASSWORD ?? "admin12345";
  const name = process.env.ADMIN_NAME ?? "Administrador";

  if (password.length < 8) {
    throw new Error("ADMIN_PASSWORD precisa ter pelo menos 8 caracteres.");
  }

  const created = await seedAdminUser(prisma, { email, password, name });
  console.log(`  · usuário administrador: ${created}`);

  await seedDemoContent(prisma);
  console.log("✔ Pronto! Acesse /admin para entrar no painel.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
