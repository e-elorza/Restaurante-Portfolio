import { GeneralSettingsForm } from "@/components/admin/settings-forms";
import { PageHeader } from "@/components/ui/misc";
import { getRestaurantSettings } from "@/lib/data/settings";

export const metadata = { title: "Configurações" };

export default async function SettingsPage() {
  const settings = await getRestaurantSettings();

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Configurações gerais"
        description="Nome, contatos e as informações que aparecem em vários lugares do site."
      />
      <GeneralSettingsForm settings={settings} />
    </div>
  );
}
