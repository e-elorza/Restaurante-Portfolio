import Link from "next/link";
import { Plus } from "lucide-react";

import { LocationDialog, LocationsManager } from "@/components/admin/locations-manager";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/misc";
import { getAdminLocations } from "@/lib/data/content";
import { isPageEnabled } from "@/lib/data/pages";

export const metadata = { title: "Unidades" };

export default async function AdminLocationsPage() {
  const [locations, enabled] = await Promise.all([
    getAdminLocations(),
    isPageEnabled("LOCATIONS"),
  ]);

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Unidades"
        description="Endereços, horários e contatos de cada loja. Arraste para mudar a ordem."
      >
        <LocationDialog
          trigger={
            <Button>
              <Plus aria-hidden />
              Nova unidade
            </Button>
          }
        />
      </PageHeader>

      {!enabled ? (
        <p className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-900">
          A página Unidades está desligada, então estas unidades não aparecem no site.{" "}
          <Link href="/admin/paginas" className="font-semibold underline">
            Ligar a página
          </Link>
        </p>
      ) : null}

      <LocationsManager locations={locations} />
    </div>
  );
}
