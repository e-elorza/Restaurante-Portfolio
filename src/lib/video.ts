import type { VideoProviderValue } from "@/lib/types";

export type VideoSource =
  | { kind: "file"; src: string }
  | { kind: "youtube"; id: string }
  | { kind: "vimeo"; id: string }
  | { kind: "none" };

/** Extrai o identificador do vídeo a partir das formas mais comuns de URL. */
export function parseVideoSource(
  provider: VideoProviderValue,
  url: string,
): VideoSource {
  const value = (url ?? "").trim();
  if (!value) return { kind: "none" };

  if (provider === "UPLOAD") {
    return /^(https?:\/\/|\/)/i.test(value) ? { kind: "file", src: value } : { kind: "none" };
  }

  if (provider === "YOUTUBE") {
    const id =
      value.match(/(?:youtu\.be\/|v=|\/embed\/|\/shorts\/)([A-Za-z0-9_-]{6,})/)?.[1] ??
      (/^[A-Za-z0-9_-]{6,}$/.test(value) ? value : null);
    return id ? { kind: "youtube", id } : { kind: "none" };
  }

  const id =
    value.match(/vimeo\.com\/(?:video\/)?(\d+)/)?.[1] ??
    (/^\d+$/.test(value) ? value : null);
  return id ? { kind: "vimeo", id } : { kind: "none" };
}

export type EmbedOptions = {
  autoplay: boolean;
  muted: boolean;
  loop: boolean;
  controls: boolean;
};

/** Monta a URL do player com as opções escolhidas no painel. */
export function embedUrl(source: VideoSource, options: EmbedOptions): string {
  if (source.kind === "youtube") {
    const params = new URLSearchParams({
      autoplay: options.autoplay ? "1" : "0",
      mute: options.muted ? "1" : "0",
      controls: options.controls ? "1" : "0",
      loop: options.loop ? "1" : "0",
      playsinline: "1",
      rel: "0",
      modestbranding: "1",
    });
    if (options.loop) params.set("playlist", source.id);
    return `https://www.youtube-nocookie.com/embed/${source.id}?${params.toString()}`;
  }

  if (source.kind === "vimeo") {
    const params = new URLSearchParams({
      autoplay: options.autoplay ? "1" : "0",
      muted: options.muted ? "1" : "0",
      loop: options.loop ? "1" : "0",
      controls: options.controls ? "1" : "0",
      dnt: "1",
    });
    return `https://player.vimeo.com/video/${source.id}?${params.toString()}`;
  }

  return "";
}
