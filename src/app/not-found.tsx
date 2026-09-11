import Link from "next/link";

import { getAppearance, getRestaurantSettings } from "@/lib/data/settings";
import { googleFontsHref, themeStyleSheet } from "@/lib/theme";

export const dynamic = "force-dynamic";

/** Página 404 do site. Também é usada quando uma página opcional está desligada. */
export default async function NotFound() {
  const [settings, appearance] = await Promise.all([
    getRestaurantSettings(),
    getAppearance(),
  ]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--brand-secondary)] px-6 text-center text-white">
      <link
        rel="stylesheet"
        href={googleFontsHref([appearance.fontHeading, appearance.fontBody])}
      />
      <style dangerouslySetInnerHTML={{ __html: themeStyleSheet(appearance) }} />

      <p className="mb-4 text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-white/50">
        Erro 404
      </p>
      <h1 className="font-heading text-4xl font-semibold sm:text-5xl">
        Essa página não está no cardápio
      </h1>
      <p className="mt-4 max-w-md text-white/70">
        O link pode ter mudado de lugar ou a página foi desativada. Mas o
        {" "}
        {settings.name} continua servindo — dá uma olhada no cardápio.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/cardapio"
          className="bg-[var(--brand-primary)] px-6 py-3 text-sm font-semibold text-white transition-all hover:brightness-110"
          style={{ borderRadius: "var(--button-radius)" }}
        >
          Ver o cardápio
        </Link>
        <Link
          href="/"
          className="border border-white/35 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
          style={{ borderRadius: "var(--button-radius)" }}
        >
          Voltar para o início
        </Link>
      </div>
    </div>
  );
}
