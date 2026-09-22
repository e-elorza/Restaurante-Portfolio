"use client";

import Link from "next/link";
import type { Category } from "@prisma/client";

import { AdminForm } from "@/components/admin/admin-form";
import { ImageField } from "@/components/admin/image-field";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldGroup,
  Input,
  Select,
  SwitchField,
  Textarea,
} from "@/components/ui/form";
import { saveProductAction } from "@/server/actions/menu";
import type { PublicProduct } from "@/lib/types";

export function ProductForm({
  product,
  categories,
  currencyLabel,
}: {
  product: PublicProduct | null;
  categories: Category[];
  currencyLabel: string;
}) {
  const gallery = (product?.images ?? [])
    .map((image) => (image.alt ? `${image.url} | ${image.alt}` : image.url))
    .join("\n");

  return (
    <AdminForm
      action={saveProductAction}
      submitLabel={product ? "Salvar alterações" : "Criar produto"}
      description="O produto aparece no cardápio assim que você salvar (se estiver publicado)."
      extraActions={
        <Button asChild type="button" variant="outline">
          <Link href="/admin/produtos">Cancelar</Link>
        </Button>
      }
    >
      {(state) => (
        <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr] lg:items-start">
          <div className="space-y-5">
            {product ? <input type="hidden" name="id" value={product.id} /> : null}

            <FieldGroup
              title="O básico"
              description="As informações que o cliente vê primeiro."
            >
              <Field
                label="Nome do produto"
                htmlFor="name"
                required
                error={state.fieldErrors?.name}
              >
                <Input
                  id="name"
                  name="name"
                  defaultValue={product?.name ?? ""}
                  placeholder="Ex.: Hambúrguer da casa"
                  required
                  maxLength={120}
                />
              </Field>

              <Field
                label="Descrição curta"
                htmlFor="shortDescription"
                hint="Uma linha que aparece embaixo do nome no cardápio."
                error={state.fieldErrors?.shortDescription}
              >
                <Input
                  id="shortDescription"
                  name="shortDescription"
                  defaultValue={product?.shortDescription ?? ""}
                  placeholder="Ex.: Blend 180g, queijo prato e cebola caramelizada."
                  maxLength={220}
                />
              </Field>

              <Field
                label="Descrição completa"
                htmlFor="description"
                hint="Texto maior, exibido quando o cliente abre o produto. Deixe em branco se não quiser."
                error={state.fieldErrors?.description}
              >
                <Textarea
                  id="description"
                  name="description"
                  rows={5}
                  defaultValue={product?.description ?? ""}
                  placeholder="Conte como o prato é preparado, de onde vêm os ingredientes..."
                />
              </Field>

              <Field
                label="Categoria"
                htmlFor="categoryId"
                hint="Em qual seção do cardápio este item aparece. Sem categoria, ele entra numa seção “Outros” no fim da página."
              >
                <Select
                  id="categoryId"
                  name="categoryId"
                  defaultValue={product?.categoryId ?? ""}
                >
                  <option value="">Sem categoria (aparece em “Outros”)</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </Select>
              </Field>
            </FieldGroup>

            <FieldGroup title="Preço" description={`Valores em ${currencyLabel}.`}>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Preço"
                  htmlFor="price"
                  required
                  error={state.fieldErrors?.price}
                >
                  <Input
                    id="price"
                    name="price"
                    inputMode="decimal"
                    defaultValue={product ? String(product.price) : ""}
                    placeholder="0,00"
                    required
                  />
                </Field>

                <Field
                  label="Preço promocional"
                  htmlFor="promoPrice"
                  hint="Opcional. O preço normal aparece riscado ao lado."
                  error={state.fieldErrors?.promoPrice}
                >
                  <Input
                    id="promoPrice"
                    name="promoPrice"
                    inputMode="decimal"
                    defaultValue={
                      product?.promoPrice !== null && product?.promoPrice !== undefined
                        ? String(product.promoPrice)
                        : ""
                    }
                    placeholder="Deixe em branco se não houver"
                  />
                </Field>
              </div>
            </FieldGroup>

            <FieldGroup
              title="Detalhes do prato"
              description="Separe cada item por vírgula."
            >
              <Field
                label="Ingredientes"
                htmlFor="ingredients"
                hint="Ex.: pão brioche, blend 180g, queijo prato"
              >
                <Textarea
                  id="ingredients"
                  name="ingredients"
                  rows={2}
                  defaultValue={product?.ingredients.join(", ") ?? ""}
                />
              </Field>

              <Field
                label="Alergênicos"
                htmlFor="allergens"
                hint="Ex.: glúten, leite, ovo. Aparece com destaque para o cliente."
              >
                <Textarea
                  id="allergens"
                  name="allergens"
                  rows={2}
                  defaultValue={product?.allergens.join(", ") ?? ""}
                />
              </Field>

              <Field
                label="Etiquetas"
                htmlFor="tags"
                hint="Ex.: vegetariano, picante, novidade. Aparecem como pequenos selos."
              >
                <Input
                  id="tags"
                  name="tags"
                  defaultValue={product?.tags.join(", ") ?? ""}
                />
              </Field>

              <details className="rounded-md border border-border bg-secondary/40 p-3">
                <summary className="cursor-pointer text-sm font-medium">
                  Informação nutricional (opcional)
                </summary>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <Field label="Calorias" htmlFor="nutritionCalories">
                    <Input
                      id="nutritionCalories"
                      name="nutritionCalories"
                      defaultValue={product?.nutrition?.calories ?? ""}
                      placeholder="Ex.: 720 kcal"
                    />
                  </Field>
                  <Field label="Proteínas" htmlFor="nutritionProtein">
                    <Input
                      id="nutritionProtein"
                      name="nutritionProtein"
                      defaultValue={product?.nutrition?.protein ?? ""}
                      placeholder="Ex.: 38 g"
                    />
                  </Field>
                  <Field label="Carboidratos" htmlFor="nutritionCarbs">
                    <Input
                      id="nutritionCarbs"
                      name="nutritionCarbs"
                      defaultValue={product?.nutrition?.carbs ?? ""}
                      placeholder="Ex.: 45 g"
                    />
                  </Field>
                  <Field label="Gorduras" htmlFor="nutritionFat">
                    <Input
                      id="nutritionFat"
                      name="nutritionFat"
                      defaultValue={product?.nutrition?.fat ?? ""}
                      placeholder="Ex.: 42 g"
                    />
                  </Field>
                  <Field label="Observações" htmlFor="nutritionNotes" className="sm:col-span-2">
                    <Input
                      id="nutritionNotes"
                      name="nutritionNotes"
                      defaultValue={product?.nutrition?.notes ?? ""}
                      placeholder="Ex.: valores referentes a uma porção"
                    />
                  </Field>
                </div>
              </details>
            </FieldGroup>

            <FieldGroup
              title="Opções avançadas"
              description="Você quase nunca vai precisar mexer aqui."
            >
              <Field
                label="Endereço da página do produto"
                htmlFor="slug"
                hint="Deixe em branco para gerar automaticamente a partir do nome."
              >
                <Input
                  id="slug"
                  name="slug"
                  defaultValue={product?.slug ?? ""}
                  placeholder="hamburguer-da-casa"
                />
              </Field>

              <Field
                label="Link do botão “Pedir agora” só deste produto"
                htmlFor="orderUrl"
                hint="Se ficar em branco, usamos o link geral definido em Configurações."
                error={state.fieldErrors?.orderUrl}
              >
                <Input
                  id="orderUrl"
                  name="orderUrl"
                  type="url"
                  defaultValue={product?.orderUrl ?? ""}
                  placeholder="https://..."
                />
              </Field>

              <Field
                label="Fotos extras"
                htmlFor="gallery"
                hint="Um endereço por linha. Para descrever a foto, use: endereço | descrição"
              >
                <Textarea id="gallery" name="gallery" rows={3} defaultValue={gallery} />
              </Field>
            </FieldGroup>
          </div>

          <div className="space-y-5 lg:sticky lg:top-20">
            <FieldGroup title="Foto principal">
              <ImageField
                name="imageUrl"
                label="Foto do produto"
                hint="Uma boa foto é o que mais vende. Use luz natural e enquadre o prato inteiro."
                recommended="JPG · 1200 × 900 px"
                folder="produtos"
                defaultValue={product?.imageUrl ?? ""}
                altName="imageAlt"
                altDefaultValue={product?.imageAlt ?? ""}
              />
            </FieldGroup>

            <FieldGroup
              title="Como aparece no site"
              description="Controle o que o cliente vê."
            >
              <SwitchField
                name="active"
                label="Mostrar este produto no site"
                hint="Desligue para escondê-lo sem apagar nada."
                defaultChecked={product?.active ?? true}
              />
              <SwitchField
                name="soldOut"
                label="Esgotado hoje"
                hint="Continua visível, mas com o aviso de esgotado."
                defaultChecked={product?.soldOut ?? false}
              />
              <SwitchField
                name="featured"
                label="Destaque"
                hint="Pode aparecer na vitrine da página inicial."
                defaultChecked={product?.featured ?? false}
              />
              <SwitchField
                name="isNew"
                label="Novidade"
                hint="Mostra o selo “Novidade” no card."
                defaultChecked={product?.isNew ?? false}
              />
              <SwitchField
                name="bestSeller"
                label="Mais vendido"
                hint="Mostra o selo “Mais vendido” no card."
                defaultChecked={product?.bestSeller ?? false}
              />
            </FieldGroup>
          </div>
        </div>
      )}
    </AdminForm>
  );
}
