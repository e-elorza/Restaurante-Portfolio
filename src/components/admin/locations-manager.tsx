"use client";

import Image from "next/image";
import { MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import type { Location } from "@prisma/client";

import { AdminForm } from "@/components/admin/admin-form";
import { FormDialog } from "@/components/admin/form-dialog";
import { ImageField } from "@/components/admin/image-field";
import { SortableList } from "@/components/admin/sortable-list";
import { Badge, EmptyState } from "@/components/ui/misc";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Field, Input, SwitchField, Textarea } from "@/components/ui/form";
import {
  deleteLocationAction,
  reorderLocationsAction,
  saveLocationAction,
} from "@/server/actions/content";

export function LocationsManager({ locations }: { locations: Location[] }) {
  if (locations.length === 0) {
    return (
      <EmptyState
        icon={<MapPin className="size-5" aria-hidden />}
        title="Nenhuma unidade cadastrada"
        description="Cadastre cada endereço do restaurante com horário, telefone e mapa."
      >
        <LocationDialog
          trigger={
            <Button>
              <Plus aria-hidden />
              Cadastrar primeira unidade
            </Button>
          }
        />
      </EmptyState>
    );
  }

  return (
    <SortableList
      action={reorderLocationsAction}
      items={locations.map((location) => ({
        id: location.id,
        content: <LocationRow location={location} />,
      }))}
    />
  );
}

function LocationRow({ location }: { location: Location }) {
  return (
    <div className="flex flex-wrap items-center gap-3 p-2.5 sm:flex-nowrap">
      <span className="relative size-12 shrink-0 overflow-hidden rounded-md bg-secondary">
        {location.imageUrl ? (
          <Image
            src={location.imageUrl}
            alt=""
            fill
            unoptimized
            sizes="48px"
            className="object-cover"
          />
        ) : (
          <span className="flex h-full items-center justify-center text-subtle-foreground">
            <MapPin className="size-4" aria-hidden />
          </span>
        )}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="truncate text-sm font-medium">{location.name}</span>
          {!location.active ? <Badge tone="neutral">Escondida</Badge> : null}
        </div>
        <p className="admin-hint truncate">
          {location.address}
          {location.city ? `, ${location.city}` : ""}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <LocationDialog
          location={location}
          trigger={
            <Button variant="ghost" size="icon" title="Editar unidade">
              <Pencil aria-hidden />
            </Button>
          }
        />
        <ConfirmDialog
          title="Excluir unidade"
          description={`Tem certeza que deseja excluir a unidade “${location.name}”?`}
          action={deleteLocationAction}
          hiddenFields={{ id: location.id }}
          trigger={
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive hover:bg-destructive/10"
              title="Excluir unidade"
            >
              <Trash2 aria-hidden />
            </Button>
          }
        />
      </div>
    </div>
  );
}

export function LocationDialog({
  location,
  trigger,
}: {
  location?: Location;
  trigger: React.ReactNode;
}) {
  return (
    <FormDialog
      trigger={trigger}
      title={location ? "Editar unidade" : "Nova unidade"}
      description="Endereço, horários e contatos exibidos na página Unidades."
    >
      {(close) => (
        <AdminForm
          action={saveLocationAction}
          actionsVariant="inline"
          submitLabel={location ? "Salvar" : "Cadastrar unidade"}
          onSuccess={close}
        >
          {(state) => (
            <div className="space-y-4">
              {location ? <input type="hidden" name="id" value={location.id} /> : null}

              <Field
                label="Nome da unidade"
                htmlFor="location-name"
                required
                error={state.fieldErrors?.name}
              >
                <Input
                  id="location-name"
                  name="name"
                  defaultValue={location?.name ?? ""}
                  placeholder="Ex.: Unidade Centro"
                  required
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-[1.5fr_1fr]">
                <Field
                  label="Endereço"
                  htmlFor="location-address"
                  required
                  error={state.fieldErrors?.address}
                >
                  <Input
                    id="location-address"
                    name="address"
                    defaultValue={location?.address ?? ""}
                    placeholder="Rua, número e bairro"
                    required
                  />
                </Field>
                <Field label="Cidade" htmlFor="location-city">
                  <Input
                    id="location-city"
                    name="city"
                    defaultValue={location?.city ?? ""}
                    placeholder="São Paulo, SP"
                  />
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Telefone" htmlFor="location-phone">
                  <Input
                    id="location-phone"
                    name="phone"
                    defaultValue={location?.phone ?? ""}
                    placeholder="(11) 4002-8922"
                  />
                </Field>
                <Field
                  label="WhatsApp"
                  htmlFor="location-whatsapp"
                  hint="Somente números, com DDI e DDD. Ex.: 5511999999999"
                >
                  <Input
                    id="location-whatsapp"
                    name="whatsapp"
                    defaultValue={location?.whatsapp ?? ""}
                    inputMode="numeric"
                  />
                </Field>
              </div>

              <Field
                label="Horário de funcionamento"
                htmlFor="location-hours"
                hint="Use uma linha para cada dia ou faixa de dias."
              >
                <Textarea
                  id="location-hours"
                  name="openingHours"
                  rows={3}
                  defaultValue={location?.openingHours ?? ""}
                  placeholder={"Ter a qui: 18h–23h\nSex e sáb: 18h–00h"}
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Link do Google Maps" htmlFor="location-maps">
                  <Input
                    id="location-maps"
                    name="mapsUrl"
                    defaultValue={location?.mapsUrl ?? ""}
                    placeholder="https://maps.google.com/..."
                  />
                </Field>
                <Field label="Link de delivery desta unidade" htmlFor="location-delivery">
                  <Input
                    id="location-delivery"
                    name="deliveryUrl"
                    defaultValue={location?.deliveryUrl ?? ""}
                    placeholder="https://..."
                  />
                </Field>
              </div>

              <Field label="Instagram da unidade" htmlFor="location-instagram">
                <Input
                  id="location-instagram"
                  name="instagram"
                  defaultValue={location?.instagram ?? ""}
                  placeholder="https://instagram.com/..."
                />
              </Field>

              <ImageField
                name="imageUrl"
                label="Foto da unidade"
                recommended="JPG · 1200 × 900 px"
                folder="unidades"
                defaultValue={location?.imageUrl ?? ""}
                altName="imageAlt"
                altDefaultValue={location?.imageAlt ?? ""}
              />

              <SwitchField
                name="active"
                label="Mostrar esta unidade no site"
                defaultChecked={location?.active ?? true}
              />
            </div>
          )}
        </AdminForm>
      )}
    </FormDialog>
  );
}
