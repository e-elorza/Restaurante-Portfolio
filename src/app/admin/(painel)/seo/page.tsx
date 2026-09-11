import { SeoForm } from "@/components/admin/settings-forms";
import { PageHeader } from "@/components/ui/misc";
import { getSeoSettings } from "@/lib/data/settings";

export const metadata = { title: "SEO" };

export default async function SeoPage() {
  const seo = await getSeoSettings();

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="SEO"
        description="Como o site se apresenta no Google e nas redes sociais. Cada página também pode ter o seu próprio texto em Site > Páginas."
      />
      <SeoForm seo={seo} />
    </div>
  );
}
