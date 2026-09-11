import Link from "next/link";
import { Plus } from "lucide-react";

import {
  EventDialog,
  EventSettingsForm,
  EventsManager,
} from "@/components/admin/events-manager";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/misc";
import { getAdminEvents } from "@/lib/data/content";
import { isPageEnabled } from "@/lib/data/pages";
import { getEventSettings, getRestaurantSettings } from "@/lib/data/settings";

export const metadata = { title: "Eventos" };

export default async function AdminEventsPage() {
  const [events, settings, eventSettings, enabled] = await Promise.all([
    getAdminEvents(),
    getRestaurantSettings(),
    getEventSettings(),
    isPageEnabled("EVENTS"),
  ]);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <PageHeader
          title="Eventos"
          description="A agenda da casa: shows, festivais e noites temáticas."
        >
          <EventDialog
            trigger={
              <Button>
                <Plus aria-hidden />
                Novo evento
              </Button>
            }
          />
        </PageHeader>

        {!enabled ? (
          <p className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-900">
            A página Eventos está desligada, então a agenda não aparece no site.{" "}
            <Link href="/admin/paginas" className="font-semibold underline">
              Ligar a página
            </Link>
          </p>
        ) : null}

        <EventsManager events={events} locale={settings.locale} />
      </div>

      <section>
        <h2 className="admin-section-title mb-1">Configurações da agenda</h2>
        <p className="admin-hint mb-4">Como tratar os eventos que já aconteceram.</p>
        <EventSettingsForm settings={eventSettings} />
      </section>
    </div>
  );
}
