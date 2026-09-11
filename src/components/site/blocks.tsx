import * as React from "react";
import Image from "next/image";
import Link from "next/link";

import { cn, safeExternalUrl } from "@/lib/utils";
import { Reveal } from "@/components/site/motion";

/** Topo das páginas internas: imagem de capa, título e texto de apoio. */
export function PageHero({
  eyebrow,
  title,
  intro,
  imageUrl,
  children,
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  imageUrl?: string | null;
  children?: React.ReactNode;
}) {
  return (
    <section className="relative isolate overflow-hidden bg-[var(--brand-secondary)] pb-14 pt-28 text-white sm:pb-20 sm:pt-36 lg:pb-24 lg:pt-44">
      {imageUrl ? (
        <>
          <Image
            src={imageUrl}
            alt=""
            fill
            priority
            sizes="100vw"
            className="-z-10 object-cover"
          />
          <div
            aria-hidden
            className="-z-10 absolute inset-0 bg-gradient-to-b from-black/70 via-black/55 to-black/75"
          />
        </>
      ) : null}

      <div className="site-container">
        <Reveal className="max-w-3xl">
          {eyebrow ? (
            <p className="mb-3 text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-white/60">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="display-2 text-balance font-heading">{title}</h1>
          {intro ? (
            <p className="mt-4 max-w-2xl text-pretty text-base leading-relaxed text-white/75 sm:text-lg">
              {intro}
            </p>
          ) : null}
          {children ? <div className="mt-7">{children}</div> : null}
        </Reveal>
      </div>
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "left",
  className,
  action,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  className?: string;
  action?: React.ReactNode;
}) {
  if (!title && !subtitle) return null;

  return (
    <div
      className={cn(
        "mb-8 flex flex-col gap-4 sm:mb-10",
        align === "center"
          ? "items-center text-center"
          : "sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className={cn("space-y-2", align === "center" && "max-w-2xl")}>
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        {title ? (
          <h2 className="display-2 text-balance font-heading">{title}</h2>
        ) : null}
        {subtitle ? <p className="lead max-w-2xl text-pretty">{subtitle}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

type SiteButtonProps = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "outline" | "light";
  className?: string;
};

/** Botão do site público — usa o formato definido em Admin > Aparência. */
export function SiteButton({
  href,
  children,
  variant = "primary",
  className,
}: SiteButtonProps) {
  const classes = cn(
    variant === "primary" && "btn-primary",
    variant === "outline" && "btn-outline",
    variant === "light" && "btn-ghost-light",
    className,
  );

  const url = safeExternalUrl(href);
  const isInternal = url.startsWith("/");

  if (isInternal) {
    return (
      <Link href={url} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className={classes}>
      {children}
    </a>
  );
}

/** Faixa fina com um aviso ou destaque curto. */
export function Notice({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="rounded-[var(--card-radius)] border px-4 py-3 text-sm"
      style={{
        borderColor: "rgb(var(--brand-primary-rgb) / 0.25)",
        backgroundColor: "rgb(var(--brand-primary-rgb) / 0.06)",
      }}
    >
      {children}
    </p>
  );
}
