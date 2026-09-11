"use client";

import { useActionState } from "react";

import { Field, Input, SubmitButton } from "@/components/ui/form";
import { loginAction } from "@/server/actions/auth";
import { IDLE_ACTION_STATE } from "@/lib/types";

export function LoginForm({ redirectTo }: { redirectTo: string }) {
  const [state, formAction] = useActionState(loginAction, IDLE_ACTION_STATE);

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <input type="hidden" name="redirectTo" value={redirectTo} />

      <Field
        label="E-mail"
        htmlFor="email"
        error={state.fieldErrors?.email}
        required
      >
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
        error={state.fieldErrors?.password}
        required
      >
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="••••••••"
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

      <SubmitButton className="w-full" loadingLabel="Entrando...">
        Entrar
      </SubmitButton>
    </form>
  );
}
