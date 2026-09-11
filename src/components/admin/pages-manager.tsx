"use client";

import * as React from "react";
import { Pencil } from "lucide-react";
import type { Page } from "@prisma/client";

import { AdminForm } from "@/components/admin/admin-form";
import { FormDialog } from "@/components/admin/form-dialog";
import { ImageField } from "@/components/admin/image-field";
import { Badge } from "@/components/ui/misc";
import { Button } from "@/components/ui/button";
import { Field, Input, SwitchField, Textarea } from "@/components/ui/form";
import { PAGE_BY_KEY } from "@/lib/constants";
import { savePagesTogglesAction, savePageSettingsAction } from "@/server/actions/pages";

/**
 * Liga e desliga as páginas opcionais do site.
 * Quando uma página é desligada ela some do menu, do rodapé e o acesso direto
 * pelo endereço devolve "página não encontrada".
 */
export function PagesToggles({ pages }: { pages: Page[] }) {
  return (
    <AdminForm
      action={savePagesTogglesAction}
      submitLabel="Salvar páginas"
      description="As páginas desligadas somem do menu e do rodapé automaticamente."
    >
      <div className="space-y-2">
        {pages.map((page) => {
          const definition = PAGE_BY_KEY.get(page.key);
          const locked = page.lockedEnabled;
          return (
            <div key={page.key} className="space-y-1">
              {locked ? (
                <input type="hidden" name="enabled" value={page.key} />
              ) : null}
              <label
                className={`flex items-start justify-between gap-4 rounded-md border border-border bg-white px-3 py-2.5 ${
                  locked ? "opacity-70" : ""
                }`}
              >
                <span className="space-y-0.5">
                  <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                    {page.label}
                    {locked ? <Badge tone="neutral">Sempre visível</Badge> : null}
                  </span>
                  <span className="admin-hint block">{definition?.description}</span>
                </span>

                <input
                  type="checkbox"
                  name="enabled"
                  value={page.key}
                  defaultChecked={page.enabled || locked}
                  disabled={locked}
                  className="mt-1 size-5 shrink-0 accent-[hsl(var(--primary))]"
                  aria-label={`Mostrar a página ${page.label} no site`}
                />
              </label>
            </div>
          );
        })}
      </div>
    </AdminForm>
  );
}

export function PageSettingsList({ pages }: { pages: Page[] }) {
  return (
    <ul className="space-y-2">
      {pages.map((page) => (
        <li key={page.key} className="admin-card flex items-center gap-3 p-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-sm font-medium">{page.label}</span>
              <code className="rounded bg-secondary px-1.5 py-0.5 text-[0.7rem] text-subtle-foreground">
                {page.path}
              </code>
              {!page.enabled && !page.lockedEnabled ? (
                <Badge tone="neutral">Desligada</Badge>
              ) : null}
            </div>
            <p className="admin-hint truncate">
              {page.headline || page.metaTitle || "Sem título personalizado"}
            </p>
          </div>

          <PageSettingsDialog
            page={page}
            trigger={
              <Button variant="outline" size="sm">
                <Pencil aria-hidden />
                Editar textos
              </Button>
            }
          />
        </li>
      ))}
    </ul>
  );
}

function PageSettingsDialog({
  page,
  trigger,
}: {
  page: Page;
  trigger: React.ReactNode;
}) {
  return (
    <FormDialog
      trigger={trigger}
      title={`Página ${page.label}`}
      description="Textos do topo da página e informações que aparecem no Google."
    >
      {(close) => (
        <AdminForm
          action={savePageSettingsAction}
          actionsVariant="inline"
          submitLabel="Salvar página"
          onSuccess={close}
        >
          {(state) => (
            <div className="space-y-4">
              <input type="hidden" name="key" value={page.key} />

              <Field
                label="Nome no menu"
                htmlFor="label"
                required
                error={state.fieldErrors?.label}
              >
                <Input
                  id="label"
                  name="label"
                  defaultValue={page.label}
                  maxLength={40}
                  required
                />
              </Field>

              {page.key === "HOME" ? null : (
                <>
                  <Field
                    label="Título grande da página"
                    htmlFor="headline"
                    hint="Aparece em destaque no topo da página."
                  >
                    <Input
                      id="headline"
                      name="headline"
                      defaultValue={page.headline}
                      maxLength={140}
                    />
                  </Field>

                  <Field
                    label="Texto de apresentação"
                    htmlFor="intro"
                    hint="Uma ou duas frases abaixo do título."
                  >
                    <Textarea
                      id="intro"
                      name="intro"
                      rows={3}
                      defaultValue={page.intro}
                    />
                  </Field>
                </>
              )}

              <div className="grid gap-2 sm:grid-cols-2">
                <SwitchField
                  name="showInMenu"
                  label="Mostrar no menu do topo"
                  defaultChecked={page.showInMenu}
                />
                <SwitchField
                  name="showInFooter"
                  label="Mostrar no rodapé"
                  defaultChecked={page.showInFooter}
                />
              </div>

              <fieldset className="space-y-4 rounded-md border border-border p-3">
                <legend className="px-1 text-xs font-semibold uppercase tracking-wider text-subtle-foreground">
                  Google e redes sociais
                </legend>

                <Field
                  label="Título para o Google"
                  htmlFor="metaTitle"
                  hint="Se ficar em branco, usamos o nome do menu."
                >
                  <Input
                    id="metaTitle"
                    name="metaTitle"
                    defaultValue={page.metaTitle}
                    maxLength={80}
                  />
                </Field>

                <Field
                  label="Descrição para o Google"
                  htmlFor="metaDescription"
                  hint="Até 160 caracteres. É o texto cinza que aparece nos resultados de busca."
                >
                  <Textarea
                    id="metaDescription"
                    name="metaDescription"
                    rows={2}
                    defaultValue={page.metaDescription}
                    maxLength={200}
                  />
                </Field>

                <ImageField
                  name="socialImageUrl"
                  label="Imagem de compartilhamento"
                  hint="Aparece quando alguém compartilha o link desta página."
                  recommended="JPG · 1200 × 630 px"
                  folder="paginas"
                  aspect="wide"
                  defaultValue={page.socialImageUrl ?? ""}
                />
              </fieldset>
            </div>
          )}
        </AdminForm>
      )}
    </FormDialog>
  );
}
