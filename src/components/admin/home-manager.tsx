"use client";

import * as React from "react";
import { Eye, EyeOff, Pencil, Plus, Trash2 } from "lucide-react";
import type { Category, PageKey } from "@prisma/client";

import { AdminForm } from "@/components/admin/admin-form";
import { FormDialog } from "@/components/admin/form-dialog";
import { HomeSectionFields } from "@/components/admin/home-section-fields";
import { SortableList } from "@/components/admin/sortable-list";
import { Badge, EmptyState } from "@/components/ui/misc";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Field, Input, Select, SwitchField } from "@/components/ui/form";
import { HOME_SECTION_DEFINITIONS } from "@/lib/constants";
import type { HomeSectionType, TypedHomeSection } from "@/lib/types";
import {
  addHomeSectionAction,
  deleteHomeSectionAction,
  reorderHomeSectionsAction,
  saveHomeSectionAction,
  toggleHomeSectionAction,
} from "@/server/actions/home";

const DEFINITION_BY_TYPE = new Map(
  HOME_SECTION_DEFINITIONS.map((definition) => [definition.type, definition]),
);

export function HomeManager({
  sections,
  categories,
  enabledPages,
}: {
  sections: TypedHomeSection[];
  categories: Category[];
  enabledPages: PageKey[];
}) {
  if (sections.length === 0) {
    return (
      <EmptyState
        title="A página inicial ainda está vazia"
        description="Adicione a primeira seção — normalmente começamos pelo destaque principal, com uma foto grande e o nome do restaurante."
      >
        <AddSectionDialog
          existingTypes={[]}
          trigger={
            <Button>
              <Plus aria-hidden />
              Adicionar primeira seção
            </Button>
          }
        />
      </EmptyState>
    );
  }

  return (
    <SortableList
      action={reorderHomeSectionsAction}
      items={sections.map((section) => ({
        id: section.id,
        content: (
          <SectionRow
            section={section}
            categories={categories}
            enabledPages={enabledPages}
          />
        ),
      }))}
    />
  );
}

function SectionRow({
  section,
  categories,
  enabledPages,
}: {
  section: TypedHomeSection;
  categories: Category[];
  enabledPages: PageKey[];
}) {
  const definition = DEFINITION_BY_TYPE.get(section.type as HomeSectionType);
  const hiddenByPage =
    definition?.requiresPage && !enabledPages.includes(definition.requiresPage);

  return (
    <div className="flex flex-wrap items-center gap-3 p-3 sm:flex-nowrap">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-sm font-medium">{definition?.label ?? section.type}</span>
          {!section.enabled ? <Badge tone="neutral">Desativada</Badge> : null}
          {hiddenByPage ? (
            <Badge tone="warning">
              Escondida: a página {definition?.requiresPage === "DELIVERY" ? "Delivery" : "Unidades"} está desligada
            </Badge>
          ) : null}
        </div>
        <p className="admin-hint truncate">
          {section.title || definition?.description}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <form action={toggleHomeSectionAction}>
          <input type="hidden" name="id" value={section.id} />
          <input type="hidden" name="enabled" value={section.enabled ? "false" : "true"} />
          <Button
            type="submit"
            variant="ghost"
            size="icon"
            title={section.enabled ? "Desativar seção" : "Ativar seção"}
            aria-label={section.enabled ? "Desativar seção" : "Ativar seção"}
          >
            {section.enabled ? <Eye aria-hidden /> : <EyeOff aria-hidden />}
          </Button>
        </form>

        <SectionDialog
          section={section}
          categories={categories}
          trigger={
            <Button variant="ghost" size="icon" title="Editar seção">
              <Pencil aria-hidden />
            </Button>
          }
        />

        <ConfirmDialog
          title="Remover seção"
          description={`Tem certeza que deseja remover a seção “${definition?.label ?? section.type}” da página inicial? Você pode adicioná-la de novo depois.`}
          confirmLabel="Remover"
          action={deleteHomeSectionAction}
          hiddenFields={{ id: section.id }}
          trigger={
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive hover:bg-destructive/10"
              title="Remover seção"
            >
              <Trash2 aria-hidden />
            </Button>
          }
        />
      </div>
    </div>
  );
}

function SectionDialog({
  section,
  categories,
  trigger,
}: {
  section: TypedHomeSection;
  categories: Category[];
  trigger: React.ReactNode;
}) {
  const definition = DEFINITION_BY_TYPE.get(section.type as HomeSectionType);

  return (
    <FormDialog
      trigger={trigger}
      title={definition?.label ?? "Seção"}
      description={definition?.description}
      className="max-h-[90svh] max-w-2xl overflow-y-auto"
    >
      {(close) => (
        <AdminForm
          action={saveHomeSectionAction}
          actionsVariant="inline"
          submitLabel="Salvar seção"
          onSuccess={close}
        >
          <div className="space-y-4">
            <input type="hidden" name="id" value={section.id} />

            <SwitchField
              name="enabled"
              label="Mostrar esta seção no site"
              defaultChecked={section.enabled}
            />

            <Field label="Título" htmlFor="title">
              <Input id="title" name="title" defaultValue={section.title} maxLength={160} />
            </Field>

            <Field
              label="Subtítulo"
              htmlFor="subtitle"
              hint="Texto menor exibido abaixo do título. Pode ficar em branco."
            >
              <Input
                id="subtitle"
                name="subtitle"
                defaultValue={section.subtitle}
                maxLength={300}
              />
            </Field>

            <HomeSectionFields section={section} categories={categories} />
          </div>
        </AdminForm>
      )}
    </FormDialog>
  );
}

export function AddSectionDialog({
  existingTypes,
  trigger,
}: {
  existingTypes: HomeSectionType[];
  trigger: React.ReactNode;
}) {
  const taken = new Set(existingTypes);

  return (
    <FormDialog
      trigger={trigger}
      title="Adicionar seção"
      description="Escolha o tipo de bloco que você quer acrescentar à página inicial. Depois é só arrastar para a posição desejada."
    >
      {(close) => (
        <AdminForm
          action={addHomeSectionAction}
          actionsVariant="inline"
          submitLabel="Adicionar"
          loadingLabel="Adicionando..."
          onSuccess={close}
        >
          <Field label="Tipo de seção" htmlFor="type">
            <Select id="type" name="type" defaultValue="">
              <option value="" disabled>
                Selecione...
              </option>
              {HOME_SECTION_DEFINITIONS.map((definition) => {
                const disabled = definition.unique && taken.has(definition.type);
                return (
                  <option
                    key={definition.type}
                    value={definition.type}
                    disabled={disabled}
                  >
                    {definition.label}
                    {disabled ? " (já está na página)" : ""}
                  </option>
                );
              })}
            </Select>
          </Field>

          <ul className="space-y-2 rounded-md border border-border bg-secondary/40 p-3">
            {HOME_SECTION_DEFINITIONS.map((definition) => (
              <li key={definition.type} className="text-xs leading-relaxed">
                <strong className="text-foreground">{definition.label}:</strong>{" "}
                <span className="text-subtle-foreground">{definition.description}</span>
              </li>
            ))}
          </ul>
        </AdminForm>
      )}
    </FormDialog>
  );
}
