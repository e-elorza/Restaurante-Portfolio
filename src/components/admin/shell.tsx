"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bike,
  CalendarDays,
  ExternalLink,
  Files,
  FolderTree,
  Home,
  Images,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  Palette,
  Search,
  Settings,
  Share2,
  UserRound,
  Users,
  UtensilsCrossed,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { ADMIN_NAV, type AdminNavGroup } from "@/components/admin/nav-items";
import { Button } from "@/components/ui/button";
import type { SessionPayload } from "@/lib/auth/session";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  UtensilsCrossed,
  FolderTree,
  Home,
  Files,
  Bike,
  CalendarDays,
  MapPin,
  Images,
  Palette,
  Search,
  Share2,
  Settings,
  UserRound,
  Users,
};

/** Esconde do menu o que o tipo de acesso da pessoa não permite abrir. */
function visibleNav(role: SessionPayload["role"]): AdminNavGroup[] {
  if (role === "ADMIN") return ADMIN_NAV;
  return ADMIN_NAV.map((group) => ({
    ...group,
    items: group.items.filter((item) => !item.adminOnly),
  })).filter((group) => group.items.length > 0);
}

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminShell({
  userName,
  role,
  logout,
  children,
}: {
  userName: string;
  role: SessionPayload["role"];
  logout: () => Promise<void>;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const nav = React.useMemo(() => visibleNav(role), [role]);
  const [open, setOpen] = React.useState(false);

  // Fecha o menu lateral ao navegar, sem efeito colateral em useEffect.
  const [lastPathname, setLastPathname] = React.useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setOpen(false);
  }

  const currentLabel = React.useMemo(() => {
    for (const group of nav) {
      for (const item of group.items) {
        if (isActive(pathname, item.href, item.exact)) return item.label;
      }
    }
    return "Painel";
  }, [nav, pathname]);

  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-[264px_1fr]">
      {/* Barra lateral (computador) */}
      <aside className="sticky top-0 hidden h-screen flex-col border-r border-border bg-card lg:flex">
        <SidebarContent nav={nav} pathname={pathname} />
      </aside>

      {/* Menu lateral (celular e tablet) */}
      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Fechar menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-stone-950/50"
          />
          <div className="absolute left-0 top-0 flex h-full w-72 flex-col border-r border-border bg-card shadow-2xl">
            <SidebarContent nav={nav} pathname={pathname} onClose={() => setOpen(false)} />
          </div>
        </div>
      ) : null}

      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-40 flex h-14 items-center justify-between gap-3 border-b border-border bg-background/90 px-4 backdrop-blur sm:px-6">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="inline-flex size-9 items-center justify-center rounded-md text-foreground transition-colors hover:bg-secondary lg:hidden"
              aria-label="Abrir menu do painel"
            >
              <Menu className="size-5" aria-hidden />
            </button>
            <span className="text-sm font-semibold text-foreground lg:hidden">
              {currentLabel}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <a href="/" target="_blank" rel="noopener noreferrer">
                <ExternalLink aria-hidden />
                <span className="hidden sm:inline">Visualizar site</span>
                <span className="sm:hidden">Site</span>
              </a>
            </Button>

            <span className="hidden text-sm text-subtle-foreground sm:inline">
              {userName}
            </span>

            <form action={logout}>
              <Button
                type="submit"
                variant="ghost"
                size="icon"
                aria-label="Sair do painel"
                title="Sair do painel"
              >
                <LogOut aria-hidden />
              </Button>
            </form>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}

function SidebarContent({
  nav,
  pathname,
  onClose,
}: {
  nav: AdminNavGroup[];
  pathname: string;
  onClose?: () => void;
}) {
  return (
    <>
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-border px-4">
        <Link href="/admin" className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
            B
          </span>
          <span className="text-sm font-semibold text-foreground">Painel do site</span>
        </Link>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar menu"
            className="inline-flex size-8 items-center justify-center rounded-md text-subtle-foreground hover:bg-secondary"
          >
            <X className="size-4" aria-hidden />
          </button>
        ) : null}
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5" aria-label="Menu do painel">
        {nav.map((group) => (
          <div key={group.title ?? "inicio"}>
            {group.title ? (
              <p className="px-2 pb-2 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-subtle-foreground">
                {group.title}
              </p>
            ) : null}
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = ICONS[item.icon] ?? LayoutDashboard;
                const active = isActive(pathname, item.href, item.exact);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      title={item.description}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors",
                        active
                          ? "bg-primary/10 text-primary"
                          : "text-foreground hover:bg-secondary",
                      )}
                    >
                      <Icon className="size-4 shrink-0" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </>
  );
}
