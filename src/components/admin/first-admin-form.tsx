"use client";

import { useActionState } from "react";

import { Field, Input, SubmitButton } from "@/components/ui/form";
import { createFirstAdminAction } from "@/server/actions/auth";
import { IDLE_ACTION_STATE } from "@/lib/types";

/**
 * Formulário exibido apenas no primeiro acesso, quando o banco de dados ainda
 * não tem nenhum usuário. Evita que o dono do site precise de linha de comando
 * logo depois de publicar na Vercel.
 */
export function FirstAdminForm() {
  const [state, formAction] = useActionState(
    createFirstAdminAction,
    IDLE_ACTION_STATE,
  );

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <Field label="Seu nome" htmlFor="name" error={state.fieldErrors?.name} required>
        <Input
          id="name"
          name="name"
          autoComplete="name"
          required
          placeholder="Ex.: Maria Souza"
        />
      </Field>

      <Field label="E-mail" htmlFor="email" error={state.fieldErrors?.email} required>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          placeholder="voce@restaurante.com"
        />
      </Field>

      <Field
        label="Senha"
        htmlFor="password"
        hint="Pelo menos 8 caracteres. Prefira uma frase fácil de lembrar."
        error={state.fieldErrors?.password}
        required
      >
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </Field>

      <Field
        label="Repita a senha"
        htmlFor="confirmPassword"
        error={state.fieldErrors?.confirmPassword}
        required
      >
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </Field>

      {state.status === "error" && state.message ? (
        <p
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
        >
          {state.message}
        </p>
      ) : null}

      <SubmitButton className="w-full" loadingLabel="Criando acesso...">
        Criar meu acesso
      </SubmitButton>
    </form>
  );
}
