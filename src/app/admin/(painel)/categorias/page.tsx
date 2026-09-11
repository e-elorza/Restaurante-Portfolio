import { Plus } from "lucide-react";

import {
  CategoryDialog,
  CategoryManager,
} from "@/components/admin/category-manager";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/misc";
import { getAdminCategories } from "@/lib/data/menu";

export const metadata = { title: "Categorias" };

export default async function CategoriesPage() {
  const categories = await getAdminCategories();

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Categorias"
        description="As seções do seu cardápio. Arraste pela alça à esquerda para mudar a ordem em que aparecem no site."
      >
        <CategoryDialog
          trigger={
            <Button>
              <Plus aria-hidden />
              Nova categoria
            </Button>
          }
        />
      </PageHeader>

      <CategoryManager categories={categories} />
    </div>
  );
}
