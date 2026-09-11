"use client";

import * as React from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

/**
 * Janela com um formulário dentro. Usada para criar/editar itens simples
 * (categorias, canais de delivery, eventos, unidades) sem sair da listagem.
 */
export function FormDialog({
  trigger,
  title,
  description,
  children,
  className,
}: {
  trigger: React.ReactNode;
  title: string;
  description?: string;
  children: (close: () => void) => React.ReactNode;
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const close = React.useCallback(() => setOpen(false), []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        className={className ?? "max-h-[90svh] max-w-xl overflow-y-auto"}
      >
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">{title}</DialogTitle>
          {description ? (
            <DialogDescription className="text-sm text-subtle-foreground">
              {description}
            </DialogDescription>
          ) : null}
        </DialogHeader>
        {open ? children(close) : null}
      </DialogContent>
    </Dialog>
  );
}
