"use client";

import { AdminForm } from "@/components/admin/admin-form";
import { Field, FieldGroup, Input } from "@/components/ui/form";
import { changePasswordAction } from "@/server/actions/auth";

export function ChangePasswordForm() {
  return (
    <AdminForm
      action={changePasswordAction}
      submitLabel="Alterar senha"
      loadingLabel="Alterando..."
      actionsVariant="inline"
    >
      {(state) => (
        <FieldGroup
          title="Trocar senha"
          description="Use pelo menos 8 caracteres. Prefira uma frase fácil de lembrar."
        >
          <Field
            label="Senha atual"
            htmlFor="currentPassword"
            required
            error={state.fieldErrors?.currentPassword}
          >
            <Input
              id="currentPassword"
              name="currentPassword"
              type="password"
              autoComplete="current-password"
              required
            />
          </Field>

          <Field
            label="Nova senha"
            htmlFor="newPassword"
            required
            error={state.fieldErrors?.newPassword}
          >
            <Input
              id="newPassword"
              name="newPassword"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
            />
          </Field>

          <Field
            label="Repita a nova senha"
            htmlFor="confirmPassword"
            required
            error={state.fieldErrors?.confirmPassword}
          >
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
            />
          </Field>
        </FieldGroup>
      )}
    </AdminForm>
  );
}
