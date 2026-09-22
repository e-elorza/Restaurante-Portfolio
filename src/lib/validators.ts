import { z } from "zod";

import { PASSWORD_MIN_LENGTH } from "@/lib/auth/password";

/**
 * Todas as mensagens são escritas em português e em linguagem simples porque
 * aparecem diretamente para o gerente do restaurante no painel.
 */

const requiredText = (label: string, max = 200) =>
  z
    .string({ required_error: `Informe ${label}.` })
    .trim()
    .min(1, `Informe ${label}.`)
    .max(max, `${label} deve ter no máximo ${max} caracteres.`);

const optionalText = (max = 500) =>
  z
    .string()
    .trim()
    .max(max, `Use no máximo ${max} caracteres.`)
    .optional()
    .default("");

const optionalUrl = z
  .string()
  .trim()
  .max(2048)
  .optional()
  .default("")
  .refine(
    (value) =>
      value === "" ||
      /^(https?:\/\/|\/|mailto:|tel:)/i.test(value),
    { message: "Informe um endereço válido (começando com http:// ou https://)." },
  );

const hexColor = z
  .string()
  .trim()
  .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "Escolha uma cor válida.");

const checkbox = z
  .union([z.literal("on"), z.literal("true"), z.literal("false"), z.boolean()])
  .optional()
  .transform((value) => value === "on" || value === "true" || value === true);

const decimal = (label: string) =>
  z
    .union([z.string(), z.number()])
    .transform((value) =>
      typeof value === "number" ? value : Number(String(value).replace(",", ".")),
    )
    .refine((value) => Number.isFinite(value) && value >= 0, {
      message: `Informe ${label} com um número válido.`,
    });

const optionalDecimal = z
  .union([z.string(), z.number()])
  .optional()
  .transform((value) => {
    if (value === undefined || value === null || value === "") return null;
    const parsed =
      typeof value === "number" ? value : Number(String(value).replace(",", "."));
    return Number.isFinite(parsed) ? parsed : null;
  });

const commaList = z
  .string()
  .optional()
  .default("")
  .transform((value) =>
    value
      .split(/[,\n]/)
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 60),
  );

// ---------------------------------------------------------------------------
// Autenticação
// ---------------------------------------------------------------------------

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Informe seu e-mail.")
    .email("Informe um e-mail válido."),
  password: z.string().min(1, "Informe sua senha."),
  redirectTo: z.string().optional().default("/admin"),
});

/** Criação do primeiro administrador, feita pelo navegador no primeiro acesso. */
export const firstAdminSchema = z
  .object({
    name: requiredText("seu nome", 80),
    email: z
      .string()
      .trim()
      .min(1, "Informe um e-mail.")
      .email("Informe um e-mail válido."),
    password: z
      .string()
      .min(
        PASSWORD_MIN_LENGTH,
        `A senha precisa ter pelo menos ${PASSWORD_MIN_LENGTH} caracteres.`,
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não são iguais.",
    path: ["confirmPassword"],
  });

/** Criação de um novo acesso ao painel, feita por quem já está logado. */
export const newUserSchema = z
  .object({
    name: requiredText("o nome da pessoa", 80),
    email: z
      .string()
      .trim()
      .min(1, "Informe um e-mail.")
      .email("Informe um e-mail válido."),
    role: z.enum(["ADMIN", "EDITOR"]).default("ADMIN"),
    password: z
      .string()
      .min(
        PASSWORD_MIN_LENGTH,
        `A senha precisa ter pelo menos ${PASSWORD_MIN_LENGTH} caracteres.`,
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não são iguais.",
    path: ["confirmPassword"],
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Informe a senha atual."),
    newPassword: z
      .string()
      .min(
        PASSWORD_MIN_LENGTH,
        `A nova senha precisa ter pelo menos ${PASSWORD_MIN_LENGTH} caracteres.`,
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "As senhas não são iguais.",
    path: ["confirmPassword"],
  });

// ---------------------------------------------------------------------------
// Cardápio
// ---------------------------------------------------------------------------

export const categorySchema = z.object({
  id: z.string().optional(),
  name: requiredText("o nome da categoria", 80),
  slug: optionalText(90),
  description: optionalText(600),
  imageUrl: optionalUrl,
  imageAlt: optionalText(160),
  active: checkbox,
});

export const productSchema = z.object({
  id: z.string().optional(),
  name: requiredText("o nome do produto", 120),
  slug: optionalText(140),
  shortDescription: optionalText(220),
  description: optionalText(4000),
  price: decimal("o preço"),
  promoPrice: optionalDecimal,
  imageUrl: optionalUrl,
  imageAlt: optionalText(160),
  categoryId: z.string().optional().default(""),
  tags: commaList,
  ingredients: commaList,
  allergens: commaList,
  nutritionCalories: optionalText(40),
  nutritionProtein: optionalText(40),
  nutritionCarbs: optionalText(40),
  nutritionFat: optionalText(40),
  nutritionNotes: optionalText(300),
  gallery: optionalText(4000),
  featured: checkbox,
  isNew: checkbox,
  bestSeller: checkbox,
  active: checkbox,
  soldOut: checkbox,
  orderUrl: optionalUrl,
});

// ---------------------------------------------------------------------------
// Páginas
// ---------------------------------------------------------------------------

export const pageSettingsSchema = z.object({
  key: z.enum(["HOME", "MENU", "DELIVERY", "EVENTS", "LOCATIONS", "CONTACT"]),
  label: requiredText("o nome do menu", 40),
  headline: optionalText(140),
  intro: optionalText(600),
  metaTitle: optionalText(80),
  metaDescription: optionalText(200),
  socialImageUrl: optionalUrl,
  showInMenu: checkbox,
  showInFooter: checkbox,
});

export const pagesTogglesSchema = z.object({
  enabled: z.array(z.string()).optional().default([]),
});

// ---------------------------------------------------------------------------
// Home
// ---------------------------------------------------------------------------

export const homeSectionCreateSchema = z.object({
  type: z.enum([
    "HERO",
    "VIDEO",
    "CATEGORIES",
    "FEATURED_PRODUCTS",
    "BANNER",
    "ABOUT",
    "GALLERY",
    "DELIVERY_CTA",
    "LOCATIONS",
    "SOCIAL",
  ]),
});

export const reorderSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, "Nada para reordenar."),
});

// ---------------------------------------------------------------------------
// Mídia
// ---------------------------------------------------------------------------

export const mediaSlotSchema = z.object({
  key: requiredText("a identificação do espaço de imagem", 80),
  url: optionalUrl,
  alt: optionalText(200),
});

export const mediaAssetSchema = z.object({
  id: z.string().optional(),
  name: requiredText("o nome da imagem", 120),
  alt: optionalText(200),
  url: optionalUrl,
});

// ---------------------------------------------------------------------------
// Configurações
// ---------------------------------------------------------------------------

export const restaurantSettingsSchema = z.object({
  name: requiredText("o nome do restaurante", 120),
  tagline: optionalText(160),
  description: optionalText(600),
  phone: optionalText(40),
  whatsapp: optionalText(40),
  email: z
    .string()
    .trim()
    .max(160)
    .optional()
    .default("")
    .refine((value) => value === "" || z.string().email().safeParse(value).success, {
      message: "Informe um e-mail válido.",
    }),
  address: optionalText(240),
  city: optionalText(120),
  currency: z.string().trim().min(3).max(3).default("BRL"),
  locale: z.string().trim().min(2).max(10).default("pt-BR"),
  timezone: z.string().trim().min(3).max(60).default("America/Sao_Paulo"),
  openingHours: optionalText(400),
  orderUrl: optionalUrl,
  orderLabel: optionalText(40),
  whatsappEnabled: checkbox,
  whatsappMessage: optionalText(300),
});

export const appearanceSchema = z.object({
  colorPrimary: hexColor,
  colorSecondary: hexColor,
  colorAccent: hexColor,
  colorBackground: hexColor,
  colorSurface: hexColor,
  colorText: hexColor,
  colorMuted: hexColor,
  colorButton: hexColor,
  colorButtonText: hexColor,
  fontHeading: requiredText("a fonte dos títulos", 60),
  fontBody: requiredText("a fonte dos textos", 60),
  cardRadius: z.coerce.number().min(0).max(48),
  cardShadow: z.enum(["NONE", "SOFT", "MEDIUM", "STRONG"]),
  cardStyle: z.enum(["ELEVATED", "BORDERED", "MINIMAL"]),
  buttonStyle: z.enum(["ROUNDED", "PILL", "SQUARE"]),
});

export const seoSchema = z.object({
  siteTitle: requiredText("o título do site", 90),
  titleTemplate: optionalText(90),
  description: optionalText(220),
  keywords: optionalText(400),
  robots: optionalText(80),
  indexable: checkbox,
  googleVerification: optionalText(120),
});

export const headerSchema = z.object({
  showLogoText: checkbox,
  transparentOnTop: checkbox,
  sticky: checkbox,
  ctaEnabled: checkbox,
  ctaLabel: optionalText(40),
  ctaUrl: optionalUrl,
});

export const footerSchema = z.object({
  about: optionalText(600),
  copyright: optionalText(200),
  showSocial: checkbox,
});

export const socialLinkSchema = z.object({
  network: z.enum([
    "INSTAGRAM",
    "TIKTOK",
    "FACEBOOK",
    "YOUTUBE",
    "X",
    "WHATSAPP",
    "LINKEDIN",
    "THREADS",
  ]),
  url: optionalUrl,
  enabled: checkbox,
});

// ---------------------------------------------------------------------------
// Delivery, eventos e unidades
// ---------------------------------------------------------------------------

export const deliveryOptionSchema = z.object({
  id: z.string().optional(),
  name: requiredText("o nome do canal de delivery", 80),
  logoUrl: optionalUrl,
  description: optionalText(300),
  url: z
    .string()
    .trim()
    .min(1, "Informe o link para onde o cliente será enviado.")
    .max(2048)
    .refine((value) => /^(https?:\/\/|\/)/i.test(value), {
      message: "O link precisa começar com http:// ou https://.",
    }),
  active: checkbox,
});

export const eventSchema = z.object({
  id: z.string().optional(),
  name: requiredText("o nome do evento", 120),
  description: optionalText(2000),
  imageUrl: optionalUrl,
  imageAlt: optionalText(160),
  startsAt: z
    .string()
    .trim()
    .min(1, "Informe a data do evento.")
    .refine((value) => !Number.isNaN(new Date(value).getTime()), {
      message: "Informe uma data válida.",
    }),
  timeLabel: optionalText(60),
  address: optionalText(240),
  buttonLabel: optionalText(40),
  buttonUrl: optionalUrl,
  active: checkbox,
});

export const eventSettingsSchema = z.object({
  pastBehavior: z.enum(["HIDE", "ARCHIVE"]),
  intro: optionalText(600),
});

export const locationSchema = z.object({
  id: z.string().optional(),
  name: requiredText("o nome da unidade", 120),
  imageUrl: optionalUrl,
  imageAlt: optionalText(160),
  address: requiredText("o endereço", 240),
  city: optionalText(120),
  phone: optionalText(40),
  whatsapp: optionalText(40),
  openingHours: optionalText(400),
  mapsUrl: optionalUrl,
  deliveryUrl: optionalUrl,
  instagram: optionalUrl,
  active: checkbox,
});

export type LoginInput = z.infer<typeof loginSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type AppearanceInput = z.infer<typeof appearanceSchema>;
