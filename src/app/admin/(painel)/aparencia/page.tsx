import { ExternalLink } from "lucide-react";

import { AppearanceForm } from "@/components/admin/appearance-form";
import { FooterForm, HeaderForm } from "@/components/admin/header-footer-forms";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/misc";
import {
  getAppearance,
  getFooterSettings,
  getHeaderSettings,
} from "@/lib/data/settings";

export const metadata = { title: "Aparência" };

export default async function AppearancePage() {
  const [appearance, header, footer] = await Promise.all([
    getAppearance(),
    getHeaderSettings(),
    getFooterSettings(),
  ]);

  return (
    <div className="mx-auto max-w-5xl space-y-10">
      <div>
        <PageHeader
          title="Aparência"
          description="Cores, fontes e formatos do site. Tudo muda de uma vez, em todas as páginas."
        >
          <Button asChild variant="outline" size="sm">
            <a href="/" target="_blank" rel="noopener noreferrer">
              <ExternalLink aria-hidden />
              Ver site
            </a>
          </Button>
        </PageHeader>

        <AppearanceForm appearance={appearance} />
      </div>

      <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
        <HeaderForm header={header} />
        <FooterForm footer={footer} />
      </div>
    </div>
  );
}
