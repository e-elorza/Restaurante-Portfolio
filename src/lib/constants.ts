import type { PageKey } from "@prisma/client";

import type {
  AboutConfig,
  BannerConfig,
  CategoriesConfig,
  DeliveryCtaConfig,
  FeaturedProductsConfig,
  GalleryConfig,
  HeroConfig,
  HomeSectionConfigMap,
  HomeSectionType,
  LocationsConfig,
  SocialConfig,
  VideoConfig,
} from "@/lib/types";

// ---------------------------------------------------------------------------
// Páginas do site
// ---------------------------------------------------------------------------

export type PageDefinition = {
  key: PageKey;
  label: string;
  path: string;
  /** Páginas obrigatórias não podem ser desativadas pelo administrador. */
  locked: boolean;
  description: string;
  position: number;
};

export const PAGE_DEFINITIONS: PageDefinition[] = [
  {
    key: "HOME",
    label: "Início",
    path: "/",
    locked: true,
    description: "Página inicial do site. Sempre visível.",
    position: 0,
  },
  {
    key: "MENU",
    label: "Cardápio",
    path: "/cardapio",
    locked: true,
    description: "Lista de categorias e produtos. Sempre visível.",
    position: 1,
  },
  {
    key: "DELIVERY",
    label: "Delivery",
    path: "/delivery",
    locked: false,
    description: "Aplicativos e canais em que o cliente pode pedir.",
    position: 2,
  },
  {
    key: "EVENTS",
    label: "Eventos",
    path: "/eventos",
    locked: false,
    description: "Agenda de eventos do restaurante.",
    position: 3,
  },
  {
    key: "LOCATIONS",
    label: "Unidades",
    path: "/unidades",
    locked: false,
    description: "Endereços, horários e contatos de cada unidade.",
    position: 4,
  },
  {
    key: "CONTACT",
    label: "Contato",
    path: "/contato",
    locked: false,
    description: "Telefone, WhatsApp, e-mail e redes sociais.",
    position: 5,
  },
];

export const PAGE_BY_KEY = new Map(PAGE_DEFINITIONS.map((p) => [p.key, p]));

export const PATH_TO_PAGE_KEY = new Map(
  PAGE_DEFINITIONS.map((p) => [p.path, p.key]),
);

// ---------------------------------------------------------------------------
// Seções da Home
// ---------------------------------------------------------------------------

export const HERO_DEFAULT: HeroConfig = {
  mediaType: "IMAGE",
  imageUrl: "",
  imageMobileUrl: "",
  imageAlt: "",
  slides: [],
  videoProvider: "YOUTUBE",
  videoUrl: "",
  posterUrl: "",
  buttonEnabled: true,
  buttonLabel: "Ver cardápio",
  buttonUrl: "/cardapio",
  align: "CENTER",
  overlay: 45,
  height: "TALL",
};

export const VIDEO_DEFAULT: VideoConfig = {
  provider: "YOUTUBE",
  url: "",
  posterUrl: "",
  autoplay: true,
  muted: true,
  loop: true,
  controls: false,
  fullWidth: false,
};

export const CATEGORIES_DEFAULT: CategoriesConfig = {
  layout: "CARDS",
  categoryId: "",
  limit: 6,
  showDescription: true,
  buttonLabel: "Ver cardápio completo",
};

export const FEATURED_PRODUCTS_DEFAULT: FeaturedProductsConfig = {
  source: "FEATURED",
  categoryId: "",
  limit: 6,
  buttonLabel: "Ver cardápio",
  buttonUrl: "/cardapio",
};

export const BANNER_DEFAULT: BannerConfig = {
  imageUrl: "",
  imageMobileUrl: "",
  imageAlt: "",
  buttonLabel: "",
  buttonUrl: "",
  overlay: 40,
  align: "CENTER",
  height: "MEDIUM",
};

export const ABOUT_DEFAULT: AboutConfig = {
  imageUrl: "",
  imageAlt: "",
  text: "",
  imagePosition: "LEFT",
  buttonLabel: "",
  buttonUrl: "",
};

export const GALLERY_DEFAULT: GalleryConfig = { images: [], columns: 3 };

export const DELIVERY_CTA_DEFAULT: DeliveryCtaConfig = {
  text: "",
  buttonLabel: "Pedir agora",
  buttonUrl: "/delivery",
  imageUrl: "",
  imageAlt: "",
};

export const LOCATIONS_DEFAULT: LocationsConfig = {
  limit: 3,
  buttonLabel: "Ver todas as unidades",
};

export const SOCIAL_DEFAULT: SocialConfig = {
  handle: "",
  text: "",
  images: [],
};

export const HOME_SECTION_DEFAULT_CONFIG: HomeSectionConfigMap = {
  HERO: HERO_DEFAULT,
  VIDEO: VIDEO_DEFAULT,
  CATEGORIES: CATEGORIES_DEFAULT,
  FEATURED_PRODUCTS: FEATURED_PRODUCTS_DEFAULT,
  BANNER: BANNER_DEFAULT,
  ABOUT: ABOUT_DEFAULT,
  GALLERY: GALLERY_DEFAULT,
  DELIVERY_CTA: DELIVERY_CTA_DEFAULT,
  LOCATIONS: LOCATIONS_DEFAULT,
  SOCIAL: SOCIAL_DEFAULT,
};

export type HomeSectionDefinition = {
  type: HomeSectionType;
  /** Nome amigável exibido no painel. */
  label: string;
  /** Explicação em linguagem simples para o gerente do restaurante. */
  description: string;
  defaultTitle: string;
  defaultSubtitle: string;
  /** Seções que só fazem sentido uma vez na página. */
  unique: boolean;
  /** Página opcional da qual a seção depende (some se a página for desligada). */
  requiresPage?: PageKey;
};

export const HOME_SECTION_DEFINITIONS: HomeSectionDefinition[] = [
  {
    type: "HERO",
    label: "Destaque principal",
    description:
      "A primeira coisa que o cliente vê: uma imagem, vídeo ou carrossel grande com título e botão.",
    defaultTitle: "Sabor que começa no fogo",
    defaultSubtitle: "Hambúrgueres artesanais, brasa lenta e ingredientes de verdade.",
    unique: true,
  },
  {
    type: "VIDEO",
    label: "Vídeo",
    description:
      "Um vídeo do YouTube, Vimeo ou enviado por você, exibido no meio da página inicial.",
    defaultTitle: "Nossa cozinha por dentro",
    defaultSubtitle: "",
    unique: true,
  },
  {
    type: "CATEGORIES",
    label: "Cardápio simples",
    description:
      "Uma lista de preços dos seus produtos na página inicial. Também pode mostrar as categorias com foto.",
    defaultTitle: "Explore o cardápio",
    defaultSubtitle: "Escolha por onde começar.",
    unique: false,
  },
  {
    type: "FEATURED_PRODUCTS",
    label: "Produtos em destaque",
    description:
      "Uma vitrine com os produtos que você marcou como destaque, novidade ou mais vendidos.",
    defaultTitle: "Os queridinhos da casa",
    defaultSubtitle: "",
    unique: false,
  },
  {
    type: "BANNER",
    label: "Banner promocional",
    description:
      "Uma faixa larga com imagem de fundo, texto e botão. Ótima para promoções.",
    defaultTitle: "Combo da semana",
    defaultSubtitle: "",
    unique: false,
  },
  {
    type: "ABOUT",
    label: "Sobre o restaurante",
    description: "Texto institucional ao lado de uma foto.",
    defaultTitle: "Nossa história",
    defaultSubtitle: "",
    unique: true,
  },
  {
    type: "GALLERY",
    label: "Galeria de fotos",
    description: "Um mosaico de fotos do restaurante, dos pratos ou dos clientes.",
    defaultTitle: "A casa por dentro",
    defaultSubtitle: "",
    unique: true,
  },
  {
    type: "DELIVERY_CTA",
    label: "Chamada para Delivery",
    description:
      "Convite para o cliente pedir pelos aplicativos de entrega. Some se a página Delivery estiver desligada.",
    defaultTitle: "Peça no conforto de casa",
    defaultSubtitle: "",
    unique: true,
    requiresPage: "DELIVERY",
  },
  {
    type: "LOCATIONS",
    label: "Unidades",
    description:
      "Lista das suas unidades com endereço e mapa. Some se a página Unidades estiver desligada.",
    defaultTitle: "Onde nos encontrar",
    defaultSubtitle: "",
    unique: true,
    requiresPage: "LOCATIONS",
  },
  {
    type: "SOCIAL",
    label: "Redes sociais",
    description: "Um convite para seguir o restaurante nas redes, com fotos.",
    defaultTitle: "Siga a gente",
    defaultSubtitle: "",
    unique: true,
  },
];

export const HOME_SECTION_BY_TYPE = new Map(
  HOME_SECTION_DEFINITIONS.map((s) => [s.type, s]),
);

// ---------------------------------------------------------------------------
// Espaços de imagem (Mídia)
// ---------------------------------------------------------------------------

export type MediaSlotDefinition = {
  key: string;
  name: string;
  description: string;
  recommended: string;
  group: string;
  position: number;
};

export const MEDIA_SLOT_DEFINITIONS: MediaSlotDefinition[] = [
  {
    key: "logo-principal",
    name: "Logo principal",
    description: "Aparece no topo de todas as páginas do site.",
    recommended: "PNG com fundo transparente · 400 × 120 px",
    group: "Identidade",
    position: 0,
  },
  {
    key: "logo-rodape",
    name: "Logo do rodapé",
    description: "Aparece no rodapé. Pode ser a mesma do topo.",
    recommended: "PNG com fundo transparente · 400 × 120 px",
    group: "Identidade",
    position: 1,
  },
  {
    key: "favicon",
    name: "Ícone do navegador",
    description:
      "Pequeno ícone que aparece na aba do navegador e nos favoritos do cliente.",
    recommended: "PNG quadrado · 512 × 512 px",
    group: "Identidade",
    position: 2,
  },
  {
    key: "imagem-compartilhamento",
    name: "Imagem de compartilhamento",
    description:
      "Imagem que aparece quando alguém compartilha o link do site no WhatsApp ou Instagram.",
    recommended: "JPG · 1200 × 630 px",
    group: "Identidade",
    position: 3,
  },
  {
    key: "capa-cardapio",
    name: "Capa da página Cardápio",
    description: "Imagem de fundo do topo da página de cardápio.",
    recommended: "JPG · 2000 × 900 px",
    group: "Páginas internas",
    position: 4,
  },
  {
    key: "capa-delivery",
    name: "Capa da página Delivery",
    description: "Imagem de fundo do topo da página de delivery.",
    recommended: "JPG · 2000 × 900 px",
    group: "Páginas internas",
    position: 5,
  },
  {
    key: "capa-eventos",
    name: "Capa da página Eventos",
    description: "Imagem de fundo do topo da página de eventos.",
    recommended: "JPG · 2000 × 900 px",
    group: "Páginas internas",
    position: 6,
  },
  {
    key: "capa-unidades",
    name: "Capa da página Unidades",
    description: "Imagem de fundo do topo da página de unidades.",
    recommended: "JPG · 2000 × 900 px",
    group: "Páginas internas",
    position: 7,
  },
  {
    key: "capa-contato",
    name: "Capa da página Contato",
    description: "Imagem de fundo do topo da página de contato.",
    recommended: "JPG · 2000 × 900 px",
    group: "Páginas internas",
    position: 8,
  },
  {
    key: "rodape-imagem",
    name: "Imagem do rodapé",
    description: "Imagem de fundo usada no rodapé do site.",
    recommended: "JPG · 2000 × 600 px",
    group: "Rodapé",
    position: 9,
  },
];

export const MEDIA_SLOT_BY_KEY = new Map(
  MEDIA_SLOT_DEFINITIONS.map((slot) => [slot.key, slot]),
);

export const PAGE_COVER_SLOT: Record<PageKey, string> = {
  HOME: "home-destaque",
  MENU: "capa-cardapio",
  DELIVERY: "capa-delivery",
  EVENTS: "capa-eventos",
  LOCATIONS: "capa-unidades",
  CONTACT: "capa-contato",
};

// ---------------------------------------------------------------------------
// Redes sociais
// ---------------------------------------------------------------------------

export const SOCIAL_NETWORKS = [
  { network: "INSTAGRAM", label: "Instagram", placeholder: "https://instagram.com/seurestaurante" },
  { network: "TIKTOK", label: "TikTok", placeholder: "https://tiktok.com/@seurestaurante" },
  { network: "FACEBOOK", label: "Facebook", placeholder: "https://facebook.com/seurestaurante" },
  { network: "YOUTUBE", label: "YouTube", placeholder: "https://youtube.com/@seurestaurante" },
  { network: "X", label: "X (Twitter)", placeholder: "https://x.com/seurestaurante" },
  { network: "WHATSAPP", label: "WhatsApp", placeholder: "https://wa.me/5511999999999" },
  { network: "LINKEDIN", label: "LinkedIn", placeholder: "https://linkedin.com/company/seurestaurante" },
  { network: "THREADS", label: "Threads", placeholder: "https://threads.net/@seurestaurante" },
] as const;

// ---------------------------------------------------------------------------
// Aparência
// ---------------------------------------------------------------------------

export const GOOGLE_FONTS = [
  "Inter",
  "Playfair Display",
  "Poppins",
  "Montserrat",
  "Lora",
  "Bebas Neue",
  "Oswald",
  "DM Sans",
  "Space Grotesk",
  "Fraunces",
  "Archivo",
  "Manrope",
] as const;

export const CARD_SHADOW_VALUES: Record<string, string> = {
  NONE: "none",
  SOFT: "0 6px 24px -12px rgb(28 25 23 / 0.25)",
  MEDIUM: "0 16px 40px -18px rgb(28 25 23 / 0.35)",
  STRONG: "0 28px 60px -20px rgb(28 25 23 / 0.45)",
};

export const BUTTON_RADIUS_VALUES: Record<string, string> = {
  ROUNDED: "12px",
  PILL: "9999px",
  SQUARE: "2px",
};

// ---------------------------------------------------------------------------
// Upload
// ---------------------------------------------------------------------------

export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
  "image/svg+xml",
];

export const ACCEPTED_VIDEO_TYPES = ["video/mp4", "video/webm"];

export function uploadMaxBytes(): number {
  const mb = Number(process.env.UPLOAD_MAX_MB ?? 8);
  const safe = Number.isFinite(mb) && mb > 0 ? mb : 8;
  return Math.floor(safe * 1024 * 1024);
}
