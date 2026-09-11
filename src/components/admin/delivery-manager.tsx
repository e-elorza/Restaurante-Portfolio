"use client";

import Image from "next/image";
import { Bike, Pencil, Plus, Trash2 } from "lucide-react";
import type { DeliveryOption } from "@prisma/client";

import { AdminForm } from "@/components/admin/admin-form";
import { FormDialog } from "@/components/admin/form-dialog";
import { ImageField } from "@/components/admin/image-field";
import { SortableList } from "@/components/admin/sortable-list";
import { Badge, EmptyState } from "@/components/ui/misc";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Field, Input, SwitchField, Textarea } from "@/components/ui/form";
import {
  deleteDeliveryOptionAction,
  reorderDeliveryOptionsAction,
  saveDeliveryOptionAction,
} from "@/server/actions/content";

export function DeliveryManager({ options }: { options: DeliveryOption[] }) {
  if (options.length === 0) {
    return (
      <EmptyState
        icon={<Bike className="size-5" aria-hidden />}
        title="Nenhum canal de entrega cadastrado"
        description="Cadastre os aplicativos e o WhatsApp em que o cliente pode fazer o pedido."
      >
        <DeliveryDialog
          trigger={
            <Button>
              <Plus aria-hidden />
              Adicionar primeiro canal
            </Button>
          }
        />
      </EmptyState>
    );
  }

  return (
    <SortableList
      action={reorderDeliveryOptionsAction}
      items={options.map((option) => ({
        id: option.id,
        content: <DeliveryRow option={option} />,
      }))}
    />
  );
}

function DeliveryRow({ option }: { option: DeliveryOption }) {
  return (
    <div className="flex flex-wrap items-center gap-3 p-2.5 sm:flex-nowrap">
      <span className="relative size-11 shrink-0 overflow-hidden rounded-md bg-secondary">
        {option.logoUrl ? (
          <Image
            src={option.logoUrl}
            alt=""
            fill
            unoptimized
            sizes="44px"
            className="object-cover"
          />
        ) : (
          <span className="flex h-full items-center justify-center text-subtle-foreground">
            <Bike className="size-4" aria-hidden />
          </span>
        )}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="truncate text-sm font-medium">{option.name}</span>
          {!option.active ? <Badge tone="neutral">Escondido</Badge> : null}
        </div>
        <p className="admin-hint truncate">{option.description || option.url}</p>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <DeliveryDialog
          option={option}
          trigger={
            <Button variant="ghost" size="icon" title="Editar canal">
              <Pencil aria-hidden />
            </Button>
          }
        />
        <ConfirmDialog
          title="Excluir canal de delivery"
          description={`Tem certeza que deseja excluir “${option.name}”?`}
          action={deleteDeliveryOptionAction}
          hiddenFields={{ id: option.id }}
          trigger={
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive hover:bg-destructive/10"
              title="Excluir canal"
            >
              <Trash2 aria-hidden />
            </Button>
          }
        />
      </div>
    </div>
  );
}

export function DeliveryDialog({
  option,
  trigger,
}: {
  option?: DeliveryOption;
  trigger: React.ReactNode;
}) {
  return (
    <FormDialog
      trigger={trigger}
      title={option ? "Editar canal de delivery" : "Novo canal de delivery"}
      description="Cada canal vira um card clicável na página de Delivery."
    >
      {(close) => (
        <AdminForm
          action={saveDeliveryOptionAction}
          actionsVariant="inline"
          submitLabel={option ? "Salvar" : "Adicionar"}
          onSuccess={close}
        >
          {(state) => (
            <div className="space-y-4">
              {option ? <input type="hidden" name="id" value={option.id} /> : null}

              <Field
                label="Nome do canal"
                htmlFor="delivery-name"
                required
                error={state.fieldErrors?.name}
              >
                <Input
                  id="delivery-name"
                  name="name"
                  defaultValue={option?.name ?? ""}
                  placeholder="Ex.: WhatsApp, iFood, entrega própria"
                  required
                />
              </Field>

              <Field
                label="Link para onde o cliente vai"
                htmlFor="delivery-url"
                required
                hint="Cole o endereço completo, começando com https://"
                error={state.fieldErrors?.url}
              >
                <Input
                  id="delivery-url"
                  name="url"
                  defaultValue={option?.url ?? ""}
                  placeholder="https://wa.me/5511999999999"
                  required
                />
              </Field>

              <Field
                label="Descrição"
                htmlFor="delivery-description"
                hint="Uma frase explicando o canal (taxa, tempo de entrega, desconto...)."
              >
                <Textarea
                  id="delivery-description"
                  name="description"
                  rows={2}
                  defaultValue={option?.description ?? ""}
                />
              </Field>

              <ImageField
                name="logoUrl"
                label="Logo do canal"
                recommended="PNG quadrado · 240 × 240 px"
                folder="delivery"
                aspect="square"
                defaultValue={option?.logoUrl ?? ""}
              />

              <SwitchField
                name="active"
                label="Mostrar este canal no site"
                defaultChecked={option?.active ?? true}
              />
            </div>
          )}
        </AdminForm>
      )}
    </FormDialog>
  );
}
