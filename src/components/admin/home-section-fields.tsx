"use client";

import * as React from "react";
import type { Category } from "@prisma/client";

import { ImageField } from "@/components/admin/image-field";
import { Field, Input, Select, SwitchField, Textarea } from "@/components/ui/form";
import type {
  AboutConfig,
  BannerConfig,
  CategoriesConfig,
  DeliveryCtaConfig,
  FeaturedProductsConfig,
  GalleryConfig,
  HeroConfig,
  HomeSectionType,
  LocationsConfig,
  SocialConfig,
  TypedHomeSection,
  VideoConfig,
} from "@/lib/types";

/** Converte a lista de imagens salva em texto (um endereço por linha). */
function imagesToText(images: Array<{ url: string; alt?: string }>): string {
  return images.map((image) => (image.alt ? `${image.url} | ${image.alt}` : image.url)).join("\n");
}

const IMAGE_LINES_HINT =
  "Um endereço de imagem por linha. Para descrever a imagem, use: endereço | descrição";

/**
 * Campos da seção do cardápio. Os dois layouts usam ajustes diferentes, então
 * a tela mostra só o que vale para o que está selecionado.
 */
function CategoriesFields({ config }: { config: CategoriesConfig }) {
  const [layout, setLayout] = React.useState(config.layout ?? "CARDS");

  return (
    <>
      <Field
        label="Como exibir"
        htmlFor="layout"
        hint={
          layout === "SIMPLE"
            ? "Lista de preços da categoria principal, como num cardápio impresso. A categoria principal é escolhida em Cardápio > Categorias."
            : "Vitrine com a foto de cada categoria, que leva para a seção dela no cardápio."
        }
      >
        <Select
          id="layout"
          name="layout"
          defaultValue={layout}
          onChange={(event) => setLayout(event.target.value as CategoriesConfig["layout"])}
        >
          <option value="CARDS">Vitrine de categorias (com fotos)</option>
          <option value="SIMPLE">Cardápio simples (lista de preços)</option>
        </Select>
      </Field>

      {layout === "CARDS" ? (
        <>
          <Field
            label="Quantas categorias mostrar"
            htmlFor="limit"
            hint="As categorias aparecem na ordem definida em Cardápio > Categorias."
          >
            <Input
              id="limit"
              name="limit"
              type="number"
              min={1}
              max={12}
              defaultValue={config.limit}
            />
          </Field>
          <SwitchField
            name="showDescription"
            label="Mostrar a descrição de cada categoria"
            defaultChecked={config.showDescription}
          />
        </>
      ) : (
        // Os campos continuam no formulário para não perder o que já estava
        // salvo quando o administrador volta para a vitrine.
        <>
          <input type="hidden" name="limit" value={config.limit} />
          {config.showDescription ? (
            <input type="hidden" name="showDescription" value="on" />
          ) : null}
        </>
      )}

      <Field
        label="Texto do botão"
        htmlFor="buttonLabel"
        hint="Leva para o cardápio completo. Deixe em branco para esconder o botão."
      >
        <Input
          id="buttonLabel"
          name="buttonLabel"
          defaultValue={config.buttonLabel}
          placeholder="Ver cardápio completo"
        />
      </Field>
    </>
  );
}

function AlignField({ defaultValue }: { defaultValue: string }) {
  return (
    <Field
      label="Posição do texto"
      htmlFor="align"
      hint="Onde o título e o botão ficam sobre a imagem."
    >
      <Select id="align" name="align" defaultValue={defaultValue}>
        <option value="LEFT">À esquerda</option>
        <option value="CENTER">No centro</option>
        <option value="RIGHT">À direita</option>
      </Select>
    </Field>
  );
}

function HeightField({
  defaultValue,
  name = "height",
}: {
  defaultValue: string;
  name?: string;
}) {
  return (
    <Field label="Altura da seção" htmlFor={name}>
      <Select id={name} name={name} defaultValue={defaultValue}>
        <option value="COMPACT">Baixa</option>
        <option value="MEDIUM">Média</option>
        <option value="TALL">Alta</option>
        <option value="FULLSCREEN">Tela inteira</option>
      </Select>
    </Field>
  );
}

function OverlayField({ defaultValue }: { defaultValue: number }) {
  const [value, setValue] = React.useState(defaultValue);
  return (
    <Field
      label={`Escurecer a imagem (${value}%)`}
      htmlFor="overlay"
      hint="Aumente se o texto estiver difícil de ler sobre a foto."
    >
      <input
        id="overlay"
        name="overlay"
        type="range"
        min={0}
        max={90}
        step={5}
        value={value}
        onChange={(event) => setValue(Number(event.target.value))}
        className="w-full accent-[hsl(var(--primary))]"
      />
    </Field>
  );
}

function ButtonFields({
  label,
  url,
  labelHint = "Deixe em branco para não mostrar botão.",
}: {
  label: string;
  url: string;
  labelHint?: string;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="Texto do botão" htmlFor="buttonLabel" hint={labelHint}>
        <Input
          id="buttonLabel"
          name="buttonLabel"
          defaultValue={label}
          placeholder="Ex.: Ver cardápio"
          maxLength={40}
        />
      </Field>
      <Field
        label="Link do botão"
        htmlFor="buttonUrl"
        hint="Pode ser uma página do site (ex.: /cardapio) ou um endereço completo."
      >
        <Input id="buttonUrl" name="buttonUrl" defaultValue={url} placeholder="/cardapio" />
      </Field>
    </div>
  );
}

/** Campos específicos de cada tipo de seção da página inicial. */
export function HomeSectionFields({
  section,
  categories,
}: {
  section: TypedHomeSection;
  categories: Category[];
}) {
  const type = section.type as HomeSectionType;

  switch (type) {
    case "HERO": {
      const config = section.config as HeroConfig;
      return <HeroFields config={config} />;
    }

    case "VIDEO": {
      const config = section.config as VideoConfig;
      return (
        <>
          <Field
            label="De onde vem o vídeo"
            htmlFor="provider"
            hint="Escolha YouTube ou Vimeo e cole o link do vídeo."
          >
            <Select id="provider" name="provider" defaultValue={config.provider}>
              <option value="YOUTUBE">YouTube</option>
              <option value="VIMEO">Vimeo</option>
              <option value="UPLOAD">Arquivo de vídeo (link direto)</option>
            </Select>
          </Field>

          <Field label="Link do vídeo" htmlFor="url">
            <Input
              id="url"
              name="url"
              defaultValue={config.url}
              placeholder="https://www.youtube.com/watch?v=..."
            />
          </Field>

          <ImageField
            name="posterUrl"
            label="Capa do vídeo"
            hint="Imagem exibida antes de o vídeo começar. No celular, o vídeo só carrega depois que o cliente toca na capa."
            recommended="JPG · 1920 × 1080 px"
            folder="home"
            aspect="wide"
            defaultValue={config.posterUrl}
          />

          <div className="grid gap-2 sm:grid-cols-2">
            <SwitchField
              name="autoplay"
              label="Reproduzir automaticamente"
              defaultChecked={config.autoplay}
            />
            <SwitchField name="muted" label="Sem som" defaultChecked={config.muted} />
            <SwitchField name="loop" label="Repetir vídeo" defaultChecked={config.loop} />
            <SwitchField
              name="controls"
              label="Mostrar controles"
              defaultChecked={config.controls}
            />
          </div>

          <SwitchField
            name="fullWidth"
            label="Ocupar a largura inteira da tela"
            defaultChecked={config.fullWidth}
          />
        </>
      );
    }

    case "CATEGORIES":
      return <CategoriesFields config={section.config as CategoriesConfig} />;

    case "FEATURED_PRODUCTS": {
      const config = section.config as FeaturedProductsConfig;
      return (
        <>
          <Field
            label="Quais produtos mostrar"
            htmlFor="source"
            hint="As marcações de destaque/novidade ficam na tela de cada produto."
          >
            <Select id="source" name="source" defaultValue={config.source}>
              <option value="FEATURED">Produtos marcados como destaque</option>
              <option value="BEST_SELLER">Produtos marcados como mais vendidos</option>
              <option value="NEW">Produtos marcados como novidade</option>
              <option value="CATEGORY">Todos de uma categoria</option>
            </Select>
          </Field>

          <Field
            label="Categoria (quando escolher “Todos de uma categoria”)"
            htmlFor="categoryId"
          >
            <Select id="categoryId" name="categoryId" defaultValue={config.categoryId}>
              <option value="">Selecione...</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
          </Field>

          <Field
            label="Quantos produtos mostrar"
            htmlFor="limit"
            hint="O layout se ajusta sozinho à quantidade, sem deixar espaços vazios."
          >
            <Input
              id="limit"
              name="limit"
              type="number"
              min={1}
              max={24}
              defaultValue={config.limit}
            />
          </Field>

          <ButtonFields label={config.buttonLabel} url={config.buttonUrl} />
        </>
      );
    }

    case "BANNER": {
      const config = section.config as BannerConfig;
      return (
        <>
          <ImageField
            name="imageUrl"
            label="Imagem de fundo"
            recommended="JPG · 2000 × 900 px"
            folder="home"
            aspect="wide"
            defaultValue={config.imageUrl}
            altName="imageAlt"
            altDefaultValue={config.imageAlt}
          />
          <ImageField
            name="imageMobileUrl"
            label="Imagem para celular (opcional)"
            hint="Se ficar em branco, usamos a mesma imagem do computador."
            recommended="JPG · 1080 × 1350 px"
            folder="home"
            aspect="portrait"
            defaultValue={config.imageMobileUrl}
          />
          <ButtonFields label={config.buttonLabel} url={config.buttonUrl} />
          <div className="grid gap-4 sm:grid-cols-2">
            <AlignField defaultValue={config.align} />
            <HeightField defaultValue={config.height} />
          </div>
          <OverlayField defaultValue={config.overlay} />
        </>
      );
    }

    case "ABOUT": {
      const config = section.config as AboutConfig;
      return (
        <>
          <Field
            label="Texto institucional"
            htmlFor="text"
            hint="Conte a história do restaurante. Deixe uma linha em branco para separar parágrafos."
          >
            <Textarea id="text" name="text" rows={6} defaultValue={config.text} />
          </Field>

          <ImageField
            name="imageUrl"
            label="Imagem ao lado do texto"
            recommended="JPG · 1200 × 1400 px"
            folder="home"
            aspect="portrait"
            defaultValue={config.imageUrl}
            altName="imageAlt"
            altDefaultValue={config.imageAlt}
          />

          <Field label="Lado da imagem" htmlFor="imagePosition">
            <Select
              id="imagePosition"
              name="imagePosition"
              defaultValue={config.imagePosition}
            >
              <option value="LEFT">Imagem à esquerda</option>
              <option value="RIGHT">Imagem à direita</option>
            </Select>
          </Field>

          <ButtonFields label={config.buttonLabel} url={config.buttonUrl} />
        </>
      );
    }

    case "GALLERY": {
      const config = section.config as GalleryConfig;
      return (
        <>
          <Field label="Imagens da galeria" htmlFor="imagesRaw" hint={IMAGE_LINES_HINT}>
            <Textarea
              id="imagesRaw"
              name="imagesRaw"
              rows={6}
              defaultValue={imagesToText(config.images ?? [])}
              placeholder={"/demo/galeria-1.jpg | Salão do restaurante"}
            />
          </Field>
          <Field label="Colunas" htmlFor="columns">
            <Select id="columns" name="columns" defaultValue={String(config.columns)}>
              <option value="2">2 colunas</option>
              <option value="3">3 colunas</option>
              <option value="4">4 colunas</option>
            </Select>
          </Field>
        </>
      );
    }

    case "DELIVERY_CTA": {
      const config = section.config as DeliveryCtaConfig;
      return (
        <>
          <Field label="Texto do convite" htmlFor="text">
            <Textarea id="text" name="text" rows={3} defaultValue={config.text} />
          </Field>
          <ImageField
            name="imageUrl"
            label="Imagem"
            recommended="JPG · 1400 × 900 px"
            folder="home"
            defaultValue={config.imageUrl}
            altName="imageAlt"
            altDefaultValue={config.imageAlt}
          />
          <ButtonFields label={config.buttonLabel} url={config.buttonUrl} />
        </>
      );
    }

    case "LOCATIONS": {
      const config = section.config as LocationsConfig;
      return (
        <>
          <Field label="Quantas unidades mostrar" htmlFor="limit">
            <Input
              id="limit"
              name="limit"
              type="number"
              min={1}
              max={12}
              defaultValue={config.limit}
            />
          </Field>
          <Field label="Texto do botão" htmlFor="buttonLabel">
            <Input
              id="buttonLabel"
              name="buttonLabel"
              defaultValue={config.buttonLabel}
              placeholder="Ver todas as unidades"
            />
          </Field>
        </>
      );
    }

    case "SOCIAL": {
      const config = section.config as SocialConfig;
      return (
        <>
          <Field
            label="Seu @ nas redes"
            htmlFor="handle"
            hint="Aparece como pequeno rótulo acima do título."
          >
            <Input
              id="handle"
              name="handle"
              defaultValue={config.handle}
              placeholder="@seurestaurante"
            />
          </Field>
          <Field label="Texto do convite" htmlFor="text">
            <Textarea id="text" name="text" rows={2} defaultValue={config.text} />
          </Field>
          <Field label="Fotos" htmlFor="imagesRaw" hint={IMAGE_LINES_HINT}>
            <Textarea
              id="imagesRaw"
              name="imagesRaw"
              rows={5}
              defaultValue={imagesToText(config.images ?? [])}
            />
          </Field>
          <p className="admin-hint">
            Os links das redes ficam em <strong>Identidade &gt; Redes sociais</strong>.
          </p>
        </>
      );
    }

    default:
      return null;
  }
}

function HeroFields({ config }: { config: HeroConfig }) {
  const [mediaType, setMediaType] = React.useState(config.mediaType);

  return (
    <>
      <Field
        label="O que aparece no fundo"
        htmlFor="mediaType"
        hint="Você pode usar uma imagem, um vídeo ou um carrossel de imagens."
      >
        <Select
          id="mediaType"
          name="mediaType"
          value={mediaType}
          onChange={(event) =>
            setMediaType(event.target.value as HeroConfig["mediaType"])
          }
        >
          <option value="IMAGE">Uma imagem</option>
          <option value="VIDEO">Um vídeo</option>
          <option value="CAROUSEL">Carrossel de imagens</option>
        </Select>
      </Field>

      {mediaType === "IMAGE" ? (
        <>
          <ImageField
            name="imageUrl"
            label="Imagem principal (computador)"
            recommended="JPG · 2000 × 1200 px"
            folder="home"
            aspect="wide"
            defaultValue={config.imageUrl}
            altName="imageAlt"
            altDefaultValue={config.imageAlt}
          />
          <ImageField
            name="imageMobileUrl"
            label="Imagem para celular"
            hint="Uma versão vertical fica muito melhor no celular. Se ficar em branco, usamos a imagem acima."
            recommended="JPG · 1080 × 1440 px"
            folder="home"
            aspect="portrait"
            defaultValue={config.imageMobileUrl}
          />
        </>
      ) : null}

      {mediaType === "VIDEO" ? (
        <>
          <Field label="De onde vem o vídeo" htmlFor="videoProvider">
            <Select
              id="videoProvider"
              name="videoProvider"
              defaultValue={config.videoProvider}
            >
              <option value="YOUTUBE">YouTube</option>
              <option value="VIMEO">Vimeo</option>
              <option value="UPLOAD">Arquivo de vídeo (link direto)</option>
            </Select>
          </Field>
          <Field label="Link do vídeo" htmlFor="videoUrl">
            <Input
              id="videoUrl"
              name="videoUrl"
              defaultValue={config.videoUrl}
              placeholder="https://www.youtube.com/watch?v=..."
            />
          </Field>
          <ImageField
            name="posterUrl"
            label="Capa do vídeo"
            recommended="JPG · 1920 × 1080 px"
            folder="home"
            aspect="wide"
            defaultValue={config.posterUrl}
          />
        </>
      ) : null}

      {mediaType === "CAROUSEL" ? (
        <Field
          label="Imagens do carrossel"
          htmlFor="slidesRaw"
          hint="Uma imagem por linha. Para trocar o texto em cada imagem, use: endereço | descrição | título | subtítulo"
        >
          <Textarea
            id="slidesRaw"
            name="slidesRaw"
            rows={5}
            defaultValue={(config.slides ?? [])
              .map((slide) =>
                [slide.imageUrl, slide.alt, slide.title, slide.subtitle]
                  .map((part) => part ?? "")
                  .join(" | ")
                  .replace(/(\s\|\s*)+$/, ""),
              )
              .join("\n")}
          />
        </Field>
      ) : null}

      {/* Campos escondidos preservam o que já estava salvo nos outros formatos. */}
      {mediaType !== "IMAGE" ? (
        <>
          <input type="hidden" name="imageUrl" value={config.imageUrl} />
          <input type="hidden" name="imageMobileUrl" value={config.imageMobileUrl} />
          <input type="hidden" name="imageAlt" value={config.imageAlt} />
        </>
      ) : null}
      {mediaType !== "VIDEO" ? (
        <>
          <input type="hidden" name="videoProvider" value={config.videoProvider} />
          <input type="hidden" name="videoUrl" value={config.videoUrl} />
          <input type="hidden" name="posterUrl" value={config.posterUrl} />
        </>
      ) : null}
      {mediaType !== "CAROUSEL" ? (
        <input
          type="hidden"
          name="slidesRaw"
          value={(config.slides ?? [])
            .map((slide) =>
              [slide.imageUrl, slide.alt, slide.title, slide.subtitle]
                .map((part) => part ?? "")
                .join(" | ")
                .replace(/(\s\|\s*)+$/, ""),
            )
            .join("\n")}
        />
      ) : null}

      <SwitchField
        name="buttonEnabled"
        label="Mostrar botão"
        defaultChecked={config.buttonEnabled}
      />
      <ButtonFields
        label={config.buttonLabel}
        url={config.buttonUrl}
        labelHint="Ex.: Ver cardápio, Pedir agora."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <AlignField defaultValue={config.align} />
        <HeightField defaultValue={config.height} />
      </div>
      <OverlayField defaultValue={config.overlay} />
    </>
  );
}
