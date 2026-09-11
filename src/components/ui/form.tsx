"use client";

import * as React from "react";
import { useFormStatus } from "react-dom";
import { Info, Loader2 } from "lucide-react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import * as SwitchPrimitive from "@radix-ui/react-switch";

import { cn } from "@/lib/utils";
import { Button, type ButtonProps } from "@/components/ui/button";

/**
 * Blocos de formulário do painel.
 *
 * Cada campo tem rótulo em linguagem simples, texto de ajuda opcional e área
 * de erro — a ideia é que um gerente de restaurante entenda o que está
 * preenchendo sem precisar de treinamento.
 */

export function Field({
  label,
  htmlFor,
  hint,
  tooltip,
  error,
  required,
  className,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  tooltip?: string;
  error?: string[] | string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const message = Array.isArray(error) ? error[0] : error;
  const hintId = hint ? `${htmlFor}-hint` : undefined;
  const errorId = message ? `${htmlFor}-error` : undefined;

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center gap-1.5">
        <label htmlFor={htmlFor} className="admin-label">
          {label}
          {required ? <span className="ml-0.5 text-destructive">*</span> : null}
        </label>
        {tooltip ? <FieldTooltip text={tooltip} /> : null}
      </div>
      {hint ? (
        <p id={hintId} className="admin-hint">
          {hint}
        </p>
      ) : null}
      <div
        aria-describedby={cn(hintId, errorId) || undefined}
        aria-invalid={message ? true : undefined}
      >
        {children}
      </div>
      {message ? (
        <p id={errorId} role="alert" className="text-xs font-medium text-destructive">
          {message}
        </p>
      ) : null}
    </div>
  );
}

export function FieldTooltip({ text }: { text: string }) {
  return (
    <TooltipPrimitive.Provider delayDuration={150}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>
          <button
            type="button"
            aria-label={`Ajuda: ${text}`}
            className="text-subtle-foreground transition-colors hover:text-foreground"
          >
            <Info className="size-3.5" aria-hidden />
          </button>
        </TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            sideOffset={6}
            className="z-50 max-w-64 rounded-md bg-foreground px-3 py-2 text-xs leading-relaxed text-background shadow-lg"
          >
            {text}
            <TooltipPrimitive.Arrow className="fill-foreground" />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input ref={ref} className={cn("admin-input", className)} {...props} />
));
Input.displayName = "Input";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, rows = 4, ...props }, ref) => (
  <textarea
    ref={ref}
    rows={rows}
    className={cn("admin-input resize-y", className)}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <select ref={ref} className={cn("admin-input pr-8", className)} {...props}>
    {children}
  </select>
));
Select.displayName = "Select";

/**
 * Interruptor "liga/desliga". Mantém um input escondido para que o valor
 * chegue ao Server Action junto com o resto do formulário.
 */
export function SwitchField({
  name,
  label,
  hint,
  defaultChecked,
  checked,
  onCheckedChange,
  disabled,
  className,
}: {
  name?: string;
  label: string;
  hint?: string;
  defaultChecked?: boolean;
  checked?: boolean;
  onCheckedChange?: (value: boolean) => void;
  disabled?: boolean;
  className?: string;
}) {
  const [internal, setInternal] = React.useState(defaultChecked ?? false);
  const isControlled = checked !== undefined;
  const value = isControlled ? checked : internal;
  const id = React.useId();

  return (
    <div
      className={cn(
        "flex items-start justify-between gap-4 rounded-md border border-border bg-white px-3 py-2.5",
        disabled && "opacity-60",
        className,
      )}
    >
      <div className="space-y-0.5">
        <label htmlFor={id} className="admin-label cursor-pointer">
          {label}
        </label>
        {hint ? <p className="admin-hint">{hint}</p> : null}
      </div>
      {name ? <input type="hidden" name={name} value={value ? "on" : "false"} /> : null}
      <SwitchPrimitive.Root
        id={id}
        checked={value}
        disabled={disabled}
        onCheckedChange={(next) => {
          if (!isControlled) setInternal(next);
          onCheckedChange?.(next);
        }}
        className="peer mt-0.5 inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed data-[state=checked]:bg-primary data-[state=unchecked]:bg-input"
      >
        <SwitchPrimitive.Thumb className="pointer-events-none block size-5 rounded-full bg-white shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0" />
      </SwitchPrimitive.Root>
    </div>
  );
}

/** Botão de envio que mostra o estado de carregamento automaticamente. */
export function SubmitButton({
  children,
  loadingLabel = "Salvando...",
  ...props
}: ButtonProps & { loadingLabel?: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} {...props}>
      {pending ? (
        <>
          <Loader2 className="animate-spin" aria-hidden />
          {loadingLabel}
        </>
      ) : (
        children
      )}
    </Button>
  );
}

/** Barra fixa com o botão "Salvar alterações". */
export function FormActions({
  children,
  description,
}: {
  children: React.ReactNode;
  description?: string;
}) {
  return (
    <div className="sticky bottom-0 z-10 -mx-4 mt-8 flex flex-col gap-3 border-t border-border bg-background/85 px-4 py-3 backdrop-blur sm:mx-0 sm:flex-row sm:items-center sm:justify-between sm:rounded-lg sm:border sm:px-4">
      <p className="admin-hint">{description ?? "As alterações aparecem no site assim que você salvar."}</p>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  );
}

export function FieldGroup({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("admin-card p-4 sm:p-5", className)}>
      <div className="mb-4 space-y-1">
        <h2 className="admin-section-title">{title}</h2>
        {description ? <p className="admin-hint">{description}</p> : null}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}
