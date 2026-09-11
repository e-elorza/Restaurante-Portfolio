import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UploadError, uploadToBlob } from "@/lib/upload";
import { logActivity } from "@/lib/activity";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Recebe o arquivo enviado pelo painel e devolve a URL pública.
 * Protegida por sessão — nunca aceita uploads anônimos.
 */
export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { error: "Sua sessão expirou. Entre novamente para enviar arquivos." },
      { status: 401 },
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Envio inválido." }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Nenhum arquivo foi enviado." }, { status: 400 });
  }

  const folder = String(formData.get("folder") ?? "geral");
  const kind = formData.get("kind") === "video" ? "video" : "image";
  const name = String(formData.get("name") ?? file.name).slice(0, 120);

  try {
    const result = await uploadToBlob(file, folder, kind);

    if (kind === "image") {
      await prisma.mediaAsset
        .create({
          data: {
            name,
            url: result.url,
            pathname: result.pathname,
            mimeType: result.mimeType,
            sizeBytes: result.sizeBytes,
          },
        })
        .catch(() => null);
    }

    await logActivity({
      userId: session.userId,
      action: "upload",
      entity: "media_asset",
      message: `Arquivo "${name}" enviado`,
    });

    return NextResponse.json({ url: result.url, pathname: result.pathname });
  } catch (error) {
    if (error instanceof UploadError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("[upload]", error);
    return NextResponse.json(
      { error: "Não foi possível enviar o arquivo. Tente novamente." },
      { status: 500 },
    );
  }
}
