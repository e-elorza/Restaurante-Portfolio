import type { Metadata } from "next";
import { Database, KeyRound } from "lucide-react";

import { FirstAdminForm } from "@/components/admin/first-admin-form";
import { LoginForm } from "@/components/admin/login-form";
import { getAdminAccessState } from "@/lib/data/users";
import { getRestaurantSettings } from "@/lib/data/settings";

export const metadata: Metadata = { title: "Entrar" };

type PageProps = { searchParams: Promise<{ proximo?: string }> };

export default async function LoginPage({ searchParams }: PageProps) {
  const [{ proximo }, settings, access] = await Promise.all([
    searchParams,
    getRestaurantSettings(),
    getAdminAccessState(),
  ]);

  const redirectTo =
    proximo && proximo.startsWith("/admin") && !proximo.includes("//")
      ? proximo
      : "/admin";

  const titulo = {
    "sem-banco": "Quase lá",
    "primeiro-acesso": "Crie o seu acesso",
    pronto: "Entrar no painel",
  }[access];

  const descricao = {
    "sem-banco":
      "O site está no ar, mas ainda não conseguimos falar com o banco de dados.",
    "primeiro-acesso":
      "Este é o primeiro acesso ao painel. Escolha o e-mail e a senha que você vai usar para editar o site.",
    pronto:
      "Use o e-mail e a senha cadastrados para editar o conteúdo do site.",
  }[access];

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex items-center justify-center px-5 py-12 sm:px-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              {settings.name}
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              {titulo}
            </h1>
            <p className="text-sm leading-relaxed text-subtle-foreground">
              {descricao}
            </p>
          </div>

          {access === "sem-banco" ? <DatabaseHelp /> : null}
          {access === "primeiro-acesso" ? <FirstAdminForm /> : null}
          {access === "pronto" ? <LoginForm redirectTo={redirectTo} /> : null}
        </div>
      </div>

      <div className="relative hidden overflow-hidden bg-stone-900 lg:block">
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(circle_at_30%_25%,rgba(194,65,12,0.55),transparent_60%),radial-gradient(circle_at_75%_70%,rgba(245,158,11,0.35),transparent_55%)]"
        />
        <div className="relative flex h-full flex-col justify-end p-12 text-white">
          <blockquote className="max-w-md space-y-4">
            <p className="text-2xl font-semibold leading-snug">
              Tudo o que o cliente vê no site você muda por aqui — sem depender de
              ninguém.
            </p>
            <footer className="text-sm text-white/60">
              Cardápio, fotos, páginas, cores e contatos.
            </footer>
          </blockquote>
        </div>
      </div>
    </div>
  );
}

/** Instruções exibidas quando o banco de dados ainda não respondeu. */
function DatabaseHelp() {
  return (
    <div className="space-y-4">
      <div className="flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-900">
        <Database className="mt-0.5 size-5 shrink-0" aria-hidden />
        <div className="space-y-2 text-sm leading-relaxed">
          <p className="font-semibold">Falta conectar o banco de dados</p>
          <p>
            Crie um banco PostgreSQL (Neon, Supabase ou Vercel Postgres) e informe
            a conexão na variável <code className="rounded bg-amber-100 px-1">DATABASE_URL</code>.
          </p>
        </div>
      </div>

      <ol className="space-y-2 text-sm leading-relaxed text-subtle-foreground">
        <li>
          <strong className="text-foreground">1.</strong> Na Vercel, abra o projeto
          em <em>Settings → Environment Variables</em>.
        </li>
        <li>
          <strong className="text-foreground">2.</strong> Adicione{" "}
          <code className="rounded bg-secondary px-1">DATABASE_URL</code> e{" "}
          <code className="rounded bg-secondary px-1">AUTH_SECRET</code>.
        </li>
        <li>
          <strong className="text-foreground">3.</strong> Publique o site de novo —
          as tabelas são criadas sozinhas durante o deploy.
        </li>
      </ol>

      <p className="flex items-center gap-2 text-xs text-subtle-foreground">
        <KeyRound className="size-3.5 shrink-0" aria-hidden />
        Depois disso, esta tela passa a oferecer a criação do seu acesso.
      </p>
    </div>
  );
}
