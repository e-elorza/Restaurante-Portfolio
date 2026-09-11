import "server-only";

import { put } from "@vercel/blob";

import {
  ACCEPTED_IMAGE_TYPES,
  ACCEPTED_VIDEO_TYPES,
  uploadMaxBytes,
} from "@/lib/constants";
import { slugify } from "@/lib/utils";

export type UploadKind = "image" | "video";

export type UploadResult = {
  url: string;
  pathname: string;
  mimeType: string;
  sizeBytes: number;
};

export class UploadError extends Error {}

export function isBlobConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

function acceptedTypes(kind: UploadKind): string[] {
  return kind === "video" ? ACCEPTED_VIDEO_TYPES : ACCEPTED_IMAGE_TYPES;
}

export function validateUpload(file: File, kind: UploadKind): void {
  const allowed = acceptedTypes(kind);
  if (!allowed.includes(file.type)) {
    throw new UploadError(
      kind === "video"
        ? "Formato de vídeo não aceito. Envie um arquivo MP4 ou WebM."
        : "Formato de imagem não aceito. Envie um arquivo JPG, PNG, WebP, AVIF, GIF ou SVG.",
    );
  }
  const max = uploadMaxBytes();
  if (file.size > max) {
    throw new UploadError(
      `Arquivo muito grande (${(file.size / 1024 / 1024).toFixed(1)} MB). O limite é de ${(
        max /
        1024 /
        1024
      ).toFixed(0)} MB.`,
    );
  }
  if (file.size === 0) {
    throw new UploadError("O arquivo enviado está vazio.");
  }
}

/**
 * Envia o arquivo para o Vercel Blob.
 *
 * O projeto roda em ambiente serverless, portanto nada é gravado no disco
 * local. Sem o token configurado o painel continua utilizável: o administrador
 * pode colar a URL de uma imagem hospedada em outro serviço.
 */
export async function uploadToBlob(
  file: File,
  folder: string,
  kind: UploadKind = "image",
): Promise<UploadResult> {
  validateUpload(file, kind);

  if (!isBlobConfigured()) {
    throw new UploadError(
      "O envio de arquivos ainda não está configurado. Peça para configurar a variável BLOB_READ_WRITE_TOKEN na Vercel — enquanto isso, você pode colar o endereço de uma imagem já hospedada.",
    );
  }

  const extension = file.name.includes(".") ? file.name.split(".").pop() : undefined;
  const base = slugify(file.name.replace(/\.[^.]+$/, "")) || "arquivo";
  const safeFolder = slugify(folder) || "geral";
  const pathname = `${safeFolder}/${base}-${Date.now()}${extension ? `.${extension}` : ""}`;

  const blob = await put(pathname, file, {
    access: "public",
    contentType: file.type,
    addRandomSuffix: false,
  });

  return {
    url: blob.url,
    pathname: blob.pathname,
    mimeType: file.type,
    sizeBytes: file.size,
  };
}
