"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Menu, X } from "lucide-react";

import { cn } from "@/lib/utils";
import type { NavigationItem } from "@/lib/types";

type SiteHeaderProps = {
  navigation: NavigationItem[];
  restaurantName: string;
  logoUrl: string | null;
  showLogoText: boolean;
  transparentOnTop: boolean;
  sticky: boolean;
  cta: { label: string; url: string } | null;
};

export function SiteHeader({
  navigation,
  restaurantName,
  logoUrl,
  showLogoText,
  transparentOnTop,
  sticky,
  cta,
}: SiteHeaderProps) {
  const pathname = usePathname();
  const reduced = useReducedMotion();
  const [scrolled, setScrolled] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Fecha o menu do celular ao navegar (ajuste de estado durante a
  // renderização, o padrão recomendado pelo React para reagir a props).
  const [lastPathname, setLastPathname] = React.useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setOpen(false);
  }

  // Impede o scroll do fundo enquanto o menu está aberto.
  React.useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const solid = !transparentOnTop || scrolled || open;

  return (
    <header
      className={cn(
        // O cabeçalho flutua sobre a imagem de topo das páginas; ao rolar,
        // ganha fundo sólido para manter o contraste do texto.
        "left-0 right-0 top-0 z-50 w-full transition-all duration-300",
        sticky ? "fixed" : "absolute",
        solid
          ? "bg-[var(--brand-secondary)] shadow-[0_10px_30px_-20px_rgba(0,0,0,0.8)]"
          : "bg-transparent",
      )}
    >
      <div className="site-container">
        <div
          className={cn(
            "flex items-center justify-between gap-6 transition-all duration-300",
            solid ? "h-16" : "h-20 lg:h-24",
          )}
        >
          <Link
            href="/"
            className="flex items-center gap-3 text-white"
            aria-label={`${restaurantName} — página inicial`}
          >
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt={restaurantName}
                width={220}
                height={64}
                unoptimized
                priority
                className={cn("w-auto transition-all", solid ? "h-8" : "h-9 lg:h-11")}
              />
            ) : null}
            {(!logoUrl || showLogoText) && (
              <span
                className={cn(
                  "font-heading font-semibold tracking-tight transition-all",
                  logoUrl ? "sr-only" : solid ? "text-lg" : "text-xl lg:text-2xl",
                )}
              >
                {restaurantName}
              </span>
            )}
          </Link>

          <nav
            aria-label="Menu principal"
            className="hidden items-center gap-7 lg:flex"
          >
            {navigation.map((item) => (
              <Link
                key={item.key}
                href={item.path}
                data-active={isActive(pathname, item.path)}
                className="nav-link text-white/85 hover:text-white data-[active=true]:text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {cta ? (
              <a
                href={cta.url}
                target={cta.url.startsWith("http") ? "_blank" : undefined}
                rel={cta.url.startsWith("http") ? "noopener noreferrer" : undefined}
                className="hidden bg-[var(--brand-primary)] px-5 py-2.5 text-sm font-semibold text-white transition-all hover:brightness-110 sm:inline-flex"
                style={{ borderRadius: "var(--button-radius)" }}
              >
                {cta.label}
              </a>
            ) : null}

            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              aria-controls="menu-mobile"
              className="inline-flex size-10 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10 lg:hidden"
            >
              <span className="sr-only">{open ? "Fechar menu" : "Abrir menu"}</span>
              {open ? (
                <X className="size-5" aria-hidden />
              ) : (
                <Menu className="size-5" aria-hidden />
              )}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            id="menu-mobile"
            initial={reduced ? false : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={reduced ? undefined : { opacity: 0, height: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden bg-[var(--brand-secondary)] lg:hidden"
          >
            <nav
              aria-label="Menu principal (celular)"
              className="site-container flex flex-col gap-1 pb-6 pt-2"
            >
              {navigation.map((item, index) => (
                <motion.div
                  key={item.key}
                  initial={reduced ? false : { opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.04 * index, duration: 0.3 }}
                >
                  <Link
                    href={item.path}
                    className={cn(
                      "block border-b border-white/10 py-3.5 font-heading text-2xl text-white/85 transition-colors hover:text-white",
                      isActive(pathname, item.path) && "text-white",
                    )}
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
              {cta ? (
                <a
                  href={cta.url}
                  target={cta.url.startsWith("http") ? "_blank" : undefined}
                  rel={cta.url.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="mt-4 inline-flex items-center justify-center bg-[var(--brand-primary)] px-5 py-3 text-sm font-semibold text-white sm:hidden"
                  style={{ borderRadius: "var(--button-radius)" }}
                >
                  {cta.label}
                </a>
              ) : null}
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}

function isActive(pathname: string, path: string): boolean {
  if (path === "/") return pathname === "/";
  return pathname === path || pathname.startsWith(`${path}/`);
}
