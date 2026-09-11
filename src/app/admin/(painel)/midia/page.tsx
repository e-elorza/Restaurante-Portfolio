import { MediaLibrary, MediaSlots } from "@/components/admin/media-manager";
import { PageHeader } from "@/components/ui/misc";
import { getMediaLibrary, getMediaSlots } from "@/lib/data/content";
import { isBlobConfigured } from "@/lib/upload";

export const metadata = { title: "Mídia" };

export default async function MediaPage() {
  const [slots, assets] = await Promise.all([getMediaSlots(), getMediaLibrary()]);
  const blobReady = isBlobConfigured();

  return (
    <div className="mx-auto max-w-5xl space-y-10">
      <div>
        <PageHeader
          title="Mídia"
          description="Todas as imagens fixas do site em um lugar só. Cada espaço explica onde a imagem aparece."
        />

        {!blobReady ? (
          <p className="mb-6 rounded-md border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm leading-relaxed text-amber-900">
            O envio de arquivos ainda não foi configurado neste site. Você pode usar o
            botão <strong>“Usar um endereço”</strong> e colar o link de uma imagem já
            publicada. Para liberar o envio direto, configure a variável{" "}
            <code className="rounded bg-amber-100 px-1">BLOB_READ_WRITE_TOKEN</code> na
            Vercel.
          </p>
        ) : null}

        <MediaSlots slots={slots} />
      </div>

      <section>
        <h2 className="admin-section-title mb-1">Biblioteca de imagens</h2>
        <p className="admin-hint mb-4">
          Tudo o que você já enviou pelo painel. Copie o link para reaproveitar em
          qualquer campo de imagem.
        </p>
        <MediaLibrary assets={assets} />
      </section>
    </div>
  );
}
