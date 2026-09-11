import { ExternalLink, Plus } from "lucide-react";

import { AddSectionDialog, HomeManager } from "@/components/admin/home-manager";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/misc";
import { getAdminHomeSections } from "@/lib/data/home";
import { getAdminCategories } from "@/lib/data/menu";
import { getEnabledPageKeys } from "@/lib/data/pages";
import type { HomeSectionType } from "@/lib/types";

export const metadata = { title: "Página inicial" };

export default async function AdminHomePage() {
  const [sections, categories, enabledPages] = await Promise.all([
    getAdminHomeSections(),
    getAdminCategories(),
    getEnabledPageKeys(),
  ]);

  const existingTypes = sections.map((section) => section.type as HomeSectionType);

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Página inicial"
        description="Monte a primeira página do site como um quebra-cabeça: adicione blocos, arraste para reordenar e edite o conteúdo de cada um."
      >
        <Button asChild variant="outline" size="sm">
          <a href="/" target="_blank" rel="noopener noreferrer">
            <ExternalLink aria-hidden />
            Ver resultado
          </a>
        </Button>
        <AddSectionDialog
          existingTypes={existingTypes}
          trigger={
            <Button>
              <Plus aria-hidden />
              Adicionar seção
            </Button>
          }
        />
      </PageHeader>

      <HomeManager
        sections={sections}
        categories={categories}
        enabledPages={[...enabledPages]}
      />
    </div>
  );
}
