import Link from "next/link";
import type { ReactNode, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export const formTextareaClassName = cn(
  "w-full min-h-[100px] resize-y rounded-lg border border-border bg-surface-2/50 px-3 py-2.5 text-sm text-text",
  "placeholder:text-muted/80 transition-colors",
  "hover:border-border/80 focus-visible:border-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/25"
);

/** Grid principal: campos a la izquierda, panel de imagen fijo a la derecha en desktop. */
export const formPageGridClass =
  "grid w-full gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(300px,400px)] lg:items-start";

/** Columna de campos de texto (ancho contenido, no full-bleed en inputs). */
export const formFieldsStackClass = "flex min-w-0 flex-col gap-6";

/** Subgrupo con titulo dentro de una FormSection. */
export function FormSubsection({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-4 border-t border-border/60 pt-6", className)}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">{title}</p>
      {children}
    </div>
  );
}

export const formFieldWidthClass = {
  sm: "max-w-xs w-full",
  md: "max-w-md w-full",
  lg: "max-w-lg w-full",
  full: "w-full",
} as const;

type DashboardFormProps = {
  children: ReactNode;
  className?: string;
  onSubmit?: React.FormEventHandler<HTMLFormElement>;
};

export function DashboardForm({ children, className, onSubmit }: DashboardFormProps) {
  return (
    <form onSubmit={onSubmit} className={cn("w-full space-y-6", className)}>
      {children}
    </form>
  );
}

type FormBodyProps = {
  children: ReactNode;
  className?: string;
};

/** Agrupa secciones en columna estrecha (ordenes, perfiles). */
export function FormBody({ children, className }: FormBodyProps) {
  return (
    <div className={cn("w-full max-w-2xl space-y-6", className)}>{children}</div>
  );
}

type FormSectionProps = {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
};

export function FormSection({
  title,
  description,
  children,
  className,
  contentClassName,
}: FormSectionProps) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-xl border border-border bg-surface shadow-sm",
        className
      )}
    >
      <header className="border-b border-border/60 bg-surface-2/30 px-5 py-4 sm:px-6">
        <h2 className="text-sm font-semibold tracking-tight text-text">{title}</h2>
        {description ? (
          <p className="mt-1 text-xs leading-relaxed text-muted">{description}</p>
        ) : null}
      </header>
      <div className={cn("space-y-5 p-5 sm:p-6", contentClassName)}>{children}</div>
    </section>
  );
}

type FormFieldProps = {
  label: string;
  htmlFor?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
  /** Limita el ancho del control para mejor lectura en pantallas anchas. */
  size?: keyof typeof formFieldWidthClass;
};

export function FormField({
  label,
  htmlFor,
  hint,
  required,
  children,
  className,
  size = "md",
}: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <label htmlFor={htmlFor} className="text-sm font-medium leading-none text-text">
        {label}
        {required ? (
          <span className="ml-0.5 text-destructive" aria-hidden>
            *
          </span>
        ) : null}
      </label>
      <div className={formFieldWidthClass[size]}>{children}</div>
      {hint ? <p className={cn("text-xs leading-relaxed text-muted", formFieldWidthClass[size])}>{hint}</p> : null}
    </div>
  );
}

export function FormTextarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(formTextareaClassName, className)} {...props} />;
}

type FormImagePanelProps = {
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
};

/** Panel lateral para imagenes: sticky en desktop, ancho generoso para dropzone y preview. */
export function FormImagePanel({
  title,
  description,
  children,
  footer,
  className,
}: FormImagePanelProps) {
  return (
    <FormSection
      title={title}
      description={description}
      className={cn("lg:sticky lg:top-4 lg:self-start", className)}
      contentClassName="space-y-4"
    >
      {children}
      {footer ? <p className="text-xs leading-relaxed text-muted">{footer}</p> : null}
    </FormSection>
  );
}

type FormActionsProps = {
  cancelHref: string;
  cancelLabel?: string;
  submitLabel: string;
  pendingLabel: string;
  isPending: boolean;
  error?: string | null;
  /** toolbar: arriba del formulario; footer: barra fija al pie. */
  variant?: "toolbar" | "footer";
};

export function FormActions({
  cancelHref,
  cancelLabel = "Cancelar",
  submitLabel,
  pendingLabel,
  isPending,
  error,
  variant = "toolbar",
}: FormActionsProps) {
  const buttons = (
    <div className="flex shrink-0 gap-2">
      <Button type="button" variant="outline" asChild disabled={isPending}>
        <Link href={cancelHref}>{cancelLabel}</Link>
      </Button>
      <Button type="submit" disabled={isPending} className="min-w-[128px]">
        {isPending ? pendingLabel : submitLabel}
      </Button>
    </div>
  );

  if (variant === "toolbar") {
    return (
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
        {error ? (
          <p className="text-sm text-destructive sm:mr-auto" role="alert">
            {error}
          </p>
        ) : null}
        {buttons}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "sticky bottom-0 z-10 -mx-4 mt-4 border-t border-border bg-surface/95 px-4 py-4",
        "shadow-[0_-12px_40px_-16px_rgba(0,0,0,0.5)] backdrop-blur-md sm:-mx-0 sm:rounded-xl sm:border sm:shadow-sm"
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : (
          <p className="hidden text-xs text-muted sm:block">
            Revisa los datos antes de guardar.
          </p>
        )}
        {buttons}
      </div>
    </div>
  );
}
