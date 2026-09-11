import { PageSettingsList, PagesToggles } from "@/components/admin/pages-manager";
import { PageHeader } from "@/components/ui/misc";
import { getPages } from "@/lib/data/pages";

export const metadata = { title: "Páginas" };

export default async function AdminPagesPage() {
  const pages = await getPages();

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <PageHeader
          title="Páginas do site"
          description="Escolha quais páginas ficam no ar. Início e Cardápio são obrigatórias; as outras você liga e desliga quando quiser."
        />
        <PagesToggles pages={pages} />
      </div>

      <section>
        <h2 className="admin-section-title mb-1">Textos de cada página</h2>
        <p className="admin-hint mb-4">
          Título, texto de apresentação e as informações que aparecem no Google.
        </p>
        <PageSettingsList pages={pages} />
      </section>
    </div>
  );
}
