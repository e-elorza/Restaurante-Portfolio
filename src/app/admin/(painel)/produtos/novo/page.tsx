import { ProductForm } from "@/components/admin/product-form";
import { PageHeader } from "@/components/ui/misc";
import { getAdminCategories } from "@/lib/data/menu";
import { getRestaurantSettings } from "@/lib/data/settings";

export const metadata = { title: "Novo produto" };

export default async function NewProductPage() {
  const [categories, settings] = await Promise.all([
    getAdminCategories(),
    getRestaurantSettings(),
  ]);

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Novo produto"
        description="Preencha o nome e o preço para começar. O resto você pode completar depois."
      />
      <ProductForm
        product={null}
        categories={categories}
        currencyLabel={settings.currency}
      />
    </div>
  );
}
