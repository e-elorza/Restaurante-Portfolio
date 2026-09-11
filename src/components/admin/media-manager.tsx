"use client";

import * as React from "react";
import Image from "next/image";
import { Check, Copy, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { MediaAsset, MediaSlot } from "@prisma/client";

import { AdminForm } from "@/components/admin/admin-form";
import { ImageField } from "@/components/admin/image-field";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/misc";
import { deleteMediaAssetAction, saveMediaSlotAction } from "@/server/actions/content";

/**
 * Cada "espaço de imagem" tem nome e explicação em linguagem simples —
 * o gerente troca a foto sem precisar saber onde ela é usada no código.
 */
export function MediaSlots({ slots }: { slots: MediaSlot[] }) {
  const groups = React.useMemo(() => {
    const map = new Map<string, MediaSlot[]>();
    for (const slot of slots) {
      const list = map.get(slot.group) ?? [];
      list.push(slot);
      map.set(slot.group, list);
    }
    return [...map.entries()];
  }, [slots]);

  return (
    <div className="space-y-10">
      {groups.map(([group, groupSlots]) => (
        <section key={group}>
          <h2 className="admin-section-title mb-3">{group}</h2>
          <div className="grid gap-4 lg:grid-cols-2">
            {groupSlots.map((slot) => (
              <SlotCard key={slot.key} slot={slot} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function SlotCard({ slot }: { slot: MediaSlot }) {
  return (
    <div className="admin-card p-4">
      <div className="mb-3 space-y-0.5">
        <h3 className="text-sm font-semibold text-foreground">{slot.name}</h3>
        <p className="admin-hint">{slot.description}</p>
      </div>

      <AdminForm
        action={saveMediaSlotAction}
        actionsVariant="inline"
        submitLabel="Salvar imagem"
      >
        <input type="hidden" name="key" value={slot.key} />
        <ImageField
          name="url"
          label={`Imagem: ${slot.name}`}
          recommended={slot.recommended}
          folder="site"
          aspect={slot.key.includes("logo") ? "wide" : "landscape"}
          defaultValue={slot.url ?? ""}
          altName="alt"
          altDefaultValue={slot.alt}
        />
      </AdminForm>
    </div>
  );
}

export function MediaLibrary({ assets }: { assets: MediaAsset[] }) {
  if (assets.length === 0) {
    return (
      <EmptyState
        title="Nenhuma imagem enviada ainda"
        description="Toda imagem que você enviar por qualquer tela do painel fica guardada aqui, pronta para ser reaproveitada."
      />
    );
  }

  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {assets.map((asset) => (
        <li key={asset.id} className="admin-card overflow-hidden">
          <div className="relative aspect-square bg-secondary">
            <Image
              src={asset.url}
              alt={asset.alt || asset.name}
              fill
              unoptimized
              sizes="(max-width: 640px) 50vw, 220px"
              className="object-cover"
            />
          </div>
          <div className="space-y-2 p-2">
            <p className="truncate text-xs font-medium" title={asset.name}>
              {asset.name}
            </p>
            <div className="flex items-center gap-1">
              <CopyUrlButton url={asset.url} />
              <ConfirmDialog
                title="Remover imagem da biblioteca"
                description={`A imagem “${asset.name}” sai da biblioteca. Se ela estiver em uso em alguma página, continuará aparecendo lá.`}
                confirmLabel="Remover"
                action={deleteMediaAssetAction}
                hiddenFields={{ id: asset.id }}
                trigger={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-destructive hover:bg-destructive/10"
                    title="Remover da biblioteca"
                  >
                    <Trash2 aria-hidden />
                  </Button>
                }
              />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

function CopyUrlButton({ url }: { url: string }) {
  const [copied, setCopied] = React.useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Endereço copiado.");
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Não foi possível copiar. Copie manualmente pelo navegador.");
    }
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="h-8 flex-1 justify-start px-2 text-xs"
      onClick={copy}
    >
      {copied ? <Check aria-hidden /> : <Copy aria-hidden />}
      {copied ? "Copiado" : "Copiar link"}
    </Button>
  );
}
