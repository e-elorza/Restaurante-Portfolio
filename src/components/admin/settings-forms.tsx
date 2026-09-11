"use client";

import type { RestaurantSettings, SeoSettings, SocialLink } from "@prisma/client";

import { AdminForm } from "@/components/admin/admin-form";
import { ImageField } from "@/components/admin/image-field";
import {
  Field,
  FieldGroup,
  Input,
  Select,
  SwitchField,
  Textarea,
} from "@/components/ui/form";
import { SOCIAL_NETWORKS } from "@/lib/constants";
import {
  saveRestaurantSettingsAction,
  saveSeoAction,
  saveSocialLinksAction,
} from "@/server/actions/settings";

const CURRENCIES = [
  { value: "BRL", label: "Real brasileiro (R$)" },
  { value: "USD", label: "Dólar americano (US$)" },
  { value: "EUR", label: "Euro (€)" },
];

const TIMEZONES = [
  "America/Sao_Paulo",
  "America/Bahia",
  "America/Fortaleza",
  "America/Manaus",
  "America/Cuiaba",
  "America/Belem",
  "America/Rio_Branco",
  "America/Lisbon",
  "Europe/Lisbon",
];

export function GeneralSettingsForm({
  settings,
}: {
  settings: RestaurantSettings;
}) {
  return (
    <AdminForm
      action={saveRestaurantSettingsAction}
      submitLabel="Salvar configurações"
      description="Estes dados aparecem no rodapé, na página de contato e nos botões de pedido."
    >
      {(state) => (
        <div className="space-y-5">
          <FieldGroup title="O restaurante">
            <Field
              label="Nome do restaurante"
              htmlFor="name"
              required
              error={state.fieldErrors?.name}
            >
              <Input
                id="name"
                name="name"
                defaultValue={settings.name}
                required
                maxLength={120}
              />
            </Field>

            <Field
              label="Frase de efeito"
              htmlFor="tagline"
              hint="Uma linha curta que resume o restaurante. Aparece no rodapé."
            >
              <Input
                id="tagline"
                name="tagline"
                defaultValue={settings.tagline}
                placeholder="Ex.: Cozinha de fogo, alma de bairro"
              />
            </Field>

            <Field label="Descrição" htmlFor="description">
              <Textarea
                id="description"
                name="description"
                rows={3}
                defaultValue={settings.description}
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <ImageField
                name="logoUrl"
                label="Logo"
                hint="Use a mesma logo do cabeçalho, se preferir."
                recommended="PNG com fundo transparente · 400 × 120 px"
                folder="site"
                aspect="wide"
                defaultValue={settings.logoUrl ?? ""}
              />
              <ImageField
                name="faviconUrl"
                label="Ícone do navegador"
                hint="Aparece na abinha do navegador."
                recommended="PNG quadrado · 512 × 512 px"
                folder="site"
                aspect="square"
                defaultValue={settings.faviconUrl ?? ""}
              />
            </div>
          </FieldGroup>

          <FieldGroup title="Contatos">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Telefone" htmlFor="phone">
                <Input
                  id="phone"
                  name="phone"
                  defaultValue={settings.phone ?? ""}
                  placeholder="(11) 4002-8922"
                />
              </Field>

              <Field
                label="WhatsApp"
                htmlFor="whatsapp"
                hint="Somente números, com DDI e DDD. Ex.: 5511999999999"
                tooltip="É esse número que recebe os pedidos do botão flutuante e dos botões “Pedir agora”."
              >
                <Input
                  id="whatsapp"
                  name="whatsapp"
                  inputMode="numeric"
                  defaultValue={settings.whatsapp ?? ""}
                  placeholder="5511999999999"
                />
              </Field>

              <Field label="E-mail" htmlFor="email" error={state.fieldErrors?.email}>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={settings.email ?? ""}
                  placeholder="contato@restaurante.com"
                />
              </Field>

              <Field label="Cidade" htmlFor="city">
                <Input
                  id="city"
                  name="city"
                  defaultValue={settings.city ?? ""}
                  placeholder="São Paulo, SP"
                />
              </Field>
            </div>

            <Field label="Endereço" htmlFor="address">
              <Input
                id="address"
                name="address"
                defaultValue={settings.address ?? ""}
                placeholder="Rua, número e bairro"
              />
            </Field>

            <Field
              label="Horário de funcionamento"
              htmlFor="openingHours"
              hint="Uma linha para cada dia ou faixa de dias."
            >
              <Textarea
                id="openingHours"
                name="openingHours"
                rows={4}
                defaultValue={settings.openingHours ?? ""}
                placeholder={"Ter a qui: 18h às 23h\nSex e sáb: 18h à meia-noite"}
              />
            </Field>
          </FieldGroup>

          <FieldGroup
            title="Pedidos"
            description="Para onde o cliente vai ao tocar em “Pedir agora”."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Texto do botão de pedido" htmlFor="orderLabel">
                <Input
                  id="orderLabel"
                  name="orderLabel"
                  defaultValue={settings.orderLabel}
                  placeholder="Pedir agora"
                  maxLength={40}
                />
              </Field>

              <Field
                label="Link geral de pedidos"
                htmlFor="orderUrl"
                hint="Se ficar em branco, usamos o WhatsApp com o nome do produto na mensagem."
                error={state.fieldErrors?.orderUrl}
              >
                <Input
                  id="orderUrl"
                  name="orderUrl"
                  defaultValue={settings.orderUrl ?? ""}
                  placeholder="https://..."
                />
              </Field>
            </div>

            <SwitchField
              name="whatsappEnabled"
              label="Mostrar o botão flutuante de WhatsApp"
              hint="Aquele botão verde que acompanha o cliente enquanto ele rola a página."
              defaultChecked={settings.whatsappEnabled}
            />

            <Field
              label="Mensagem inicial do WhatsApp"
              htmlFor="whatsappMessage"
              hint="Já vem escrita para o cliente quando ele abre a conversa."
            >
              <Textarea
                id="whatsappMessage"
                name="whatsappMessage"
                rows={2}
                defaultValue={settings.whatsappMessage}
              />
            </Field>
          </FieldGroup>

          <FieldGroup
            title="Região"
            description="Definem como preços e datas são exibidos."
          >
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Moeda" htmlFor="currency">
                <Select id="currency" name="currency" defaultValue={settings.currency}>
                  {CURRENCIES.map((currency) => (
                    <option key={currency.value} value={currency.value}>
                      {currency.label}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field label="Idioma dos números" htmlFor="locale">
                <Select id="locale" name="locale" defaultValue={settings.locale}>
                  <option value="pt-BR">Português (Brasil)</option>
                  <option value="pt-PT">Português (Portugal)</option>
                  <option value="en-US">Inglês (EUA)</option>
                  <option value="es-ES">Espanhol</option>
                </Select>
              </Field>

              <Field label="Fuso horário" htmlFor="timezone">
                <Select id="timezone" name="timezone" defaultValue={settings.timezone}>
                  {TIMEZONES.map((zone) => (
                    <option key={zone} value={zone}>
                      {zone}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
          </FieldGroup>
        </div>
      )}
    </AdminForm>
  );
}

export function SeoForm({ seo }: { seo: SeoSettings }) {
  return (
    <AdminForm
      action={saveSeoAction}
      submitLabel="Salvar SEO"
      description="Estas informações aparecem no Google e quando alguém compartilha o link do site."
    >
      {(state) => (
        <div className="space-y-5">
          <FieldGroup title="Como o site aparece no Google">
            <Field
              label="Título do site"
              htmlFor="siteTitle"
              required
              error={state.fieldErrors?.siteTitle}
            >
              <Input
                id="siteTitle"
                name="siteTitle"
                defaultValue={seo.siteTitle}
                required
                maxLength={90}
              />
            </Field>

            <Field
              label="Formato do título das outras páginas"
              htmlFor="titleTemplate"
              hint="Use %s no lugar do nome da página. Ex.: %s · Meu Restaurante"
            >
              <Input
                id="titleTemplate"
                name="titleTemplate"
                defaultValue={seo.titleTemplate}
                placeholder="%s · Meu Restaurante"
              />
            </Field>

            <Field
              label="Descrição do site"
              htmlFor="description"
              hint="Até 160 caracteres. É o texto cinza que aparece nos resultados de busca."
            >
              <Textarea
                id="description"
                name="description"
                rows={3}
                defaultValue={seo.description}
                maxLength={220}
              />
            </Field>

            <Field
              label="Palavras-chave"
              htmlFor="keywords"
              hint="Separadas por vírgula. Opcional — hoje os buscadores dão pouco peso a isso."
            >
              <Input id="keywords" name="keywords" defaultValue={seo.keywords} />
            </Field>
          </FieldGroup>

          <FieldGroup title="Imagens">
            <div className="grid gap-4 sm:grid-cols-2">
              <ImageField
                name="ogImageUrl"
                label="Imagem de compartilhamento"
                hint="Aparece quando alguém manda o link do site no WhatsApp ou Instagram."
                recommended="JPG · 1200 × 630 px"
                folder="seo"
                aspect="wide"
                defaultValue={seo.ogImageUrl ?? ""}
              />
              <ImageField
                name="faviconUrl"
                label="Ícone do navegador"
                recommended="PNG quadrado · 512 × 512 px"
                folder="seo"
                aspect="square"
                defaultValue={seo.faviconUrl ?? ""}
              />
            </div>
          </FieldGroup>

          <FieldGroup
            title="Indexação"
            description="Controla se os buscadores podem exibir o site."
          >
            <SwitchField
              name="indexable"
              label="Permitir que o site apareça no Google"
              hint="Desligue apenas enquanto o site estiver em construção."
              defaultChecked={seo.indexable}
            />

            <Field
              label="Regra para robôs (avançado)"
              htmlFor="robots"
              hint="Deixe como está se não souber o que é."
            >
              <Input
                id="robots"
                name="robots"
                defaultValue={seo.robots}
                placeholder="index, follow"
              />
            </Field>

            <Field
              label="Código de verificação do Google (avançado)"
              htmlFor="googleVerification"
            >
              <Input
                id="googleVerification"
                name="googleVerification"
                defaultValue={seo.googleVerification ?? ""}
              />
            </Field>
          </FieldGroup>
        </div>
      )}
    </AdminForm>
  );
}

export function SocialLinksForm({ links }: { links: SocialLink[] }) {
  const byNetwork = new Map(links.map((link) => [link.network, link]));

  return (
    <AdminForm
      action={saveSocialLinksAction}
      submitLabel="Salvar redes sociais"
      description="Só aparecem no site as redes ligadas e com link preenchido."
    >
      <div className="space-y-3">
        {SOCIAL_NETWORKS.map((definition) => {
          const link = byNetwork.get(definition.network);
          return (
            <div
              key={definition.network}
              className="admin-card grid gap-3 p-3 sm:grid-cols-[180px_1fr] sm:items-center"
            >
              <SwitchField
                name={`enabled-${definition.network}`}
                label={definition.label}
                defaultChecked={link?.enabled ?? false}
                className="border-0 bg-transparent px-0 py-0"
              />
              <Input
                name={`url-${definition.network}`}
                defaultValue={link?.url ?? ""}
                placeholder={definition.placeholder}
                aria-label={`Link do ${definition.label}`}
              />
            </div>
          );
        })}
      </div>
    </AdminForm>
  );
}
