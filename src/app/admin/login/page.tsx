import type { Metadata } from "next";

import { LoginForm } from "@/components/admin/login-form";
import { getRestaurantSettings } from "@/lib/data/settings";

export const metadata: Metadata = { title: "Entrar" };

type PageProps = { searchParams: Promise<{ proximo?: string }> };

export default async function LoginPage({ searchParams }: PageProps) {
  const [{ proximo }, settings] = await Promise.all([
    searchParams,
    getRestaurantSettings(),
  ]);

  const redirectTo =
    proximo && proximo.startsWith("/admin") && !proximo.includes("//")
      ? proximo
      : "/admin";

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex items-center justify-center px-5 py-12 sm:px-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              {settings.name}
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Entrar no painel
            </h1>
            <p className="text-sm leading-relaxed text-subtle-foreground">
              Use o e-mail e a senha cadastrados para editar o conteúdo do site.
            </p>
          </div>

          <LoginForm redirectTo={redirectTo} />
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
