"use client";

import * as React from "react";
import { useActionState } from "react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { FormActions, SubmitButton } from "@/components/ui/form";
import { IDLE_ACTION_STATE, type ActionState } from "@/lib/types";

type AdminFormProps = {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  children: React.ReactNode | ((state: ActionState) => React.ReactNode);
  submitLabel?: string;
  loadingLabel?: string;
  description?: string;
  className?: string;
  /** Botões extras exibidos ao lado de "Salvar" (ex.: Cancelar). */
  extraActions?: React.ReactNode;
  /** Quando falso, a barra fixa de ações não é exibida. */
  showActions?: boolean;
  /** "bar" = barra fixa no rodapé da página; "inline" = botões logo abaixo. */
  actionsVariant?: "bar" | "inline";
  onSuccess?: () => void;
};

/**
 * Formulário padrão do painel: cuida do estado da Server Action, mostra o
 * toast de confirmação e a barra "Salvar alterações".
 */
export function AdminForm({
  action,
  children,
  submitLabel = "Salvar alterações",
  loadingLabel = "Salvando...",
  description,
  className,
  extraActions,
  showActions = true,
  actionsVariant = "bar",
  onSuccess,
}: AdminFormProps) {
  const [state, formAction] = useActionState(action, IDLE_ACTION_STATE);
  const lastMessage = React.useRef<string>("");

  React.useEffect(() => {
    if (state.status === "idle" || !state.message) return;
    const signature = `${state.status}:${state.message}`;
    if (signature === lastMessage.current) return;
    lastMessage.current = signature;

    if (state.status === "success") {
      toast.success(state.message);
      onSuccess?.();
    } else {
      toast.error(state.message);
    }
  }, [state, onSuccess]);

  return (
    <form action={formAction} className={cn("space-y-5", className)} noValidate>
      {typeof children === "function" ? children(state) : children}

      {state.status === "error" && state.message ? (
        <p
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
        >
          {state.message}
        </p>
      ) : null}

      {showActions ? (
        actionsVariant === "inline" ? (
          <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
            {extraActions}
            <SubmitButton loadingLabel={loadingLabel}>{submitLabel}</SubmitButton>
          </div>
        ) : (
          <FormActions description={description}>
            {extraActions}
            <SubmitButton loadingLabel={loadingLabel}>{submitLabel}</SubmitButton>
          </FormActions>
        )
      ) : null}
    </form>
  );
}

/** Atalho para ler o erro de um campo no estado da action. */
export function fieldError(
  state: ActionState,
  field: string,
): string[] | undefined {
  return state.fieldErrors?.[field];
}
