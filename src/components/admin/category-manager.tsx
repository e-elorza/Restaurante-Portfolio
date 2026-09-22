"use client";

import Image from "next/image";
import { Eye, EyeOff, ImageOff, Pencil, Plus, Star, Trash2 } from "lucide-react";
import type { Category } from "@prisma/client";

import { AdminForm } from "@/components/admin/admin-form";
import { FormDialog } from "@/components/admin/form-dialog";
import { ImageField } from "@/components/admin/image-field";
import { SortableList } from "@/components/admin/sortable-list";
import { Badge, EmptyState } from "@/components/ui/misc";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Field, Input, SwitchField, Textarea } from "@/components/ui/form";
import {
  deleteCategoryAction,
  reorderCategoriesAction,
  saveCategoryAction,
  setPrimaryCategoryAction,
  toggleCategoryAction,
} from "@/server/actions/menu";

export type AdminCategory = Category & { _count: { products: number } };

export function CategoryManager({ categories }: { categories: AdminCategory[] }) {
  if (categories.length === 0) {
    return (
      <EmptyState
        title="Nenhuma categoria criada ainda"
        description="As categorias organizam o cardápio em seções como Hambúrgueres, Bebidas e Sobremesas."
      >
        <CategoryDialog
          trigger={
            <Button>
              <Plus aria-hidden />
              Criar primeira categoria
            </Button>
          }
        />
      </EmptyState>
    );
  }

  return (
    <SortableList
      action={reorderCategoriesAction}
      items={categories.map((category) => ({
        id: category.id,
        content: <CategoryRow category={category} />,
      }))}
    />
  );
}

function CategoryRow({ category }: { category: AdminCategory }) {
  return (
    <div className="flex flex-wrap items-center gap-3 p-2.5 sm:flex-nowrap">
      <span className="relative size-12 shrink-0 overflow-hidden rounded-md bg-secondary">
        {category.imageUrl ? (
          <Image
            src={category.imageUrl}
            alt=""
            fill
            unoptimized
            sizes="48px"
            className="object-cover"
          />
        ) : (
          <span className="flex h-full items-center justify-center text-subtle-foreground">
            <ImageOff className="size-4" aria-hidden />
          </span>
        )}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="truncate text-sm font-medium">{category.name}</span>
          {category.isPrimary ? (
            <Badge tone="brand">
              <Star className="size-3 fill-current" aria-hidden />
              Principal
            </Badge>
          ) : null}
          {!category.active ? <Badge tone="neutral">Escondida</Badge> : null}
        </div>
        <p className="admin-hint truncate">
          {category._count.products}{" "}
          {category._count.products === 1 ? "produto" : "produtos"}
          {category.description ? ` · ${category.description}` : ""}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <form action={setPrimaryCategoryAction}>
          <input type="hidden" name="id" value={category.id} />
          <Button
            type="submit"
            variant="ghost"
            size="icon"
            title={
              category.isPrimary
                ? "Deixar de ser a categoria principal"
                : "Definir como categoria principal (usada no cardápio simples da página inicial)"
            }
            aria-label={
              category.isPrimary
                ? `${category.name} deixa de ser a categoria principal`
                : `Definir ${category.name} como categoria principal`
            }
            aria-pressed={category.isPrimary}
            className={category.isPrimary ? "text-primary" : undefined}
          >
            <Star className={category.isPrimary ? "fill-current" : undefined} aria-hidden />
          </Button>
        </form>

        <form action={toggleCategoryAction}>
          <input type="hidden" name="id" value={category.id} />
          <input type="hidden" name="active" value={category.active ? "false" : "true"} />
          <Button
            type="submit"
            variant="ghost"
            size="icon"
            title={category.active ? "Esconder do site" : "Mostrar no site"}
            aria-label={category.active ? "Esconder do site" : "Mostrar no site"}
          >
            {category.active ? <Eye aria-hidden /> : <EyeOff aria-hidden />}
          </Button>
        </form>

        <CategoryDialog
          category={category}
          trigger={
            <Button
              variant="ghost"
              size="icon"
              title="Editar categoria"
              aria-label={`Editar ${category.name}`}
            >
              <Pencil aria-hidden />
            </Button>
          }
        />

        <ConfirmDialog
          title="Excluir categoria"
          description={`Tem certeza que deseja excluir a categoria “${category.name}”? Os produtos dela ficam sem categoria, mas não são apagados.`}
          action={deleteCategoryAction}
          hiddenFields={{ id: category.id }}
          trigger={
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive hover:bg-destructive/10"
              title="Excluir categoria"
              aria-label={`Excluir ${category.name}`}
            >
              <Trash2 aria-hidden />
            </Button>
          }
        />
      </div>
    </div>
  );
}

export function CategoryDialog({
  category,
  trigger,
}: {
  category?: AdminCategory;
  trigger: React.ReactNode;
}) {
  return (
    <FormDialog
      trigger={trigger}
      title={category ? "Editar categoria" : "Nova categoria"}
      description="As categorias aparecem como seções do cardápio e também na página inicial."
    >
      {(close) => (
        <AdminForm
          action={saveCategoryAction}
          actionsVariant="inline"
          submitLabel={category ? "Salvar" : "Criar categoria"}
          onSuccess={close}
        >
          {(state) => (
            <div className="space-y-4">
              {category ? (
                <input type="hidden" name="id" value={category.id} />
              ) : null}

              <Field
                label="Nome da categoria"
                htmlFor="category-name"
                required
                error={state.fieldErrors?.name}
              >
                <Input
                  id="category-name"
                  name="name"
                  defaultValue={category?.name ?? ""}
                  placeholder="Ex.: Hambúrgueres"
                  required
                  maxLength={80}
                />
              </Field>

              <Field
                label="Descrição"
                htmlFor="category-description"
                hint="Uma frase curta exibida abaixo do nome da seção."
                error={state.fieldErrors?.description}
              >
                <Textarea
                  id="category-description"
                  name="description"
                  rows={2}
                  defaultValue={category?.description ?? ""}
                  placeholder="Ex.: Blend de 180g selado na brasa."
                />
              </Field>

              <ImageField
                name="imageUrl"
                label="Imagem da categoria"
                hint="Aparece na vitrine de categorias da página inicial."
                recommended="JPG · 1200 × 900 px"
                folder="categorias"
                defaultValue={category?.imageUrl ?? ""}
                altName="imageAlt"
                altDefaultValue={category?.imageAlt ?? ""}
              />

              <SwitchField
                name="active"
                label="Mostrar esta categoria no site"
                defaultChecked={category?.active ?? true}
              />
            </div>
          )}
        </AdminForm>
      )}
    </FormDialog>
  );
}
