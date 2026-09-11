"use client";

import type { FooterSettings, HeaderSettings } from "@prisma/client";

import { AdminForm } from "@/components/admin/admin-form";
import { ImageField } from "@/components/admin/image-field";
import { Field, FieldGroup, Input, SwitchField, Textarea } from "@/components/ui/form";
import { saveFooterAction, saveHeaderAction } from "@/server/actions/settings";

export function HeaderForm({ header }: { header: HeaderSettings }) {
  return (
    <AdminForm action={saveHeaderAction} submitLabel="Salvar cabeçalho">
      <FieldGroup
        title="Cabeçalho"
        description="A barra que fica no topo de todas as páginas."
      >
        <ImageField
          name="logoUrl"
          label="Logo do cabeçalho"
          hint="Se ficar em branco, usamos a logo definida em Mídia. Prefira uma logo clara: o topo do site tem fundo escuro."
          recommended="PNG com fundo transparente · 400 × 120 px"
          folder="site"
          aspect="wide"
          defaultValue={header.logoUrl ?? ""}
        />

        <SwitchField
          name="showLogoText"
          label="Mostrar também o nome do restaurante escrito"
          hint="Útil quando a logo é só um símbolo."
          defaultChecked={header.showLogoText}
        />

        <SwitchField
          name="transparentOnTop"
          label="Cabeçalho transparente sobre a foto do topo"
          hint="Ao rolar a página, ele ganha fundo sólido automaticamente."
          defaultChecked={header.transparentOnTop}
        />

        <SwitchField
          name="sticky"
          label="Manter o cabeçalho fixo ao rolar"
          defaultChecked={header.sticky}
        />

        <SwitchField
          name="ctaEnabled"
          label="Mostrar botão de destaque no cabeçalho"
          defaultChecked={header.ctaEnabled}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Texto do botão" htmlFor="ctaLabel">
            <Input
              id="ctaLabel"
              name="ctaLabel"
              defaultValue={header.ctaLabel}
              placeholder="Peça pelo WhatsApp"
              maxLength={40}
            />
          </Field>
          <Field
            label="Link do botão"
            htmlFor="ctaUrl"
            hint="Se ficar em branco, usamos o WhatsApp configurado em Configurações."
          >
            <Input
              id="ctaUrl"
              name="ctaUrl"
              defaultValue={header.ctaUrl}
              placeholder="https://..."
            />
          </Field>
        </div>
      </FieldGroup>
    </AdminForm>
  );
}

export function FooterForm({ footer }: { footer: FooterSettings }) {
  return (
    <AdminForm action={saveFooterAction} submitLabel="Salvar rodapé">
      <FieldGroup
        title="Rodapé"
        description="A faixa escura no fim de todas as páginas. Os links das páginas desligadas somem sozinhos."
      >
        <ImageField
          name="logoUrl"
          label="Logo do rodapé"
          recommended="PNG com fundo transparente · 400 × 120 px"
          folder="site"
          aspect="wide"
          defaultValue={footer.logoUrl ?? ""}
        />

        <Field
          label="Texto institucional"
          htmlFor="footer-about"
          hint="Uma ou duas frases sobre o restaurante."
        >
          <Textarea
            id="footer-about"
            name="about"
            rows={3}
            defaultValue={footer.about}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Endereço exibido no rodapé" htmlFor="footer-address">
            <Input id="footer-address" name="address" defaultValue={footer.address} />
          </Field>
          <Field label="Telefone exibido no rodapé" htmlFor="footer-phone">
            <Input id="footer-phone" name="phone" defaultValue={footer.phone} />
          </Field>
        </div>

        <Field
          label="Texto de direitos autorais"
          htmlFor="footer-copyright"
          hint="Se ficar em branco, geramos automaticamente com o ano atual."
        >
          <Input
            id="footer-copyright"
            name="copyright"
            defaultValue={footer.copyright}
            placeholder="© Seu Restaurante. Todos os direitos reservados."
          />
        </Field>

        <SwitchField
          name="showSocial"
          label="Mostrar os ícones das redes sociais"
          defaultChecked={footer.showSocial}
        />
      </FieldGroup>
    </AdminForm>
  );
}
