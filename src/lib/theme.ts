import type { AppearanceSettings } from "@prisma/client";

import { BUTTON_RADIUS_VALUES, CARD_SHADOW_VALUES } from "@/lib/constants";

/** Converte `#RRGGBB` em `r g b` (formato aceito pelo `rgb()` do CSS). */
export function hexToRgbChannels(hex: string): string {
  const normalized = hex.replace("#", "").trim();
  const full =
    normalized.length === 3
      ? normalized
          .split("")
          .map((c) => c + c)
          .join("")
      : normalized;
  const value = Number.parseInt(full, 16);
  if (!Number.isFinite(value) || full.length !== 6) return "0 0 0";
  return `${(value >> 16) & 255} ${(value >> 8) & 255} ${value & 255}`;
}

/** Escolhe texto claro ou escuro conforme o contraste com a cor de fundo. */
export function readableTextColor(hex: string): string {
  const [r, g, b] = hexToRgbChannels(hex).split(" ").map(Number);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? "#1C1917" : "#FFFFFF";
}

export type ThemeVariables = Record<string, string>;

/** Monta as variáveis CSS que dão identidade ao site público. */
export function buildThemeVariables(appearance: AppearanceSettings): ThemeVariables {
  return {
    "--brand-primary": appearance.colorPrimary,
    "--brand-primary-rgb": hexToRgbChannels(appearance.colorPrimary),
    "--brand-secondary": appearance.colorSecondary,
    "--brand-secondary-rgb": hexToRgbChannels(appearance.colorSecondary),
    "--brand-accent": appearance.colorAccent,
    "--brand-accent-rgb": hexToRgbChannels(appearance.colorAccent),
    "--brand-background": appearance.colorBackground,
    "--brand-surface": appearance.colorSurface,
    "--brand-text": appearance.colorText,
    "--brand-text-rgb": hexToRgbChannels(appearance.colorText),
    "--brand-muted": appearance.colorMuted,
    "--brand-button": appearance.colorButton,
    "--brand-button-text": appearance.colorButtonText,
    "--card-radius": `${appearance.cardRadius}px`,
    "--card-shadow": CARD_SHADOW_VALUES[appearance.cardShadow] ?? CARD_SHADOW_VALUES.SOFT,
    "--button-radius":
      BUTTON_RADIUS_VALUES[appearance.buttonStyle] ?? BUTTON_RADIUS_VALUES.PILL,
    "--font-heading": `"${appearance.fontHeading}"`,
    "--font-body": `"${appearance.fontBody}"`,
  };
}

/** Serializa as variáveis para injeção em `<style>`. */
export function themeStyleSheet(appearance: AppearanceSettings): string {
  const variables = buildThemeVariables(appearance);
  const body = Object.entries(variables)
    .map(([key, value]) => `${key}: ${value};`)
    .join("");
  return `:root{${body}}`;
}

/** Classe utilitária para o estilo do card conforme a Aparência. */
export function cardStyleClass(appearance: AppearanceSettings): string {
  switch (appearance.cardStyle) {
    case "BORDERED":
      return "border border-ink/20 bg-surface";
    case "MINIMAL":
      return "bg-transparent";
    default:
      return "bg-surface shadow-card";
  }
}

const FONT_WEIGHTS = "wght@300;400;500;600;700;800";

/** Monta a URL do Google Fonts para as fontes escolhidas no painel. */
export function googleFontsHref(fonts: string[]): string {
  const families = Array.from(new Set(fonts.filter(Boolean)))
    .map((font) => `family=${encodeURIComponent(font).replace(/%20/g, "+")}:${FONT_WEIGHTS}`)
    .join("&");
  return `https://fonts.googleapis.com/css2?${families}&display=swap`;
}
