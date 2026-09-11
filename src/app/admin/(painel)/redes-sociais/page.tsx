import { SocialLinksForm } from "@/components/admin/settings-forms";
import { PageHeader } from "@/components/ui/misc";
import { getAllSocialLinks } from "@/lib/data/settings";

export const metadata = { title: "Redes sociais" };

export default async function SocialPage() {
  const links = await getAllSocialLinks();

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Redes sociais"
        description="Ligue as redes que o restaurante usa e cole o endereço de cada perfil."
      />
      <SocialLinksForm links={links} />
    </div>
  );
}
