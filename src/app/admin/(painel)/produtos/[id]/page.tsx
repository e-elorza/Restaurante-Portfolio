import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";

import { ProductForm } from "@/components/admin/product-form";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/misc";
import { getAdminCategories, getAdminProduct } from "@/lib/data/menu";
import { getRestaurantSettings } from "@/lib/data/settings";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const product = await getAdminProduct(id);
  return { title: product ? product.name : "Produto" };
}

export default async function EditProductPage({ params }: PageProps) {
  const { id } = await params;
  const [product, categories, settings] = await Promise.all([
    getAdminProduct(id),
    getAdminCategories(),
    getRestaurantSettings(),
  ]);

  if (!product) notFound();

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title={product.name}
        description="Edite as informações deste item do cardápio."
      >
        <Button asChild variant="outline" size="sm">
          <a
            href={`/cardapio/${product.slug}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink aria-hidden />
            Ver no site
          </a>
        </Button>
        <Button asChild variant="ghost" size="sm">
          <Link href="/admin/produtos">Voltar</Link>
        </Button>
      </PageHeader>

      <ProductForm
        product={product}
        categories={categories}
        currencyLabel={settings.currency}
      />
    </div>
  );
}
