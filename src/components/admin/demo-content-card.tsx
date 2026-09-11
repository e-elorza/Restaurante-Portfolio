"use client";

import { Sparkles } from "lucide-react";

import { AdminForm } from "@/components/admin/admin-form";
import { loadDemoContentAction } from "@/server/actions/setup";

/**
 * Atalho exibido apenas enquanto o site está vazio: preenche tudo com o
 * conteúdo de demonstração para o dono ver como o site fica antes de cadastrar
 * o cardápio real.
 */
export function DemoContentCard() {
  return (
    <section className="admin-card mb-6 border-primary/30 bg-primary/[0.04] p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Sparkles className="size-5" aria-hidden />
          </span>
          <div className="space-y-1">
            <h2 className="admin-section-title">O seu site ainda está vazio</h2>
            <p className="admin-hint max-w-xl">
              Quer ver como ele fica cheio? Podemos carregar um cardápio de
              exemplo, com categorias, produtos, fotos e a página inicial montada.
              Depois é só editar ou apagar o que não servir.
            </p>
          </div>
        </div>

        <AdminForm
          action={loadDemoContentAction}
          submitLabel="Carregar demonstração"
          loadingLabel="Carregando..."
          actionsVariant="inline"
          className="shrink-0 space-y-0"
        >
          <span className="sr-only">
            Preenche o site com conteúdo fictício de demonstração
          </span>
        </AdminForm>
      </div>
    </section>
  );
}
