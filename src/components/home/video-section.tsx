"use client";

import * as React from "react";
import Image from "next/image";
import { Play } from "lucide-react";

import { cn } from "@/lib/utils";
import { embedUrl, parseVideoSource } from "@/lib/video";
import { SectionHeading } from "@/components/site/blocks";
import { Reveal } from "@/components/site/motion";
import type { VideoConfig } from "@/lib/types";

/**
 * Vídeo da página inicial.
 *
 * No celular o vídeo só é carregado depois que o visitante toca na capa —
 * isso evita gastar dados e trava de rolagem em conexões lentas.
 */
export function VideoSection({
  title,
  subtitle,
  config,
}: {
  title: string;
  subtitle: string;
  config: VideoConfig;
}) {
  const source = parseVideoSource(config.provider, config.url);
  const [playing, setPlaying] = React.useState(false);

  const hasVideo = source.kind !== "none";
  const poster = config.posterUrl;

  if (!hasVideo && !poster) return null;

  const shouldShowCover = Boolean(poster) && !playing && !(config.autoplay && !poster);

  return (
    <section className={cn("py-16 sm:py-20", config.fullWidth && "px-0")}>
      <div className={config.fullWidth ? "" : "site-container"}>
        {config.fullWidth ? (
          <div className="site-container">
            <SectionHeading title={title} subtitle={subtitle} align="center" />
          </div>
        ) : (
          <SectionHeading title={title} subtitle={subtitle} align="center" />
        )}

        <Reveal>
          <div
            className={cn(
              "relative aspect-video w-full overflow-hidden bg-black",
              config.fullWidth ? "rounded-none" : "rounded-[var(--card-radius)] shadow-card",
            )}
          >
            {shouldShowCover ? (
              <button
                type="button"
                onClick={() => setPlaying(true)}
                className="group absolute inset-0 h-full w-full"
                aria-label="Reproduzir vídeo"
                disabled={!hasVideo}
              >
                <Image
                  src={poster as string}
                  alt=""
                  fill
                  sizes="(max-width: 1024px) 100vw, 1200px"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <span
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-t from-black/55 to-black/10"
                />
                {hasVideo ? (
                  <span
                    aria-hidden
                    className="absolute left-1/2 top-1/2 flex size-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-stone-900 shadow-xl transition-transform duration-300 group-hover:scale-110 sm:size-20"
                  >
                    <Play className="ml-1 size-6 fill-current sm:size-7" />
                  </span>
                ) : null}
              </button>
            ) : hasVideo ? (
              source.kind === "file" ? (
                <video
                  className="h-full w-full object-cover"
                  src={source.src}
                  poster={poster || undefined}
                  autoPlay={config.autoplay || playing}
                  muted={config.muted}
                  loop={config.loop}
                  controls={config.controls}
                  playsInline
                  preload={config.autoplay ? "auto" : "metadata"}
                />
              ) : (
                <iframe
                  title={title || "Vídeo do restaurante"}
                  src={embedUrl(source, {
                    autoplay: config.autoplay || playing,
                    muted: config.muted,
                    loop: config.loop,
                    controls: config.controls,
                  })}
                  allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                  className="h-full w-full border-0"
                />
              )
            ) : null}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
