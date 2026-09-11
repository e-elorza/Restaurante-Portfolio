import "server-only";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getSession, type SessionPayload } from "@/lib/auth";
import type { ActionState } from "@/lib/types";

export function ok(message: string): ActionState {
  return { status: "success", message };
}

export function fail(
  message: string,
  fieldErrors?: Record<string, string[]>,
): ActionState {
  return { status: "error", message, fieldErrors };
}

export function zodFieldErrors(error: z.ZodError): Record<string, string[]> {
  const flattened = error.flatten();
  return flattened.fieldErrors as Record<string, string[]>;
}

/** Transforma o erro do Zod em um estado pronto para o formulário. */
export function fromZodError(error: z.ZodError): ActionState {
  const fieldErrors = zodFieldErrors(error);
  const first = Object.values(fieldErrors)[0]?.[0];
  return fail(first ?? "Revise os campos destacados.", fieldErrors);
}

export class NotAuthenticatedError extends Error {}

/**
 * Toda Server Action do painel passa por aqui. O middleware já bloqueia as
 * rotas, mas as actions são endpoints próprios e precisam validar a sessão
 * por conta própria.
 */
export async function requireActionSession(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) {
    throw new NotAuthenticatedError(
      "Sua sessão expirou. Entre novamente para continuar.",
    );
  }
  return session;
}

/**
 * Envolve uma Server Action de formulário: valida a sessão, captura erros
 * inesperados e devolve sempre um `ActionState` para a interface.
 */
export function withActionState<T>(
  handler: (session: SessionPayload, formData: FormData) => Promise<ActionState | T>,
) {
  return async (_prev: ActionState, formData: FormData): Promise<ActionState> => {
    try {
      const session = await requireActionSession();
      const result = await handler(session, formData);
      return (result as ActionState) ?? ok("Alterações salvas com sucesso.");
    } catch (error) {
      if (error instanceof z.ZodError) return fromZodError(error);
      if (error instanceof NotAuthenticatedError) return fail(error.message);
      if (isNextControlFlowError(error)) throw error;
      console.error("[action]", error);
      return fail(
        error instanceof Error && error.message
          ? error.message
          : "Não foi possível salvar. Tente novamente.",
      );
    }
  };
}

/** `redirect()` e `notFound()` funcionam lançando erros — não capture. */
export function isNextControlFlowError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    typeof (error as { digest?: unknown }).digest === "string" &&
    ((error as { digest: string }).digest.startsWith("NEXT_REDIRECT") ||
      (error as { digest: string }).digest === "NEXT_NOT_FOUND")
  );
}

/** Limpa o cache de rotas do site e do painel após uma alteração. */
export function revalidateSite(extra?: string[]) {
  revalidatePath("/", "layout");
  for (const path of extra ?? []) revalidatePath(path);
}

export function str(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export function bool(formData: FormData, key: string): boolean {
  const value = formData.get(key);
  return value === "on" || value === "true";
}

export function list(formData: FormData, key: string): string[] {
  return formData.getAll(key).filter((v): v is string => typeof v === "string");
}

/** Converte o FormData inteiro em objeto simples (última ocorrência vence). */
export function formToObject(formData: FormData): Record<string, string> {
  const entries: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string") entries[key] = value;
  }
  return entries;
}
