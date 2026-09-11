import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Converte um texto qualquer em slug seguro para URL. */
export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Formata um valor monetário conforme moeda e idioma configurados no painel. */
export function formatCurrency(
  value: number | string | null | undefined,
  currency = "BRL",
  locale = "pt-BR",
): string {
  if (value === null || value === undefined || value === "") return "";
  const numeric = typeof value === "string" ? Number(value) : value;
  if (!Number.isFinite(numeric)) return "";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(numeric);
}

/** Formata data para exibição amigável (ex.: 12 de março de 2026). */
export function formatDate(
  date: Date | string,
  locale = "pt-BR",
  options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "long",
    year: "numeric",
  },
): string {
  const parsed = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(parsed.getTime())) return "";
  return new Intl.DateTimeFormat(locale, options).format(parsed);
}

/** Formata data e hora curtas (ex.: 12/03/2026 19:30). */
export function formatDateTime(date: Date | string, locale = "pt-BR"): string {
  return formatDate(date, locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Mantém apenas os dígitos — usado para montar links de WhatsApp. */
export function onlyDigits(value: string): string {
  return value.replace(/\D+/g, "");
}

/**
 * Monta o link do WhatsApp com mensagem pré-preenchida.
 * Retorna string vazia quando não há número configurado.
 */
export function whatsappLink(phone?: string | null, message?: string | null): string {
  const digits = onlyDigits(phone ?? "");
  if (!digits) return "";
  const base = `https://wa.me/${digits}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/** Converte string em número, aceitando vírgula decimal. */
export function parseNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const normalized = String(value).replace(/\s/g, "").replace(",", ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

/** Divide uma string separada por vírgulas em uma lista limpa. */
export function splitList(value: string | null | undefined): string[] {
  if (!value) return [];
  return value
    .split(/[,\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

/** Recorta um texto preservando palavras inteiras. */
export function truncate(value: string, max: number): string {
  if (value.length <= max) return value;
  return `${value.slice(0, max).replace(/\s+\S*$/, "")}…`;
}

/** Garante que uma URL externa é http(s) — evita `javascript:` em campos livres. */
export function safeExternalUrl(url: string | null | undefined): string {
  if (!url) return "";
  const trimmed = url.trim();
  if (/^(https?:\/\/|mailto:|tel:|\/)/i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}
