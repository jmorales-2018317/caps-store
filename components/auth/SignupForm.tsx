"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { signupAction, googleOAuthAction, type AuthFormState } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthPageShell } from "./AuthPageShell";
import { GoogleIcon } from "./GoogleIcon";

function FormMessages({ state }: { state: AuthFormState | undefined }) {
  if (state?.success) {
    return (
      <p
        role="status"
        className="text-sm text-text border border-border bg-surface-2 px-3 py-2 mb-4"
      >
        {state.success}
      </p>
    );
  }
  if (state?.error) {
    return (
      <p
        role="alert"
        className="text-sm text-accent border border-border bg-surface-2 px-3 py-2 mb-4"
      >
        {state.error}
      </p>
    );
  }
  return null;
}

export function SignupForm({ redirectTo }: { redirectTo?: string }) {
  const [state, formAction, pending] = useActionState(signupAction, undefined);

  return (
    <AuthPageShell
      title="Crear cuenta"
      subtitle="Únete a Crea Caps para guardar favoritos y unificar tu experiencia de compra."
    >
      <FormMessages state={state} />

      <form action={formAction} className="space-y-5">
        {redirectTo ? (
          <input type="hidden" name="redirect" value={redirectTo} />
        ) : null}
        <div className="space-y-2">
          <Input
            id="signup-email"
            name="email"
            type="email"
            autoComplete="email"
            aria-label="Correo electrónico"
            aria-invalid={Boolean(state?.fieldErrors?.email)}
            aria-describedby={
              state?.fieldErrors?.email ? "signup-email-error" : undefined
            }
            placeholder="tu@correo.com"
            className="bg-surface-2"
          />
          {state?.fieldErrors?.email ? (
            <p id="signup-email-error" role="alert" className="text-sm text-destructive">
              {state.fieldErrors.email}
            </p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Input
            id="signup-password"
            name="password"
            type="password"
            autoComplete="new-password"
            aria-label="Contraseña"
            aria-invalid={Boolean(state?.fieldErrors?.password)}
            aria-describedby={
              state?.fieldErrors?.password ? "signup-password-error" : undefined
            }
            placeholder="Mínimo 6 caracteres"
            className="bg-surface-2"
          />
          {state?.fieldErrors?.password ? (
            <p id="signup-password-error" role="alert" className="text-sm text-destructive">
              {state.fieldErrors.password}
            </p>
          ) : null}
        </div>
        <Button
          type="submit"
          className="w-full"
          disabled={pending}
          aria-busy={pending}
        >
          {pending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
              Creando cuenta…
            </>
          ) : (
            "Crear cuenta"
          )}
        </Button>
      </form>

      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center" aria-hidden>
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-[0.25em] text-muted">
          <span className="bg-surface px-3">o continúa con</span>
        </div>
      </div>

      <form action={googleOAuthAction}>
        {redirectTo ? (
          <input type="hidden" name="redirect" value={redirectTo} />
        ) : null}
        <Button
          type="submit"
          variant="outline"
          className="w-full gap-3 border-border bg-surface-2 text-text hover:bg-border hover:border-muted"
        >
          <GoogleIcon />
          Google
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-muted">
        ¿Ya tienes cuenta?{" "}
        <Link
          href={
            redirectTo
              ? `/login?redirect=${encodeURIComponent(redirectTo)}`
              : "/login"
          }
          className="font-bold text-accent hover:text-accent-hover transition-colors duration-200 cursor-pointer"
        >
          Inicia sesión
        </Link>
      </p>
    </AuthPageShell>
  );
}
