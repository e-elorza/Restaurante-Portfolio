/**
 * Adiciona hambúrgueres e entradas ao cardápio.
 *
 * É um complemento ao `db:seed`: aqui não há conteúdo de demonstração do site
 * inteiro, só produtos. Serve para encher o cardápio de uma vez, sem cadastrar
 * item por item pelo painel.
 *
 * Características importantes:
 *  - idempotente: roda quantas vezes quiser sem duplicar nada (upsert por slug);
 *  - aditivo: nunca apaga nem desativa o que já existe;
 *  - não sobrescreve preço, foto nem textos de um produto que já esteja no
 *    banco — se o slug já existe, ele é deixado como está.
 *
 * Como rodar:
 *   node --env-file=.env scripts/seed-cardapio.mjs
 *
 * Para preencher o site publicado, aponte a DATABASE_URL para o banco de
 * produção:
 *   DATABASE_URL="postgresql://..." node scripts/seed-cardapio.mjs
 */
import { PrismaClient } from "@prisma/client";

import { normalizarDatabaseUrl } from "../src/lib/database-url.mjs";

normalizarDatabaseUrl();

const prisma = new PrismaClient();

/**
 * Endereço da foto de cada produto.
 *
 * Deixe em branco para cadastrar o produto sem foto e enviá-la depois pelo
 * painel (Produtos → o item → Foto principal). Também aceita a URL de uma
 * imagem já hospedada.
 */
const SEM_FOTO = "";

/** @typedef {{slug: string, name: string, shortDescription: string, description: string, price: number, promoPrice?: number, imageUrl?: string, tags?: string[], ingredients: string[], allergens?: string[], featured?: boolean, isNew?: boolean, bestSeller?: boolean, nutrition?: Record<string, string>}} Produto */

/** @type {{slug: string, name: string, description: string, produtos: Produto[]}[]} */
const CATEGORIAS = [
  {
    slug: "hamburgueres",
    name: "Hambúrgueres",
    description:
      "Blend de 180g maturado na casa, selado na brasa e pão de fermentação natural.",
    produtos: [
      {
        slug: "costela-lenta",
        name: "Costela Lenta",
        shortDescription: "Costela desfiada por 12 horas na brasa, com queijo prato.",
        description:
          "Costela bovina que passa doze horas na brasa baixa até desmanchar no garfo, desfiada e regada no próprio caldo reduzido. Vai com queijo prato, cebola roxa em conserva e maionese de alho assado, no pão brioche.",
        price: 46.9,
        imageUrl: SEM_FOTO,
        tags: ["Cozimento lento", "Brasa"],
        ingredients: ["Pão brioche", "Costela desfiada 12h", "Queijo prato", "Cebola roxa em conserva", "Maionese de alho assado"],
        allergens: ["Glúten", "Leite", "Ovo"],
        featured: true,
        nutrition: { calories: "780 kcal", protein: "42 g", carbs: "46 g", fat: "44 g" },
      },
      {
        slug: "brie-e-figo",
        name: "Brie & Figo",
        shortDescription: "Blend 180g, brie derretido e geleia de figo da casa.",
        description:
          "O mais doce da casa, sem perder a brasa. Blend de 180g, brie que derrete no calor da chapa, geleia de figo feita aqui com pouco açúcar e rúcula para cortar. Pão australiano levemente tostado.",
        price: 47.9,
        imageUrl: SEM_FOTO,
        tags: ["Agridoce", "Especial"],
        ingredients: ["Pão australiano", "Blend 180g", "Queijo brie", "Geleia de figo", "Rúcula"],
        allergens: ["Glúten", "Leite"],
        isNew: true,
      },
      {
        slug: "pimenta-preta",
        name: "Pimenta Preta",
        shortDescription: "Molho de pimenta-do-reino moída na hora e cebola crispy.",
        description:
          "Para quem gosta de sentir a pimenta. Blend de 180g selado na brasa, molho cremoso de pimenta-do-reino moída na hora, queijo prato e cebola crispy. Arde na medida — não é picante de queimar.",
        price: 43.9,
        imageUrl: SEM_FOTO,
        tags: ["Picante"],
        ingredients: ["Pão brioche", "Blend 180g", "Molho de pimenta-do-reino", "Queijo prato", "Cebola crispy"],
        allergens: ["Glúten", "Leite"],
      },
      {
        slug: "smash-da-chapa",
        name: "Smash da Chapa",
        shortDescription: "Dois discos finos prensados na chapa, queijo e molho especial.",
        description:
          "Dois discos de 90g prensados na chapa quente até formar a borda crocante, duas fatias de queijo prato, picles e o molho especial da casa. Pão de batata macio. Simples, rápido e do jeito certo.",
        price: 36.9,
        imageUrl: SEM_FOTO,
        tags: ["Smash", "Clássico"],
        ingredients: ["Pão de batata", "2 discos 90g", "Queijo prato", "Picles", "Molho especial"],
        allergens: ["Glúten", "Leite", "Ovo"],
        bestSeller: true,
      },
      {
        slug: "cordeiro-e-hortela",
        name: "Cordeiro & Hortelã",
        shortDescription: "Blend de cordeiro, iogurte de hortelã e pepino em conserva.",
        description:
          "Blend de paleta de cordeiro temperado só com sal e alho, grelhado na brasa. Molho de iogurte com hortelã fresca, pepino em conserva e cebola roxa. Pão australiano.",
        price: 54.9,
        imageUrl: SEM_FOTO,
        tags: ["Especial"],
        ingredients: ["Pão australiano", "Blend de cordeiro", "Iogurte de hortelã", "Pepino em conserva", "Cebola roxa"],
        allergens: ["Glúten", "Leite"],
      },
      {
        slug: "linguica-da-casa",
        name: "Linguiça da Casa",
        shortDescription: "Blend de linguiça artesanal, provolone e vinagrete de pimenta.",
        description:
          "Linguiça artesanal feita para nós por um produtor da serra, aberta e grelhada na brasa. Provolone maturado, vinagrete de pimenta biquinho e mostarda amarela. Pão de batata.",
        price: 41.9,
        imageUrl: SEM_FOTO,
        tags: ["Brasa"],
        ingredients: ["Pão de batata", "Linguiça artesanal", "Provolone", "Vinagrete de pimenta biquinho", "Mostarda"],
        allergens: ["Glúten", "Leite", "Mostarda"],
      },
      {
        slug: "cogumelos-na-brasa",
        name: "Cogumelos na Brasa",
        shortDescription: "Portobello inteiro grelhado, queijo coalho e alho-poró.",
        description:
          "Um portobello grande grelhado inteiro na brasa até soltar todo o suco, queijo coalho dourado, alho-poró confitado e maionese de ervas sem ovo. Vegetariano de verdade, não é adaptação de outro lanche.",
        price: 38.9,
        imageUrl: SEM_FOTO,
        tags: ["Vegetariano", "Sem carne"],
        ingredients: ["Pão australiano", "Portobello grelhado", "Queijo coalho", "Alho-poró confitado", "Maionese de ervas"],
        allergens: ["Glúten", "Leite"],
        isNew: true,
      },
      {
        slug: "pescado-crocante",
        name: "Pescado Crocante",
        shortDescription: "Filé de peixe branco empanado, tártaro e limão siciliano.",
        description:
          "Filé de pescada branca empanado em panko e frito na hora, molho tártaro com alcaparras, alface americana e raspas de limão siciliano. Leve, para quem não quer carne vermelha.",
        price: 42.9,
        imageUrl: SEM_FOTO,
        tags: ["Peixe", "Leve"],
        ingredients: ["Pão brioche", "Filé de pescada empanado", "Molho tártaro", "Alface americana", "Limão siciliano"],
        allergens: ["Glúten", "Ovo", "Peixe"],
      },
    ],
  },
  {
    slug: "entradas",
    name: "Entradas",
    description: "Para começar bem enquanto a brasa faz o trabalho dela.",
    produtos: [
      {
        slug: "bolinho-de-costela",
        name: "Bolinho de Costela",
        shortDescription: "Seis bolinhos da mesma costela de 12 horas, com aioli de limão.",
        description:
          "Seis bolinhos recheados com a costela que passa doze horas na brasa, empanados e fritos na hora. Servidos com aioli de limão siciliano.",
        price: 32.9,
        imageUrl: SEM_FOTO,
        tags: ["Para dividir", "Mais pedido"],
        ingredients: ["Costela desfiada 12h", "Massa de batata", "Aioli de limão"],
        allergens: ["Glúten", "Leite", "Ovo"],
        bestSeller: true,
      },
      {
        slug: "dadinho-de-tapioca",
        name: "Dadinho de Tapioca",
        shortDescription: "Cubos de tapioca com queijo coalho e melado de pimenta.",
        description:
          "Cubos de tapioca com queijo coalho, fritos até ficarem crocantes por fora e cremosos por dentro. Regados com melado de cana e pimenta.",
        price: 28.9,
        imageUrl: SEM_FOTO,
        tags: ["Vegetariano", "Para dividir"],
        ingredients: ["Tapioca", "Queijo coalho", "Melado de cana", "Pimenta"],
        allergens: ["Leite"],
      },
      {
        slug: "asinhas-na-brasa",
        name: "Asinhas na Brasa",
        shortDescription: "Oito asinhas marinadas 24h, terminadas na brasa.",
        description:
          "Oito asinhas marinadas por 24 horas em ervas e páprica defumada, assadas devagar e terminadas na brasa alta para dourar. Escolha entre barbecue de melado ou pimenta e mel.",
        price: 34.9,
        imageUrl: SEM_FOTO,
        tags: ["Para dividir", "Brasa"],
        ingredients: ["Asinhas de frango", "Páprica defumada", "Barbecue de melado", "Molho de pimenta e mel"],
        allergens: ["Mostarda"],
        featured: true,
      },
      {
        slug: "pao-de-alho-da-casa",
        name: "Pão de Alho da Casa",
        shortDescription: "Pão de fermentação natural com manteiga de alho assado.",
        description:
          "O mesmo pão de fermentação natural dos lanches, aberto e tostado na brasa com manteiga de alho assado e salsinha. Chega quentíssimo à mesa.",
        price: 22.9,
        imageUrl: SEM_FOTO,
        tags: ["Vegetariano", "Para dividir"],
        ingredients: ["Pão de fermentação natural", "Manteiga de alho assado", "Salsinha"],
        allergens: ["Glúten", "Leite"],
      },
      {
        slug: "mandioca-crocante",
        name: "Mandioca Crocante",
        shortDescription: "Mandioca cozida no caldo e frita, com maionese de páprica.",
        description:
          "Mandioca cozida no caldo da costela antes de ir para a fritura — por isso fica macia por dentro e dourada por fora. Sal grosso e maionese de páprica defumada.",
        price: 26.9,
        imageUrl: SEM_FOTO,
        tags: ["Para dividir"],
        ingredients: ["Mandioca", "Sal grosso", "Maionese de páprica"],
        allergens: ["Ovo"],
      },
      {
        slug: "bruschetta-da-brasa",
        name: "Bruschetta da Brasa",
        shortDescription: "Quatro fatias com tomate confitado e burrata.",
        description:
          "Quatro fatias de pão de fermentação natural tostadas na brasa, tomate confitado lentamente no azeite, burrata cremosa e manjericão fresco.",
        price: 33.9,
        imageUrl: SEM_FOTO,
        tags: ["Vegetariano", "Leve"],
        ingredients: ["Pão de fermentação natural", "Tomate confitado", "Burrata", "Manjericão"],
        allergens: ["Glúten", "Leite"],
        isNew: true,
      },
    ],
  },
];

async function main() {
  let criados = 0;
  let jaExistiam = 0;

  for (const categoria of CATEGORIAS) {
    // A categoria já deve existir no cardápio; criamos só se faltar.
    const existente = await prisma.category.findUnique({
      where: { slug: categoria.slug },
    });

    const ultimaPosicao = await prisma.category.aggregate({
      _max: { position: true },
    });

    const registro =
      existente ??
      (await prisma.category.create({
        data: {
          slug: categoria.slug,
          name: categoria.name,
          description: categoria.description,
          position: (ultimaPosicao._max.position ?? 0) + 1,
        },
      }));

    // Novos produtos entram depois dos que já estão na categoria.
    const posicaoAtual = await prisma.product.aggregate({
      where: { categoryId: registro.id },
      _max: { position: true },
    });
    let posicao = (posicaoAtual._max.position ?? 0) + 1;

    for (const produto of categoria.produtos) {
      const jaTem = await prisma.product.findUnique({
        where: { slug: produto.slug },
      });

      if (jaTem) {
        jaExistiam += 1;
        console.log(`  = ${produto.name} (já estava no cardápio, não mexi)`);
        continue;
      }

      await prisma.product.create({
        data: {
          slug: produto.slug,
          name: produto.name,
          shortDescription: produto.shortDescription,
          description: produto.description,
          price: produto.price,
          promoPrice: produto.promoPrice ?? null,
          imageUrl: produto.imageUrl || null,
          imageAlt: produto.imageUrl ? produto.name : "",
          tags: produto.tags ?? [],
          ingredients: produto.ingredients,
          allergens: produto.allergens ?? [],
          featured: produto.featured ?? false,
          isNew: produto.isNew ?? false,
          bestSeller: produto.bestSeller ?? false,
          nutrition: produto.nutrition ?? undefined,
          categoryId: registro.id,
          position: posicao,
          active: true,
        },
      });

      posicao += 1;
      criados += 1;
      console.log(`  + ${produto.name}`);
    }
  }

  console.log(`\n✔ ${criados} produto(s) criado(s), ${jaExistiam} já existia(m).`);
  if (criados > 0) {
    console.log("  Falta a foto de cada um: painel → Produtos → o item → Foto principal.");
  }
}

main()
  .catch((error) => {
    console.error("\n✖ Não foi possível preencher o cardápio.");
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
