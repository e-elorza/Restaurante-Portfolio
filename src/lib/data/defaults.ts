import type {
  AppearanceSettings,
  EventSettings,
  FooterSettings,
  HeaderSettings,
  RestaurantSettings,
  SeoSettings,
} from "@prisma/client";

/**
 * Valores usados quando o banco ainda não foi configurado (primeiro deploy) ou
 * quando o registro singleton ainda não existe. Espelham os `@default` do
 * schema Prisma.
 */

const now = () => new Date(0);

export const DEFAULT_RESTAURANT: RestaurantSettings = {
  id: "default",
  name: "Brasa & Bordo",
  tagline: "Cozinha de fogo, alma de bairro",
  description:
    "Hambúrgueres artesanais, brasa lenta e ingredientes escolhidos a dedo.",
  phone: "",
  whatsapp: "",
  email: "",
  address: "",
  city: "",
  currency: "BRL",
  locale: "pt-BR",
  timezone: "America/Sao_Paulo",
  openingHours: "",
  orderUrl: "",
  orderLabel: "Pedir agora",
  whatsappEnabled: true,
  whatsappMessage: "Olá! Vim pelo cardápio e gostaria de fazer um pedido.",
  updatedAt: now(),
};

export const DEFAULT_APPEARANCE: AppearanceSettings = {
  id: "default",
  colorPrimary: "#C2410C",
  colorSecondary: "#1C1917",
  colorAccent: "#F59E0B",
  colorBackground: "#FDFCF9",
  colorSurface: "#FFFFFF",
  colorText: "#1C1917",
  colorMuted: "#78716C",
  colorButton: "#C2410C",
  colorButtonText: "#FFFFFF",
  fontHeading: "Playfair Display",
  fontBody: "Inter",
  cardRadius: 18,
  cardShadow: "SOFT",
  cardStyle: "ELEVATED",
  buttonStyle: "PILL",
  updatedAt: now(),
};

export const DEFAULT_SEO: SeoSettings = {
  id: "default",
  siteTitle: "Brasa & Bordo — Cardápio Digital",
  titleTemplate: "%s · Brasa & Bordo",
  description:
    "Conheça o nosso cardápio: hambúrgueres artesanais, combos e sobremesas.",
  keywords: "",
  robots: "index, follow",
  indexable: true,
  googleVerification: null,
  updatedAt: now(),
};

export const DEFAULT_HEADER: HeaderSettings = {
  id: "default",
  showLogoText: true,
  transparentOnTop: true,
  sticky: true,
  ctaEnabled: true,
  ctaLabel: "Peça pelo WhatsApp",
  ctaUrl: "",
  updatedAt: now(),
};

export const DEFAULT_FOOTER: FooterSettings = {
  id: "default",
  about: "",
  copyright: "",
  showSocial: true,
  updatedAt: now(),
};

export const DEFAULT_EVENT_SETTINGS: EventSettings = {
  id: "default",
  pastBehavior: "ARCHIVE",
  intro: "",
  updatedAt: now(),
};
