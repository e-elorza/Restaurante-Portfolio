"use client";

import Image from "next/image";
import { CalendarDays, Pencil, Plus, Trash2 } from "lucide-react";
import type { Event, EventSettings } from "@prisma/client";

import { AdminForm } from "@/components/admin/admin-form";
import { FormDialog } from "@/components/admin/form-dialog";
import { ImageField } from "@/components/admin/image-field";
import { Badge, EmptyState } from "@/components/ui/misc";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Field, Input, Select, SwitchField, Textarea } from "@/components/ui/form";
import { deleteEventAction, saveEventAction } from "@/server/actions/content";
import { saveEventSettingsAction } from "@/server/actions/settings";
import { formatDate } from "@/lib/utils";

/** Converte a data do banco para o formato aceito pelo input datetime-local. */
function toLocalInput(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
}

export function EventSettingsForm({ settings }: { settings: EventSettings }) {
  return (
    <AdminForm
      action={saveEventSettingsAction}
      submitLabel="Salvar configurações"
      description="Define como os eventos já realizados são tratados."
    >
      <div className="admin-card space-y-4 p-4">
        <Field
          label="O que fazer com eventos que já passaram"
          htmlFor="pastBehavior"
          hint="“Guardar no histórico” mantém os eventos antigos visíveis em uma lista separada."
        >
          <Select
            id="pastBehavior"
            name="pastBehavior"
            defaultValue={settings.pastBehavior}
          >
            <option value="ARCHIVE">Guardar no histórico da página</option>
            <option value="HIDE">Esconder automaticamente</option>
          </Select>
        </Field>

        <Field
          label="Texto de apresentação da agenda"
          htmlFor="intro"
          hint="Aparece no topo da página de eventos."
        >
          <Textarea id="intro" name="intro" rows={2} defaultValue={settings.intro} />
        </Field>
      </div>
    </AdminForm>
  );
}

export function EventsManager({ events, locale }: { events: Event[]; locale: string }) {
  if (events.length === 0) {
    return (
      <EmptyState
        icon={<CalendarDays className="size-5" aria-hidden />}
        title="Nenhum evento cadastrado"
        description="Cadastre shows, festivais e noites temáticas para aparecerem na agenda do site."
      >
        <EventDialog
          trigger={
            <Button>
              <Plus aria-hidden />
              Criar primeiro evento
            </Button>
          }
        />
      </EmptyState>
    );
  }

  const now = new Date();

  return (
    <ul className="space-y-2">
      {events.map((event) => {
        const past = event.startsAt < now;
        return (
          <li key={event.id} className="admin-card flex items-center gap-3 p-2.5">
            <span className="relative size-12 shrink-0 overflow-hidden rounded-md bg-secondary">
              {event.imageUrl ? (
                <Image
                  src={event.imageUrl}
                  alt=""
                  fill
                  unoptimized
                  sizes="48px"
                  className="object-cover"
                />
              ) : (
                <span className="flex h-full items-center justify-center text-subtle-foreground">
                  <CalendarDays className="size-4" aria-hidden />
                </span>
              )}
            </span>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="truncate text-sm font-medium">{event.name}</span>
                {past ? <Badge tone="neutral">Já aconteceu</Badge> : null}
                {!event.active ? <Badge tone="warning">Escondido</Badge> : null}
              </div>
              <p className="admin-hint truncate">
                {formatDate(event.startsAt, locale)}
                {event.timeLabel ? ` · ${event.timeLabel}` : ""}
                {event.address ? ` · ${event.address}` : ""}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-1">
              <EventDialog
                event={event}
                trigger={
                  <Button variant="ghost" size="icon" title="Editar evento">
                    <Pencil aria-hidden />
                  </Button>
                }
              />
              <ConfirmDialog
                title="Excluir evento"
                description={`Tem certeza que deseja excluir o evento “${event.name}”?`}
                action={deleteEventAction}
                hiddenFields={{ id: event.id }}
                trigger={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:bg-destructive/10"
                    title="Excluir evento"
                  >
                    <Trash2 aria-hidden />
                  </Button>
                }
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export function EventDialog({
  event,
  trigger,
}: {
  event?: Event;
  trigger: React.ReactNode;
}) {
  return (
    <FormDialog
      trigger={trigger}
      title={event ? "Editar evento" : "Novo evento"}
      description="Os eventos aparecem na página Eventos, do mais próximo para o mais distante."
    >
      {(close) => (
        <AdminForm
          action={saveEventAction}
          actionsVariant="inline"
          submitLabel={event ? "Salvar" : "Criar evento"}
          onSuccess={close}
        >
          {(state) => (
            <div className="space-y-4">
              {event ? <input type="hidden" name="id" value={event.id} /> : null}

              <Field
                label="Nome do evento"
                htmlFor="event-name"
                required
                error={state.fieldErrors?.name}
              >
                <Input
                  id="event-name"
                  name="name"
                  defaultValue={event?.name ?? ""}
                  placeholder="Ex.: Noite da Brasa"
                  required
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Data"
                  htmlFor="event-date"
                  required
                  error={state.fieldErrors?.startsAt}
                >
                  <Input
                    id="event-date"
                    name="startsAt"
                    type="datetime-local"
                    defaultValue={event ? toLocalInput(event.startsAt) : ""}
                    required
                  />
                </Field>

                <Field
                  label="Horário (texto livre)"
                  htmlFor="event-time"
                  hint="Ex.: 20h às 23h30"
                >
                  <Input
                    id="event-time"
                    name="timeLabel"
                    defaultValue={event?.timeLabel ?? ""}
                  />
                </Field>
              </div>

              <Field label="Local" htmlFor="event-address">
                <Input
                  id="event-address"
                  name="address"
                  defaultValue={event?.address ?? ""}
                  placeholder="Ex.: Unidade Centro · Rua das Oliveiras, 210"
                />
              </Field>

              <Field label="Descrição" htmlFor="event-description">
                <Textarea
                  id="event-description"
                  name="description"
                  rows={3}
                  defaultValue={event?.description ?? ""}
                />
              </Field>

              <ImageField
                name="imageUrl"
                label="Imagem do evento"
                recommended="JPG · 1200 × 900 px"
                folder="eventos"
                defaultValue={event?.imageUrl ?? ""}
                altName="imageAlt"
                altDefaultValue={event?.imageAlt ?? ""}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Texto do botão" htmlFor="event-button-label">
                  <Input
                    id="event-button-label"
                    name="buttonLabel"
                    defaultValue={event?.buttonLabel ?? ""}
                    placeholder="Ex.: Reservar mesa"
                  />
                </Field>
                <Field label="Link do botão" htmlFor="event-button-url">
                  <Input
                    id="event-button-url"
                    name="buttonUrl"
                    defaultValue={event?.buttonUrl ?? ""}
                    placeholder="https://..."
                  />
                </Field>
              </div>

              <SwitchField
                name="active"
                label="Mostrar este evento no site"
                defaultChecked={event?.active ?? true}
              />
            </div>
          )}
        </AdminForm>
      )}
    </FormDialog>
  );
}
