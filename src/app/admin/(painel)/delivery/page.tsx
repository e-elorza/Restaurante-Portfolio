import Link from "next/link";
import { Plus } from "lucide-react";

import { DeliveryDialog, DeliveryManager } from "@/components/admin/delivery-manager";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/misc";
import { getAdminDeliveryOptions } from "@/lib/data/content";
import { isPageEnabled } from "@/lib/data/pages";

export const metadata = { title: "Delivery" };

export default async function AdminDeliveryPage() {
  const [options, enabled] = await Promise.all([
    getAdminDeliveryOptions(),
    isPageEnabled("DELIVERY"),
  ]);

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Delivery"
        description="Os canais em que o cliente pode fazer o pedido. Arraste para mudar a ordem."
      >
        <DeliveryDialog
          trigger={
            <Button>
              <Plus aria-hidden />
              Novo canal
            </Button>
          }
        />
      </PageHeader>

      {!enabled ? (
        <p className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-900">
          A página Delivery está desligada, então estes canais não aparecem no site.{" "}
          <Link href="/admin/paginas" className="font-semibold underline">
            Ligar a página
          </Link>
        </p>
      ) : null}

      <DeliveryManager options={options} />
    </div>
  );
}
