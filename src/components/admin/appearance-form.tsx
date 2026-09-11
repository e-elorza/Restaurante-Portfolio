"use client";

import * as React from "react";
import type { AppearanceSettings } from "@prisma/client";

import { AdminForm } from "@/components/admin/admin-form";
import { Field, FieldGroup, Input, Select } from "@/components/ui/form";
import { BUTTON_RADIUS_VALUES, CARD_SHADOW_VALUES, GOOGLE_FONTS } from "@/lib/constants";
import { googleFontsHref } from "@/lib/theme";
import { saveAppearanceAction } from "@/server/actions/settings";

type ColorKey =
  | "colorPrimary"
  | "colorSecondary"
  | "colorAccent"
  | "colorBackground"
  | "colorSurface"
  | "colorText"
  | "colorMuted"
  | "colorButton"
  | "colorButtonText";

const COLOR_FIELDS: Array<{ key: ColorKey; label: string; hint: string }> = [
  {
    key: "colorPrimary",
    label: "Cor principal",
    hint: "Usada em links, selos e detalhes de destaque.",
  },
  {
    key: "colorSecondary",
    label: "Cor escura",
    hint: "Fundo do cabeçalho, do rodapé e dos banners.",
  },
  {
    key: "colorAccent",
    label: "Cor de realce",
    hint: "Selos de novidade e pequenos destaques.",
  },
  {
    key: "colorBackground",
    label: "Fundo do site",
    hint: "A cor de fundo das páginas.",
  },
  {
    key: "colorSurface",
    label: "Fundo dos cards",
    hint: "A cor dos cartões de produto.",
  },
  { key: "colorText", label: "Cor do texto", hint: "Títulos e textos principais." },
  {
    key: "colorMuted",
    label: "Cor dos textos secundários",
    hint: "Descrições e legendas.",
  },
  { key: "colorButton", label: "Fundo dos botões", hint: "A cor dos botões do site." },
  {
    key: "colorButtonText",
    label: "Texto dos botões",
    hint: "A cor da letra dentro dos botões.",
  },
];

export function AppearanceForm({ appearance }: { appearance: AppearanceSettings }) {
  const [values, setValues] = React.useState(appearance);

  function update<K extends keyof AppearanceSettings>(
    key: K,
    value: AppearanceSettings[K],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  return (
    <>
      {/* Carrega as fontes escolhidas para a prévia ficar fiel. */}
      <link
        rel="stylesheet"
        href={googleFontsHref([values.fontHeading, values.fontBody])}
      />

      <AdminForm
        action={saveAppearanceAction}
        submitLabel="Salvar aparência"
        description="A prévia ao lado mostra como fica. Salve para aplicar no site."
      >
        <div className="grid gap-5 lg:grid-cols-[1fr_360px] lg:items-start">
          <div className="space-y-5">
            <FieldGroup
              title="Cores"
              description="Clique no quadradinho para escolher a cor ou digite o código."
            >
              <div className="grid gap-4 sm:grid-cols-2">
                {COLOR_FIELDS.map((field) => (
                  <Field
                    key={field.key}
                    label={field.label}
                    htmlFor={field.key}
                    hint={field.hint}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        aria-label={`${field.label} — seletor de cor`}
                        value={values[field.key]}
                        onChange={(event) => update(field.key, event.target.value)}
                        className="size-10 shrink-0 cursor-pointer rounded-md border border-input bg-white p-1"
                      />
                      <Input
                        id={field.key}
                        name={field.key}
                        value={values[field.key]}
                        onChange={(event) => update(field.key, event.target.value)}
                        className="font-mono uppercase"
                        maxLength={7}
                      />
                    </div>
                  </Field>
                ))}
              </div>
            </FieldGroup>

            <FieldGroup title="Tipografia">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Fonte dos títulos"
                  htmlFor="fontHeading"
                  hint="Dá personalidade ao site."
                >
                  <Select
                    id="fontHeading"
                    name="fontHeading"
                    value={values.fontHeading}
                    onChange={(event) => update("fontHeading", event.target.value)}
                  >
                    {GOOGLE_FONTS.map((font) => (
                      <option key={font} value={font}>
                        {font}
                      </option>
                    ))}
                  </Select>
                </Field>

                <Field
                  label="Fonte dos textos"
                  htmlFor="fontBody"
                  hint="Prefira fontes simples, fáceis de ler no celular."
                >
                  <Select
                    id="fontBody"
                    name="fontBody"
                    value={values.fontBody}
                    onChange={(event) => update("fontBody", event.target.value)}
                  >
                    {GOOGLE_FONTS.map((font) => (
                      <option key={font} value={font}>
                        {font}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>
            </FieldGroup>

            <FieldGroup title="Cards e botões">
              <Field
                label={`Cantos arredondados dos cards (${values.cardRadius}px)`}
                htmlFor="cardRadius"
              >
                <input
                  id="cardRadius"
                  name="cardRadius"
                  type="range"
                  min={0}
                  max={40}
                  step={2}
                  value={values.cardRadius}
                  onChange={(event) => update("cardRadius", Number(event.target.value))}
                  className="w-full accent-[hsl(var(--primary))]"
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Sombra dos cards" htmlFor="cardShadow">
                  <Select
                    id="cardShadow"
                    name="cardShadow"
                    value={values.cardShadow}
                    onChange={(event) =>
                      update("cardShadow", event.target.value as AppearanceSettings["cardShadow"])
                    }
                  >
                    <option value="NONE">Sem sombra</option>
                    <option value="SOFT">Suave</option>
                    <option value="MEDIUM">Média</option>
                    <option value="STRONG">Forte</option>
                  </Select>
                </Field>

                <Field label="Estilo dos cards" htmlFor="cardStyle">
                  <Select
                    id="cardStyle"
                    name="cardStyle"
                    value={values.cardStyle}
                    onChange={(event) =>
                      update("cardStyle", event.target.value as AppearanceSettings["cardStyle"])
                    }
                  >
                    <option value="ELEVATED">Com fundo e sombra</option>
                    <option value="BORDERED">Com borda fina</option>
                    <option value="MINIMAL">Sem fundo</option>
                  </Select>
                </Field>

                <Field label="Formato dos botões" htmlFor="buttonStyle">
                  <Select
                    id="buttonStyle"
                    name="buttonStyle"
                    value={values.buttonStyle}
                    onChange={(event) =>
                      update("buttonStyle", event.target.value as AppearanceSettings["buttonStyle"])
                    }
                  >
                    <option value="PILL">Arredondado total</option>
                    <option value="ROUNDED">Cantos suaves</option>
                    <option value="SQUARE">Quadrado</option>
                  </Select>
                </Field>
              </div>
            </FieldGroup>
          </div>

          <AppearancePreview values={values} />
        </div>
      </AdminForm>
    </>
  );
}

function AppearancePreview({ values }: { values: AppearanceSettings }) {
  return (
    <div className="lg:sticky lg:top-20">
      <p className="admin-hint mb-2">Prévia em tempo real</p>
      <div
        className="overflow-hidden rounded-lg border border-border"
        style={{ backgroundColor: values.colorBackground, color: values.colorText }}
      >
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{ backgroundColor: values.colorSecondary }}
        >
          <span
            className="text-sm font-semibold"
            style={{ color: "#FFFFFF", fontFamily: `"${values.fontHeading}", serif` }}
          >
            Seu restaurante
          </span>
          <span
            className="px-3 py-1.5 text-xs font-semibold"
            style={{
              backgroundColor: values.colorButton,
              color: values.colorButtonText,
              borderRadius: BUTTON_RADIUS_VALUES[values.buttonStyle],
            }}
          >
            Pedir agora
          </span>
        </div>

        <div className="space-y-3 p-4">
          <p
            className="text-[0.65rem] font-semibold uppercase tracking-[0.24em]"
            style={{ color: values.colorPrimary }}
          >
            Destaques
          </p>
          <h3
            className="text-xl leading-tight"
            style={{ fontFamily: `"${values.fontHeading}", serif` }}
          >
            Os queridinhos da casa
          </h3>

          <div
            className="overflow-hidden"
            style={{
              backgroundColor:
                values.cardStyle === "MINIMAL" ? "transparent" : values.colorSurface,
              borderRadius: `${values.cardRadius}px`,
              boxShadow:
                values.cardStyle === "ELEVATED"
                  ? CARD_SHADOW_VALUES[values.cardShadow]
                  : "none",
              border:
                values.cardStyle === "BORDERED"
                  ? `1px solid ${values.colorMuted}40`
                  : "none",
            }}
          >
            <div
              className="h-24 w-full"
              style={{
                background: `linear-gradient(135deg, ${values.colorSecondary}, ${values.colorPrimary})`,
              }}
            />
            <div className="space-y-1.5 p-3">
              <p
                className="text-sm font-semibold"
                style={{ fontFamily: `"${values.fontHeading}", serif` }}
              >
                Hambúrguer da casa
              </p>
              <p
                className="text-xs leading-relaxed"
                style={{
                  color: values.colorMuted,
                  fontFamily: `"${values.fontBody}", sans-serif`,
                }}
              >
                Blend 180g, queijo prato e cebola caramelizada.
              </p>
              <p
                className="pt-1 text-sm font-semibold"
                style={{ fontFamily: `"${values.fontHeading}", serif` }}
              >
                R$ 38,90
              </p>
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <span
              className="px-4 py-2 text-xs font-semibold"
              style={{
                backgroundColor: values.colorButton,
                color: values.colorButtonText,
                borderRadius: BUTTON_RADIUS_VALUES[values.buttonStyle],
              }}
            >
              Ver cardápio
            </span>
            <span
              className="border px-4 py-2 text-xs font-semibold"
              style={{
                borderColor: `${values.colorText}33`,
                color: values.colorText,
                borderRadius: BUTTON_RADIUS_VALUES[values.buttonStyle],
              }}
            >
              Delivery
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
