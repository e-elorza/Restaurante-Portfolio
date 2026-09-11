"use client";

import * as React from "react";
import Image from "next/image";
import { ImagePlus, Link2, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/form";

/**
 * Campo de imagem do painel.
 *
 * O gerente pode enviar um arquivo (vai para o Vercel Blob) ou colar o
 * endereço de uma imagem que já está na internet. Sempre mostra a prévia e o
 * tamanho recomendado.
 */
export function ImageField({
  name,
  label,
  hint,
  recommended,
  defaultValue,
  folder = "geral",
  altName,
  altLabel = "Texto alternativo (acessibilidade)",
  altDefaultValue,
  aspect = "landscape",
  error,
}: {
  name: string;
  label: string;
  hint?: string;
  recommended?: string;
  defaultValue?: string | null;
  folder?: string;
  altName?: string;
  altLabel?: string;
  altDefaultValue?: string | null;
  aspect?: "landscape" | "square" | "portrait" | "wide";
  error?: string[];
}) {
  const [value, setValue] = React.useState(defaultValue ?? "");
  const [uploading, setUploading] = React.useState(false);
  const [showUrl, setShowUrl] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const id = React.useId();

  async function handleFile(file: File) {
    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      body.append("folder", folder);
      body.append("name", file.name);

      const response = await fetch("/api/upload", { method: "POST", body });
      const data = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !data.url) {
        toast.error(data.error ?? "Não foi possível enviar a imagem.");
        setShowUrl(true);
        return;
      }

      setValue(data.url);
      toast.success("Imagem enviada com sucesso.");
    } catch {
      toast.error("Não foi possível enviar a imagem. Verifique sua conexão.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const aspectClass = {
    landscape: "aspect-[4/3]",
    square: "aspect-square",
    portrait: "aspect-[3/4]",
    wide: "aspect-[21/9]",
  }[aspect];

  return (
    <div className="space-y-2">
      <Field label={label} htmlFor={id} hint={hint} error={error}>
        <div className="space-y-3">
          <input type="hidden" name={name} value={value} />

          <div
            className={cn(
              "relative w-full max-w-md overflow-hidden rounded-lg border border-dashed border-border bg-secondary/60",
              aspectClass,
            )}
          >
            {value ? (
              <Image
                src={value}
                alt=""
                fill
                unoptimized
                sizes="(max-width: 640px) 100vw, 420px"
                className="object-contain"
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-subtle-foreground">
                <ImagePlus className="size-6" aria-hidden />
                <span className="text-xs">Nenhuma imagem escolhida</span>
              </div>
            )}

            {uploading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-white/70">
                <Loader2 className="size-6 animate-spin text-primary" aria-hidden />
              </div>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              id={id}
              ref={inputRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void handleFile(file);
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
            >
              <ImagePlus aria-hidden />
              {value ? "Trocar imagem" : "Enviar imagem"}
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowUrl((current) => !current)}
            >
              <Link2 aria-hidden />
              Usar um endereço
            </Button>

            {value ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-destructive hover:bg-destructive/10"
                onClick={() => setValue("")}
              >
                <Trash2 aria-hidden />
                Remover
              </Button>
            ) : null}
          </div>

          {recommended ? (
            <p className="admin-hint">Tamanho recomendado: {recommended}</p>
          ) : null}

          {showUrl ? (
            <Input
              type="url"
              inputMode="url"
              value={value}
              placeholder="https://..."
              aria-label={`Endereço da imagem: ${label}`}
              onChange={(event) => setValue(event.target.value)}
            />
          ) : null}
        </div>
      </Field>

      {altName ? (
        <Field
          label={altLabel}
          htmlFor={`${id}-alt`}
          hint="Descreva a imagem em poucas palavras. Ajuda quem usa leitor de tela e também o Google."
        >
          <Input
            id={`${id}-alt`}
            name={altName}
            defaultValue={altDefaultValue ?? ""}
            placeholder="Ex.: hambúrguer com queijo derretido"
          />
        </Field>
      ) : null}
    </div>
  );
}
