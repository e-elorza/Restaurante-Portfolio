"use client";

import * as React from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";
import { embedUrl, parseVideoSource } from "@/lib/video";
import { SiteButton } from "@/components/site/blocks";
import type { HeroConfig, SectionHeightValue } from "@/lib/types";

const HEIGHT_CLASS: Record<SectionHeightValue, string> = {
  COMPACT: "min-h-[58svh] sm:min-h-[60vh]",
  MEDIUM: "min-h-[70svh] sm:min-h-[72vh]",
  TALL: "min-h-[84svh] sm:min-h-[86vh]",
  FULLSCREEN: "min-h-[100svh]",
};

const ALIGN_CLASS = {
  LEFT: "items-start text-left",
  CENTER: "items-center text-center",
  RIGHT: "items-end text-right",
} as const;

export function HeroSection({
  title,
  subtitle,
  config,
}: {
  title: string;
  subtitle: string;
  config: HeroConfig;
}) {
  const reduced = useReducedMotion();
  const slides = config.slides ?? [];
  const isCarousel = config.mediaType === "CAROUSEL" && slides.length > 0;
  const [index, setIndex] = React.useState(0);

  React.useEffect(() => {
    if (!isCarousel || slides.length < 2 || reduced) return;
    const timer = window.setInterval(
      () => setIndex((value) => (value + 1) % slides.length),
      6500,
    );
    return () => window.clearInterval(timer);
  }, [isCarousel, reduced, slides.length]);

  const current = isCarousel ? slides[index] : null;
  const heading = current?.title || title;
  const support = current?.subtitle || subtitle;

  return (
    <section
      className={cn(
        "relative isolate flex w-full overflow-hidden bg-[var(--brand-secondary)] text-white",
        HEIGHT_CLASS[config.height] ?? HEIGHT_CLASS.TALL,
      )}
    >
      <HeroMedia config={config} slideIndex={index} />

      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-black"
        style={{ opacity: (config.overlay ?? 45) / 100 }}
      />
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 -z-10 h-1/2 bg-gradient-to-t from-black/65 to-transparent"
      />

      <div className="site-container relative flex w-full items-end pb-16 pt-28 sm:items-center sm:py-32">
        <div
          className={cn(
            "flex w-full flex-col gap-5",
            ALIGN_CLASS[config.align] ?? ALIGN_CLASS.CENTER,
          )}
        >
          <motion.div
            key={`${heading}-${index}`}
            initial={reduced ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "flex max-w-3xl flex-col gap-5",
              config.align === "CENTER" && "items-center",
              config.align === "RIGHT" && "items-end",
            )}
          >
            {heading ? (
              <h1 className="display-1 text-balance font-heading font-semibold drop-shadow-sm">
                {heading}
              </h1>
            ) : null}

            {support ? (
              <p className="max-w-xl text-pretty text-base leading-relaxed text-white/80 sm:text-lg">
                {support}
              </p>
            ) : null}

            {config.buttonEnabled && config.buttonLabel ? (
              <div className="pt-2">
                <SiteButton href={config.buttonUrl || "/cardapio"}>
                  {config.buttonLabel}
                </SiteButton>
              </div>
            ) : null}
          </motion.div>

          {isCarousel && slides.length > 1 ? (
            <div className="flex gap-2 pt-4" role="tablist" aria-label="Imagens do destaque">
              {slides.map((slide, slideIndex) => (
                <button
                  key={`${slide.imageUrl}-${slideIndex}`}
                  type="button"
                  role="tab"
                  aria-selected={slideIndex === index}
                  aria-label={`Ir para a imagem ${slideIndex + 1}`}
                  onClick={() => setIndex(slideIndex)}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    slideIndex === index ? "w-8 bg-white" : "w-3 bg-white/45 hover:bg-white/70",
                  )}
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function HeroMedia({ config, slideIndex }: { config: HeroConfig; slideIndex: number }) {
  const reduced = useReducedMotion();

  if (config.mediaType === "VIDEO") {
    const source = parseVideoSource(config.videoProvider, config.videoUrl);

    if (source.kind === "file") {
      return (
        <video
          className="absolute inset-0 -z-20 h-full w-full object-cover"
          src={source.src}
          poster={config.posterUrl || undefined}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden
        />
      );
    }

    if (source.kind !== "none") {
      return (
        <div className="absolute inset-0 -z-20 overflow-hidden" aria-hidden>
          <iframe
            title="Vídeo de destaque"
            src={embedUrl(source, {
              autoplay: true,
              muted: true,
              loop: true,
              controls: false,
            })}
            allow="autoplay; encrypted-media; picture-in-picture"
            className="absolute left-1/2 top-1/2 h-[calc(100%*1.8)] w-[calc(100%*1.8)] -translate-x-1/2 -translate-y-1/2 border-0 sm:h-[calc(100%*1.35)] sm:w-[calc(100%*1.35)]"
          />
        </div>
      );
    }
  }

  if (config.mediaType === "CAROUSEL" && config.slides?.length) {
    return (
      <div className="absolute inset-0 -z-20" aria-hidden>
        <AnimatePresence initial={false}>
          <motion.div
            key={slideIndex}
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduced ? undefined : { opacity: 0 }}
            transition={{ duration: 0.9, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <Image
              src={config.slides[slideIndex]?.imageUrl ?? config.slides[0].imageUrl}
              alt={config.slides[slideIndex]?.alt ?? ""}
              fill
              priority={slideIndex === 0}
              sizes="100vw"
              className="object-cover"
            />
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  const desktop = config.imageUrl;
  const mobile = config.imageMobileUrl || config.imageUrl;

  if (!desktop && !mobile) {
    return (
      <div
        aria-hidden
        className="absolute inset-0 -z-20 bg-gradient-to-br from-[var(--brand-secondary)] via-[var(--brand-secondary)] to-[var(--brand-primary)]"
      />
    );
  }

  return (
    <>
      {mobile ? (
        <Image
          src={mobile}
          alt={config.imageAlt || ""}
          fill
          priority
          sizes="100vw"
          className="-z-20 object-cover sm:hidden"
        />
      ) : null}
      {desktop ? (
        <Image
          src={desktop}
          alt={config.imageAlt || ""}
          fill
          priority
          sizes="100vw"
          className="-z-20 hidden object-cover sm:block"
        />
      ) : null}
    </>
  );
}
