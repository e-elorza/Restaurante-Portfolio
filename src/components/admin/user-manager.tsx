"use client";

import { Plus, ShieldCheck, Trash2, UserCheck, UserX } from "lucide-react";

import { AdminForm } from "@/components/admin/admin-form";
import { FormDialog } from "@/components/admin/form-dialog";
import { Badge } from "@/components/ui/misc";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Field, Input, Select } from "@/components/ui/form";
import { formatDateTime } from "@/lib/utils";
import {
  createUserAction,
  deleteUserAction,
  toggleUserAction,
} from "@/server/actions/users";
import type { AdminUser } from "@/lib/data/users";

const ROLE_LABEL: Record<AdminUser["role"], string> = {
  ADMIN: "Administrador",
  EDITOR: "Editor",
};

export function UserManager({
  users,
  currentUserId,
}: {
  users: AdminUser[];
  currentUserId: string;
}) {
  const adminsAtivos = users.filter(
    (user) => user.role === "ADMIN" && user.active,
  ).length;

  return (
    <ul className="space-y-2">
      {users.map((user) => (
        <li key={user.id} className="admin-card p-3">
          <UserRow
            user={user}
            isSelf={user.id === currentUserId}
            isLastAdmin={user.role === "ADMIN" && user.active && adminsAtivos === 1}
          />
        </li>
      ))}
    </ul>
  );
}

function UserRow({
  user,
  isSelf,
  isLastAdmin,
}: {
  user: AdminUser;
  isSelf: boolean;
  isLastAdmin: boolean;
}) {
  // Ninguém tira o próprio acesso por engano, e o painel nunca fica sem um
  // administrador capaz de entrar.
  const bloqueado = isSelf || isLastAdmin;
  const motivo = isSelf
    ? "Você não pode alterar o seu próprio acesso por aqui."
    : "Este é o último administrador ativo. Crie outro antes de removê-lo.";

  return (
    <div className="flex flex-wrap items-center gap-3 sm:flex-nowrap">
      <span
        className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-semibold uppercase text-subtle-foreground"
        aria-hidden
      >
        {user.name.slice(0, 2)}
      </span>

      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-center gap-2 text-sm font-medium">
          {user.name}
          {isSelf ? <Badge tone="brand">Você</Badge> : null}
          <Badge tone={user.role === "ADMIN" ? "info" : "neutral"}>
            {user.role === "ADMIN" ? <ShieldCheck className="size-3" aria-hidden /> : null}
            {ROLE_LABEL[user.role]}
          </Badge>
          {user.active ? null : <Badge tone="warning">Desativado</Badge>}
        </p>
        <p className="admin-hint truncate">
          {user.email}
          {user.lastLoginAt
            ? ` · último acesso em ${formatDateTime(user.lastLoginAt)}`
            : " · ainda não entrou"}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        {bloqueado ? (
          <span className="admin-hint pr-1 text-right">{motivo}</span>
        ) : (
          <>
            <form action={toggleUserAction}>
              <input type="hidden" name="id" value={user.id} />
              <input type="hidden" name="active" value={user.active ? "false" : "true"} />
              <Button
                type="submit"
                variant="ghost"
                size="icon"
                title={user.active ? "Desativar acesso" : "Reativar acesso"}
                aria-label={
                  user.active
                    ? `Desativar o acesso de ${user.name}`
                    : `Reativar o acesso de ${user.name}`
                }
              >
                {user.active ? <UserX aria-hidden /> : <UserCheck aria-hidden />}
              </Button>
            </form>

            <ConfirmDialog
              title="Remover acesso"
              description={`Tem certeza que deseja remover o acesso de “${user.name}”? Essa pessoa deixa de entrar no painel imediatamente. Se quiser apenas suspender, use “Desativar acesso”.`}
              confirmLabel="Remover"
              action={deleteUserAction}
              hiddenFields={{ id: user.id }}
              trigger={
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:bg-destructive/10"
                  title="Remover acesso"
                  aria-label={`Remover o acesso de ${user.name}`}
                >
                  <Trash2 aria-hidden />
                </Button>
              }
            />
          </>
        )}
      </div>
    </div>
  );
}

/** Janela com o formulário de novo acesso. */
export function NewUserDialog() {
  return (
    <FormDialog
      title="Novo acesso ao painel"
      description="A pessoa entra em /admin com o e-mail e a senha definidos aqui. Ela pode trocar a senha depois, em “Minha conta”."
      trigger={
        <Button>
          <Plus aria-hidden />
          Novo acesso
        </Button>
      }
    >
      {(close) => (
        <AdminForm
          action={createUserAction}
          submitLabel="Criar acesso"
          loadingLabel="Criando..."
          actionsVariant="inline"
          onSuccess={close}
        >
          {(state) => (
            <div className="space-y-4">
              <Field
                label="Nome"
                htmlFor="new-user-name"
                required
                error={state.fieldErrors?.name}
              >
                <Input
                  id="new-user-name"
                  name="name"
                  placeholder="Ex.: Maria Souza"
                  required
                  maxLength={80}
                />
              </Field>

              <Field
                label="E-mail"
                htmlFor="new-user-email"
                required
                hint="É com ele que a pessoa entra no painel."
                error={state.fieldErrors?.email}
              >
                <Input
                  id="new-user-email"
                  name="email"
                  type="email"
                  autoComplete="off"
                  placeholder="maria@restaurante.com"
                  required
                />
              </Field>

              <Field
                label="Tipo de acesso"
                htmlFor="new-user-role"
                hint="O editor cuida do conteúdo do site; só o administrador gerencia os acessos."
                error={state.fieldErrors?.role}
              >
                <Select id="new-user-role" name="role" defaultValue="ADMIN">
                  <option value="ADMIN">Administrador</option>
                  <option value="EDITOR">Editor</option>
                </Select>
              </Field>

              <Field
                label="Senha provisória"
                htmlFor="new-user-password"
                required
                hint="Pelo menos 8 caracteres. Combine com a pessoa e peça para trocar depois."
                error={state.fieldErrors?.password}
              >
                <Input
                  id="new-user-password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                />
              </Field>

              <Field
                label="Repita a senha"
                htmlFor="new-user-confirm"
                required
                error={state.fieldErrors?.confirmPassword}
              >
                <Input
                  id="new-user-confirm"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                />
              </Field>
            </div>
          )}
        </AdminForm>
      )}
    </FormDialog>
  );
}
