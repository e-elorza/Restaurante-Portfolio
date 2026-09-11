/**
 * Conteúdo fictício de demonstração.
 *
 * Usado em dois lugares:
 *  - `npm run db:seed` (prisma/seed.ts), na linha de comando;
 *  - o botão "Carregar conteúdo de demonstração" do painel, para quem acabou
 *    de publicar o site e quer vê-lo cheio antes de cadastrar o cardápio real.
 *
 * Tudo é idempotente (`upsert`), então pode rodar mais de uma vez sem
 * duplicar registros. As imagens vêm de `public/demo`.
 */
import type { Prisma, PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const demo = (file: string) => `/demo/${file}`;

const days = (amount: number) => {
  const date = new Date();
  date.setDate(date.getDate() + amount);
  date.setHours(20, 0, 0, 0);
  return date;
};

// ---------------------------------------------------------------------------

/** Cria (ou atualiza) o usuário administrador. */
export async function seedAdminUser(
  prisma: PrismaClient,
  options: { email: string; password: string; name: string },
): Promise<string> {
  const email = options.email.trim().toLowerCase();
  const passwordHash = await bcrypt.hash(options.password, 12);

  const user = await prisma.user.upsert({
    where: { email },
    update: { name: options.name, role: "ADMIN", active: true },
    create: { email, name: options.name, passwordHash, role: "ADMIN" },
  });

  return user.email;
}

async function seedSettings(prisma: PrismaClient) {
  await prisma.restaurantSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      name: "Brasa & Bordo",
      tagline: "Cozinha de fogo, alma de bairro",
      description:
        "Hambúrgueres artesanais de brasa lenta, pão de fermentação natural e ingredientes de produtores locais. Um cardápio pequeno, feito com calma.",
      logoUrl: demo("logo.svg"),
      faviconUrl: demo("favicon.png"),
      phone: "(11) 4002-8922",
      whatsapp: "5511999990000",
      email: "contato@brasaebordo.com.br",
      address: "Rua das Oliveiras, 210 — Vila Madalena",
      city: "São Paulo, SP",
      openingHours:
        "Terça a quinta: 18h às 23h\nSexta e sábado: 18h à meia-noite\nDomingo: 12h às 22h\nSegunda: fechado",
      orderUrl: "",
      orderLabel: "Pedir agora",
      whatsappEnabled: true,
      whatsappMessage: "Olá! Vim pelo cardápio e gostaria de fazer um pedido.",
    },
  });

  await prisma.appearanceSettings.upsert({
    where: { id: "default" },
    update: {},
    create: { id: "default" },
  });

  await prisma.seoSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      siteTitle: "Brasa & Bordo — Hambúrgueres de brasa lenta",
      titleTemplate: "%s · Brasa & Bordo",
      description:
        "Cardápio digital do Brasa & Bordo: hambúrgueres artesanais, combos, acompanhamentos e sobremesas. Peça pelo WhatsApp ou pelos aplicativos de entrega.",
      keywords: "hamburgueria, hambúrguer artesanal, delivery, cardápio digital",
      ogImageUrl: demo("imagem-compartilhamento.jpg"),
      faviconUrl: demo("favicon.png"),
    },
  });

  await prisma.headerSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      logoUrl: demo("logo.svg"),
      ctaEnabled: true,
      ctaLabel: "Peça pelo WhatsApp",
      ctaUrl: "",
    },
  });

  await prisma.footerSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      logoUrl: demo("logo.svg"),
      about:
        "Brasa lenta, pão de fermentação natural e um cardápio curto para fazer tudo bem feito.",
      address: "Rua das Oliveiras, 210 — Vila Madalena, São Paulo",
      phone: "(11) 4002-8922",
      copyright: "© Brasa & Bordo. Todos os direitos reservados.",
      showSocial: true,
    },
  });

  await prisma.eventSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      pastBehavior: "ARCHIVE",
      intro:
        "Noites de brasa, música e encontros. Reserve a sua mesa com antecedência.",
    },
  });
}

const PAGES: Prisma.PageCreateInput[] = [
  {
    key: "HOME",
    label: "Início",
    path: "/",
    enabled: true,
    lockedEnabled: true,
    position: 0,
    metaTitle: "Brasa & Bordo",
    metaDescription:
      "Hambúrgueres artesanais de brasa lenta no coração da Vila Madalena.",
  },
  {
    key: "MENU",
    label: "Cardápio",
    path: "/cardapio",
    enabled: true,
    lockedEnabled: true,
    position: 1,
    headline: "Nosso cardápio",
    intro:
      "Tudo é preparado no dia. Se algum item estiver esgotado, avisamos aqui mesmo.",
    metaTitle: "Cardápio",
    metaDescription: "Hambúrgueres, combos, acompanhamentos, bebidas e sobremesas.",
    socialImageUrl: demo("capa-cardapio.jpg"),
  },
  {
    key: "DELIVERY",
    label: "Delivery",
    path: "/delivery",
    enabled: true,
    position: 2,
    headline: "Peça onde preferir",
    intro: "Escolha o canal mais confortável para você. O preço é o mesmo em todos.",
    metaTitle: "Delivery",
    metaDescription: "Peça pelo WhatsApp ou pelos aplicativos de entrega.",
  },
  {
    key: "EVENTS",
    label: "Eventos",
    path: "/eventos",
    enabled: true,
    position: 3,
    headline: "Agenda da casa",
    intro: "Música, brasa e encontros. Confira o que vem por aí.",
    metaTitle: "Eventos",
    metaDescription: "Agenda de eventos do Brasa & Bordo.",
  },
  {
    key: "LOCATIONS",
    label: "Unidades",
    path: "/unidades",
    enabled: true,
    position: 4,
    headline: "Onde nos encontrar",
    intro: "Três endereços, a mesma brasa.",
    metaTitle: "Unidades",
    metaDescription: "Endereços, horários e telefones das nossas unidades.",
  },
  {
    key: "CONTACT",
    label: "Contato",
    path: "/contato",
    enabled: true,
    position: 5,
    headline: "Fale com a gente",
    intro: "Reservas, eventos particulares ou só para dizer oi.",
    metaTitle: "Contato",
    metaDescription: "Telefone, WhatsApp, e-mail e endereço do Brasa & Bordo.",
  },
];

async function seedPages(prisma: PrismaClient) {
  for (const page of PAGES) {
    await prisma.page.upsert({
      where: { key: page.key },
      update: {},
      create: page,
    });
  }
}

const MEDIA_SLOTS: Array<{
  key: string;
  name: string;
  description: string;
  recommended: string;
  group: string;
  position: number;
  url?: string;
  alt?: string;
}> = [
  { key: "logo-principal", name: "Logo principal", description: "Logo exibida no canto superior esquerdo do cabeçalho.", recommended: "PNG com fundo transparente · 400 × 120 px", group: "Identidade", position: 0, url: demo("logo.svg"), alt: "Brasa & Bordo" },
  { key: "logo-rodape", name: "Logo do rodapé", description: "Versão da logo usada no rodapé do site. Pode ser a mesma do topo.", recommended: "PNG com fundo transparente · 400 × 120 px", group: "Identidade", position: 1, url: demo("logo.svg"), alt: "Brasa & Bordo" },
  { key: "favicon", name: "Ícone do navegador", description: "Pequeno ícone que aparece na aba do navegador e nos favoritos do cliente.", recommended: "PNG quadrado · 512 × 512 px", group: "Identidade", position: 2, url: demo("favicon.png") },
  { key: "imagem-compartilhamento", name: "Imagem de compartilhamento", description: "Imagem que aparece quando alguém compartilha o link do site no WhatsApp ou Instagram.", recommended: "JPG · 1200 × 630 px", group: "Identidade", position: 3, url: demo("imagem-compartilhamento.jpg") },
  { key: "home-destaque", name: "Banner principal da Home", description: "Imagem grande exibida no topo da página inicial (computador).", recommended: "JPG · 2000 × 1200 px", group: "Página inicial", position: 4, url: demo("home-destaque.jpg"), alt: "Hambúrguer sendo finalizado na brasa" },
  { key: "home-destaque-celular", name: "Banner principal da Home (celular)", description: "Versão vertical do banner principal, usada em telas de celular.", recommended: "JPG · 1080 × 1440 px", group: "Página inicial", position: 5, url: demo("home-destaque-celular.jpg") },
  { key: "home-sobre", name: "Imagem da seção Sobre Nós", description: "Imagem exibida ao lado do texto institucional da página inicial.", recommended: "JPG · 1200 × 1400 px", group: "Página inicial", position: 6, url: demo("home-sobre.jpg") },
  { key: "home-banner", name: "Banner promocional", description: "Faixa larga usada na seção de promoção da página inicial.", recommended: "JPG · 2000 × 900 px", group: "Página inicial", position: 7, url: demo("home-banner.jpg") },
  { key: "home-video-capa", name: "Capa do vídeo", description: "Imagem exibida antes do vídeo começar a tocar na página inicial.", recommended: "JPG · 1920 × 1080 px", group: "Página inicial", position: 8, url: demo("home-video-capa.jpg") },
  { key: "capa-cardapio", name: "Capa da página Cardápio", description: "Imagem de fundo do topo da página de cardápio.", recommended: "JPG · 2000 × 900 px", group: "Páginas internas", position: 9, url: demo("capa-cardapio.jpg") },
  { key: "capa-delivery", name: "Capa da página Delivery", description: "Imagem de fundo do topo da página de delivery.", recommended: "JPG · 2000 × 900 px", group: "Páginas internas", position: 10, url: demo("capa-delivery.jpg") },
  { key: "capa-eventos", name: "Capa da página Eventos", description: "Imagem de fundo do topo da página de eventos.", recommended: "JPG · 2000 × 900 px", group: "Páginas internas", position: 11, url: demo("capa-eventos.jpg") },
  { key: "capa-unidades", name: "Capa da página Unidades", description: "Imagem de fundo do topo da página de unidades.", recommended: "JPG · 2000 × 900 px", group: "Páginas internas", position: 12, url: demo("capa-unidades.jpg") },
  { key: "capa-contato", name: "Capa da página Contato", description: "Imagem de fundo do topo da página de contato.", recommended: "JPG · 2000 × 900 px", group: "Páginas internas", position: 13, url: demo("capa-contato.jpg") },
  { key: "rodape-imagem", name: "Imagem do rodapé", description: "Imagem de fundo usada no rodapé do site.", recommended: "JPG · 2000 × 600 px", group: "Rodapé", position: 14, url: demo("rodape-imagem.jpg") },
];

async function seedMedia(prisma: PrismaClient) {
  for (const slot of MEDIA_SLOTS) {
    await prisma.mediaSlot.upsert({
      where: { key: slot.key },
      update: {
        name: slot.name,
        description: slot.description,
        recommended: slot.recommended,
        group: slot.group,
        position: slot.position,
      },
      create: { ...slot, alt: slot.alt ?? "" },
    });
  }
}

type SeedProduct = {
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  price: number;
  promoPrice?: number;
  image: string;
  tags?: string[];
  ingredients: string[];
  allergens?: string[];
  featured?: boolean;
  isNew?: boolean;
  bestSeller?: boolean;
  soldOut?: boolean;
  nutrition?: Prisma.InputJsonValue;
};

type SeedCategory = {
  slug: string;
  name: string;
  description: string;
  image: string;
  products: SeedProduct[];
};

const CATEGORIES: SeedCategory[] = [
  {
    slug: "hamburgueres",
    name: "Hambúrgueres",
    description: "Blend de 180g maturado na casa, selado na brasa e pão de fermentação natural.",
    image: demo("categoria-hamburgueres.jpg"),
    products: [
      {
        slug: "brasa-classico",
        name: "Brasa Clássico",
        shortDescription: "Blend 180g, queijo prato, cebola caramelizada e maionese da casa.",
        description:
          "O nosso ponto de partida. Blend de acém e peito maturado por 48 horas, selado direto na brasa para formar aquela crosta escura, queijo prato derretido no calor da chapa, cebola caramelizada lentamente no próprio suco da carne e maionese defumada. Servido no pão brioche de fermentação natural.",
        price: 38.9,
        image: demo("produto-brasa-classico.jpg"),
        tags: ["Clássico", "Brasa"],
        ingredients: ["Pão brioche", "Blend 180g", "Queijo prato", "Cebola caramelizada", "Maionese defumada"],
        allergens: ["Glúten", "Leite", "Ovo"],
        featured: true,
        bestSeller: true,
        nutrition: { calories: "720 kcal", protein: "38 g", carbs: "45 g", fat: "42 g" },
      },
      {
        slug: "duplo-defumado",
        name: "Duplo Defumado",
        shortDescription: "Dois blends, cheddar duplo e bacon curado na casa.",
        description:
          "Para quem chega com fome. Dois blends de 180g, quatro fatias de cheddar inglês, bacon curado por sete dias e finalizado na brasa, picles de pepino e molho barbecue de melado de cana.",
        price: 52.9,
        promoPrice: 46.9,
        image: demo("produto-duplo-defumado.jpg"),
        tags: ["Duplo", "Bacon"],
        ingredients: ["Pão brioche", "2 blends 180g", "Cheddar inglês", "Bacon curado", "Picles", "Barbecue de melado"],
        allergens: ["Glúten", "Leite"],
        featured: true,
        bestSeller: true,
      },
      {
        slug: "cheddar-lento",
        name: "Cheddar Lento",
        shortDescription: "Blend 180g com cheddar cremoso curado e cebola crispy.",
        description:
          "Cheddar curado derretido em banho-maria até virar creme, blend de 180g na brasa e cebola crispy frita na hora. Simples e viciante.",
        price: 42.9,
        image: demo("produto-cheddar-lento.jpg"),
        tags: ["Cremoso"],
        ingredients: ["Pão brioche", "Blend 180g", "Cheddar curado", "Cebola crispy"],
        allergens: ["Glúten", "Leite"],
        featured: true,
      },
      {
        slug: "horta-grelhada",
        name: "Horta Grelhada",
        shortDescription: "Hambúrguer de grão-de-bico e beterraba, 100% vegetal.",
        description:
          "Nosso vegetariano de verdade: hambúrguer de grão-de-bico, beterraba assada e castanha, grelhado na brasa. Vai com tomate confitado, rúcula e maionese de ervas sem ovo.",
        price: 36.9,
        image: demo("produto-horta-grelhada.jpg"),
        tags: ["Vegetariano", "Sem carne"],
        ingredients: ["Pão australiano", "Hambúrguer de grão-de-bico", "Tomate confitado", "Rúcula", "Maionese de ervas"],
        allergens: ["Glúten", "Castanhas"],
        isNew: true,
      },
      {
        slug: "picanha-do-bordo",
        name: "Picanha do Bordo",
        shortDescription: "Blend de picanha, provolone e chimichurri da casa.",
        description:
          "Blend exclusivo de picanha com 20% de gordura, provolone maturado e chimichurri fresco preparado toda manhã. Pão de batata levemente tostado na manteiga.",
        price: 49.9,
        image: demo("produto-picanha-bordo.jpg"),
        tags: ["Especial"],
        ingredients: ["Pão de batata", "Blend de picanha", "Provolone", "Chimichurri"],
        allergens: ["Glúten", "Leite"],
        bestSeller: true,
      },
      {
        slug: "frango-crocante",
        name: "Frango Crocante",
        shortDescription: "Sobrecoxa marinada 24h, empanada e frita na hora.",
        description:
          "Sobrecoxa desossada marinada por 24 horas no leitelho e ervas, empanada em farinha temperada e frita na hora. Coleslaw crocante e molho de mostarda e mel.",
        price: 39.9,
        image: demo("produto-frango-crocante.jpg"),
        tags: ["Frango"],
        ingredients: ["Pão brioche", "Sobrecoxa empanada", "Coleslaw", "Mostarda e mel"],
        allergens: ["Glúten", "Leite", "Mostarda"],
      },
    ],
  },
  {
    slug: "combos",
    name: "Combos",
    description: "Lanche, acompanhamento e bebida com preço fechado.",
    image: demo("categoria-combos.jpg"),
    products: [
      {
        slug: "combo-brasa",
        name: "Combo Brasa",
        shortDescription: "Brasa Clássico + batata rústica + bebida.",
        description:
          "O combo mais pedido da casa: Brasa Clássico, uma porção individual de batata rústica com alecrim e a bebida da sua escolha.",
        price: 56.9,
        promoPrice: 49.9,
        image: demo("produto-combo-brasa.jpg"),
        tags: ["Combo", "Promoção"],
        ingredients: ["Brasa Clássico", "Batata rústica", "Bebida 350ml"],
        allergens: ["Glúten", "Leite", "Ovo"],
        featured: true,
        bestSeller: true,
      },
      {
        slug: "combo-familia",
        name: "Combo Família",
        shortDescription: "4 hambúrgueres, 2 porções grandes e 4 bebidas.",
        description:
          "Feito para dividir: quatro hambúrgueres à sua escolha entre os clássicos, duas porções grandes de acompanhamento e quatro bebidas.",
        price: 189.9,
        image: demo("produto-combo-familia.jpg"),
        tags: ["Para dividir"],
        ingredients: ["4 hambúrgueres", "2 acompanhamentos grandes", "4 bebidas"],
        allergens: ["Glúten", "Leite", "Ovo"],
        featured: true,
      },
    ],
  },
  {
    slug: "entradas",
    name: "Entradas",
    description: "Para começar bem enquanto a brasa faz o trabalho dela.",
    image: demo("categoria-entradas.jpg"),
    products: [
      {
        slug: "aneis-de-cebola",
        name: "Anéis de Cebola",
        shortDescription: "Cebola roxa empanada na cerveja com maionese de páprica.",
        description:
          "Anéis grossos de cebola roxa empanados em massa de cerveja lager gelada, fritos na hora. Servidos com maionese de páprica defumada.",
        price: 27.9,
        image: demo("produto-aneis-cebola.jpg"),
        tags: ["Para dividir"],
        ingredients: ["Cebola roxa", "Massa de cerveja", "Maionese de páprica"],
        allergens: ["Glúten", "Ovo"],
      },
      {
        slug: "salada-defumada",
        name: "Salada Defumada",
        shortDescription: "Folhas, tomate confitado e queijo coalho na brasa.",
        description:
          "Mix de folhas frescas, tomate confitado, queijo coalho grelhado na brasa, castanhas tostadas e vinagrete de mel.",
        price: 29.9,
        image: demo("produto-salada-defumada.jpg"),
        tags: ["Vegetariano", "Leve"],
        ingredients: ["Mix de folhas", "Tomate confitado", "Queijo coalho", "Castanhas", "Vinagrete de mel"],
        allergens: ["Leite", "Castanhas"],
        isNew: true,
      },
    ],
  },
  {
    slug: "acompanhamentos",
    name: "Acompanhamentos",
    description: "Porções generosas para acompanhar o lanche.",
    image: demo("categoria-acompanhamentos.jpg"),
    products: [
      {
        slug: "batata-rustica",
        name: "Batata Rústica",
        shortDescription: "Batata com casca, alecrim e sal grosso.",
        description:
          "Batata asterix com casca, cozida no vapor e finalizada na fritura, temperada com alecrim fresco e sal grosso moído na hora.",
        price: 24.9,
        image: demo("produto-batata-rustica.jpg"),
        tags: ["Vegetariano"],
        ingredients: ["Batata asterix", "Alecrim", "Sal grosso"],
        bestSeller: true,
      },
    ],
  },
  {
    slug: "bebidas",
    name: "Bebidas",
    description: "Gelado, artesanal e feito por gente perto da gente.",
    image: demo("categoria-bebidas.jpg"),
    products: [
      {
        slug: "limonada-da-brasa",
        name: "Limonada da Brasa",
        shortDescription: "Limão siciliano grelhado, hortelã e água com gás.",
        description:
          "Limão siciliano grelhado na brasa antes de ser espremido — isso deixa a limonada levemente defumada. Finalizada com hortelã e água com gás.",
        price: 16.9,
        image: demo("produto-limonada-brasa.jpg"),
        tags: ["Sem álcool", "Autoral"],
        ingredients: ["Limão siciliano", "Hortelã", "Água com gás"],
        isNew: true,
        featured: true,
      },
      {
        slug: "refrigerante-artesanal",
        name: "Refrigerante Artesanal",
        shortDescription: "Guaraná ou cola de produtor local, 355ml.",
        description: "Refrigerante artesanal de produtor local, sem corantes. Sabores guaraná ou cola.",
        price: 12.9,
        image: demo("produto-refri-artesanal.jpg"),
        ingredients: ["Água gaseificada", "Açúcar demerara", "Extrato natural"],
      },
      {
        slug: "lager-da-casa",
        name: "Lager da Casa",
        shortDescription: "Cerveja lager produzida para o Brasa & Bordo, 500ml.",
        description:
          "Lager leve e seca, produzida em parceria com uma cervejaria da região especialmente para acompanhar a brasa. Venda proibida para menores de 18 anos.",
        price: 22.9,
        image: demo("produto-cerveja-lager.jpg"),
        tags: ["Com álcool"],
        ingredients: ["Água", "Malte", "Lúpulo", "Levedura"],
        allergens: ["Glúten"],
        soldOut: true,
      },
    ],
  },
  {
    slug: "sobremesas",
    name: "Sobremesas",
    description: "O final feliz da refeição.",
    image: demo("categoria-sobremesas.jpg"),
    products: [
      {
        slug: "brownie-de-fogo",
        name: "Brownie de Fogo",
        shortDescription: "Brownie morno, sorvete de baunilha e flor de sal.",
        description:
          "Brownie de chocolate 70% assado no dia, servido morno com uma bola de sorvete de baunilha e flor de sal por cima.",
        price: 24.9,
        image: demo("produto-brownie-fogo.jpg"),
        tags: ["Para dividir"],
        ingredients: ["Chocolate 70%", "Sorvete de baunilha", "Flor de sal"],
        allergens: ["Glúten", "Leite", "Ovo"],
        featured: true,
      },
      {
        slug: "pudim-defumado",
        name: "Pudim Defumado",
        shortDescription: "Pudim de leite com calda de açúcar queimado na brasa.",
        description:
          "Pudim de leite cremoso com calda de açúcar queimado direto na brasa, o que dá um leve amargor defumado.",
        price: 19.9,
        image: demo("produto-pudim-defumado.jpg"),
        ingredients: ["Leite condensado", "Ovos", "Açúcar queimado"],
        allergens: ["Leite", "Ovo"],
        isNew: true,
      },
    ],
  },
];

async function seedMenu(prisma: PrismaClient) {
  let categoryPosition = 0;
  for (const category of CATEGORIES) {
    const created = await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: {
        slug: category.slug,
        name: category.name,
        description: category.description,
        imageUrl: category.image,
        imageAlt: category.name,
        position: categoryPosition,
        active: true,
      },
    });
    categoryPosition += 1;

    let productPosition = 0;
    for (const product of category.products) {
      await prisma.product.upsert({
        where: { slug: product.slug },
        update: {},
        create: {
          slug: product.slug,
          name: product.name,
          shortDescription: product.shortDescription,
          description: product.description,
          price: product.price,
          promoPrice: product.promoPrice ?? null,
          imageUrl: product.image,
          imageAlt: product.name,
          categoryId: created.id,
          tags: product.tags ?? [],
          ingredients: product.ingredients,
          allergens: product.allergens ?? [],
          nutrition: product.nutrition,
          featured: product.featured ?? false,
          isNew: product.isNew ?? false,
          bestSeller: product.bestSeller ?? false,
          soldOut: product.soldOut ?? false,
          active: true,
          position: productPosition,
        },
      });
      productPosition += 1;
    }
  }
}

async function seedHomeSections(prisma: PrismaClient) {
  const existing = await prisma.homeSection.count();
  // Se o administrador já montou a página inicial, não mexemos nela.
  if (existing > 0) return;

  const sections: Array<{
    type: Prisma.HomeSectionCreateInput["type"];
    title: string;
    subtitle: string;
    config: Prisma.InputJsonValue;
  }> = [
    {
      type: "HERO",
      title: "Sabor que começa no fogo",
      subtitle: "Hambúrgueres artesanais, brasa lenta e ingredientes de verdade.",
      config: {
        mediaType: "IMAGE",
        imageUrl: demo("home-destaque.jpg"),
        imageMobileUrl: demo("home-destaque-celular.jpg"),
        imageAlt: "Hambúrguer sendo finalizado na brasa",
        buttonEnabled: true,
        buttonLabel: "Ver cardápio",
        buttonUrl: "/cardapio",
        align: "CENTER",
        overlay: 38,
        height: "TALL",
      },
    },
    {
      type: "CATEGORIES",
      title: "Explore o cardápio",
      subtitle: "Escolha por onde começar.",
      config: { limit: 6, showDescription: true, buttonLabel: "Ver cardápio completo" },
    },
    {
      type: "FEATURED_PRODUCTS",
      title: "Os queridinhos da casa",
      subtitle: "Os pedidos que mais saem da nossa brasa.",
      config: {
        source: "FEATURED",
        categoryId: "",
        limit: 6,
        buttonLabel: "Ver cardápio",
        buttonUrl: "/cardapio",
      },
    },
    {
      type: "BANNER",
      title: "Combo da semana",
      subtitle: "Brasa Clássico + batata rústica + bebida por R$ 49,90.",
      config: {
        imageUrl: demo("home-banner.jpg"),
        imageMobileUrl: "",
        imageAlt: "Combo da semana",
        buttonLabel: "Quero esse combo",
        buttonUrl: "/cardapio",
        overlay: 45,
        align: "LEFT",
        height: "MEDIUM",
      },
    },
    {
      type: "ABOUT",
      title: "Nossa história",
      subtitle: "Desde 2016 na Vila Madalena",
      config: {
        imageUrl: demo("home-sobre.jpg"),
        imageAlt: "Cozinha do Brasa & Bordo",
        imagePosition: "LEFT",
        text: "Começamos com uma churrasqueira pequena no quintal de casa e a teimosia de fazer tudo do zero: o pão, a maionese, o picles e a maturação da carne. Hoje somos três casas, mas a regra continua a mesma — cardápio curto, brasa lenta e ninguém sai com fome.",
        buttonLabel: "Conhecer as unidades",
        buttonUrl: "/unidades",
      },
    },
    {
      type: "VIDEO",
      title: "Nossa cozinha por dentro",
      subtitle: "Dois minutos no meio da brasa.",
      config: {
        provider: "YOUTUBE",
        url: "",
        posterUrl: demo("home-video-capa.jpg"),
        autoplay: false,
        muted: true,
        loop: true,
        controls: true,
        fullWidth: false,
      },
    },
    {
      type: "GALLERY",
      title: "A casa por dentro",
      subtitle: "",
      config: {
        columns: 3,
        images: Array.from({ length: 6 }, (_, index) => ({
          url: demo(`galeria-${index + 1}.jpg`),
          alt: `Ambiente do Brasa & Bordo ${index + 1}`,
        })),
      },
    },
    {
      type: "DELIVERY_CTA",
      title: "Peça no conforto de casa",
      subtitle: "",
      config: {
        text: "Estamos nos principais aplicativos de entrega e também no WhatsApp. O preço é o mesmo em todos os canais.",
        buttonLabel: "Ver canais de entrega",
        buttonUrl: "/delivery",
        imageUrl: demo("capa-delivery.jpg"),
        imageAlt: "Entrega do Brasa & Bordo",
      },
    },
    {
      type: "LOCATIONS",
      title: "Onde nos encontrar",
      subtitle: "Três endereços, a mesma brasa.",
      config: { limit: 3, buttonLabel: "Ver todas as unidades" },
    },
    {
      type: "SOCIAL",
      title: "Siga a gente",
      subtitle: "",
      config: {
        handle: "@brasaebordo",
        text: "Bastidores, novidades do cardápio e as brasas de todo dia.",
        images: Array.from({ length: 6 }, (_, index) => ({
          url: demo(`galeria-${((index + 3) % 6) + 1}.jpg`),
          alt: "Publicação do Instagram",
        })),
      },
    },
  ];

  await prisma.homeSection.createMany({
    data: sections.map((section, index) => ({ ...section, position: index, enabled: true })),
  });
}

async function seedDelivery(prisma: PrismaClient) {
  const options = [
    {
      name: "WhatsApp",
      description: "Fale direto com a nossa equipe e monte o seu pedido.",
      logoUrl: demo("delivery-app-um.png"),
      url: "https://wa.me/5511999990000",
    },
    {
      name: "Entrega Rápida",
      description: "Pedido pelo aplicativo com acompanhamento em tempo real.",
      logoUrl: demo("delivery-app-dois.png"),
      url: "https://exemplo-delivery.com.br/brasa-e-bordo",
    },
    {
      name: "Bordo Express",
      description: "Nossa entrega própria, sem taxa acima de R$ 80.",
      logoUrl: demo("delivery-app-tres.png"),
      url: "https://exemplo-express.com.br/brasa-e-bordo",
    },
    {
      name: "Retirada na loja",
      description: "Peça pelo site e retire em 20 minutos com 10% de desconto.",
      logoUrl: demo("delivery-app-quatro.png"),
      url: "https://wa.me/5511999990000?text=Quero%20retirar%20na%20loja",
    },
  ];

  for (const [index, option] of options.entries()) {
    const exists = await prisma.deliveryOption.findFirst({ where: { name: option.name } });
    if (exists) continue;
    await prisma.deliveryOption.create({
      data: { ...option, position: index, active: true },
    });
  }
}

async function seedEvents(prisma: PrismaClient) {
  const events = [
    {
      slug: "noite-da-brasa",
      name: "Noite da Brasa",
      description:
        "Menu especial de cortes na brasa servido em porções para dividir, com trilha sonora ao vivo.",
      imageUrl: demo("evento-noite-brasa.jpg"),
      startsAt: days(14),
      timeLabel: "20h às 23h30",
      address: "Unidade Centro · Rua das Oliveiras, 210",
      buttonLabel: "Reservar mesa",
      buttonUrl: "https://wa.me/5511999990000?text=Quero%20reservar%20na%20Noite%20da%20Brasa",
      position: 0,
    },
    {
      slug: "festival-do-burger",
      name: "Festival do Burger",
      description:
        "Três dias com hambúrgueres criados só para o festival, incluindo uma receita convidada.",
      imageUrl: demo("evento-festival-burger.jpg"),
      startsAt: days(38),
      timeLabel: "A partir das 18h",
      address: "Todas as unidades",
      buttonLabel: "Ver cardápio do festival",
      buttonUrl: "/cardapio",
      position: 1,
    },
    {
      slug: "musica-no-quintal",
      name: "Música no Quintal",
      description: "Samba de raiz no quintal da unidade Jardins, com entrada gratuita.",
      imageUrl: demo("evento-musica-quintal.jpg"),
      startsAt: days(-26),
      timeLabel: "19h às 23h",
      address: "Unidade Jardins · Alameda das Laranjeiras, 88",
      buttonLabel: "",
      buttonUrl: "",
      position: 2,
    },
  ];

  for (const event of events) {
    await prisma.event.upsert({
      where: { slug: event.slug },
      update: {},
      create: { ...event, imageAlt: event.name, active: true },
    });
  }
}

async function seedLocations(prisma: PrismaClient) {
  const locations = [
    {
      slug: "centro",
      name: "Brasa & Bordo Centro",
      imageUrl: demo("unidade-centro.jpg"),
      address: "Rua das Oliveiras, 210 — Vila Madalena",
      city: "São Paulo, SP",
      phone: "(11) 4002-8922",
      whatsapp: "5511999990000",
      openingHours: "Ter a qui: 18h–23h\nSex e sáb: 18h–00h\nDom: 12h–22h",
      mapsUrl: "https://maps.google.com/?q=Vila+Madalena+Sao+Paulo",
      deliveryUrl: "https://wa.me/5511999990000",
      instagram: "https://instagram.com/brasaebordo",
    },
    {
      slug: "jardins",
      name: "Brasa & Bordo Jardins",
      imageUrl: demo("unidade-jardins.jpg"),
      address: "Alameda das Laranjeiras, 88 — Jardins",
      city: "São Paulo, SP",
      phone: "(11) 4002-8933",
      whatsapp: "5511999990001",
      openingHours: "Ter a dom: 18h–00h",
      mapsUrl: "https://maps.google.com/?q=Jardins+Sao+Paulo",
      deliveryUrl: "https://wa.me/5511999990001",
      instagram: "",
    },
    {
      slug: "beira-mar",
      name: "Brasa & Bordo Beira-mar",
      imageUrl: demo("unidade-praia.jpg"),
      address: "Avenida Atlântica, 1500 — Beira-mar",
      city: "Santos, SP",
      phone: "(13) 4002-8944",
      whatsapp: "5513999990002",
      openingHours: "Todos os dias: 12h–23h",
      mapsUrl: "https://maps.google.com/?q=Avenida+Atlantica+Santos",
      deliveryUrl: "",
      instagram: "",
    },
  ];

  for (const [index, location] of locations.entries()) {
    await prisma.location.upsert({
      where: { slug: location.slug },
      update: {},
      create: { ...location, imageAlt: location.name, position: index, active: true },
    });
  }
}

async function seedSocial(prisma: PrismaClient) {
  const links = [
    { network: "INSTAGRAM" as const, label: "Instagram", url: "https://instagram.com/brasaebordo", enabled: true },
    { network: "TIKTOK" as const, label: "TikTok", url: "https://tiktok.com/@brasaebordo", enabled: true },
    { network: "FACEBOOK" as const, label: "Facebook", url: "https://facebook.com/brasaebordo", enabled: true },
    { network: "WHATSAPP" as const, label: "WhatsApp", url: "https://wa.me/5511999990000", enabled: true },
    { network: "YOUTUBE" as const, label: "YouTube", url: "", enabled: false },
    { network: "X" as const, label: "X (Twitter)", url: "", enabled: false },
    { network: "LINKEDIN" as const, label: "LinkedIn", url: "", enabled: false },
    { network: "THREADS" as const, label: "Threads", url: "", enabled: false },
  ];

  for (const [index, link] of links.entries()) {
    await prisma.socialLink.upsert({
      where: { network: link.network },
      update: {},
      create: { ...link, position: index },
    });
  }
}

/** Popula o site inteiro com o conteúdo de demonstração. */
export async function seedDemoContent(prisma: PrismaClient): Promise<void> {
  await seedSettings(prisma);
  await seedPages(prisma);
  await seedMedia(prisma);
  await seedMenu(prisma);
  await seedHomeSections(prisma);
  await seedDelivery(prisma);
  await seedEvents(prisma);
  await seedLocations(prisma);
  await seedSocial(prisma);
}
