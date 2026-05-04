"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { loginAction, googleOAuthAction, type AuthFormState } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthPageShell } from "./AuthPageShell";
import { GoogleIcon } from "./GoogleIcon";

function FormMessage({ state }: { state: AuthFormState | undefined }) {
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

export function LoginForm({
  urlError,
  redirectTo,
}: {
  urlError?: string;
  redirectTo?: string;
}) {
  const [state, formAction, pending] = useActionState(loginAction, undefined);

  return (
    <AuthPageShell
      title="Iniciar sesión"
      subtitle="Accede a tu cuenta para seguir personalizando gorras y revisar tus pedidos."
    >
      {urlError ? (
        <p
          role="alert"
          className="text-sm text-accent border border-border bg-surface-2 px-3 py-2 mb-4"
        >
          {urlError}
        </p>
      ) : null}
      <FormMessage state={state} />

      <form action={formAction} className="space-y-5">
        {redirectTo ? (
          <input type="hidden" name="redirect" value={redirectTo} />
        ) : null}
        <Input
          id="login-email"
          name="email"
          type="email"
          autoComplete="email"
          label="Correo electrónico"
          placeholder="tu@correo.com"
          className="bg-surface-2"
          error={state?.fieldErrors?.email}
        />
        <Input
          id="login-password"
          name="password"
          type="password"
          autoComplete="current-password"
          label="Contraseña"
          placeholder="••••••••"
          className="bg-surface-2"
          error={state?.fieldErrors?.password}
        />
        <Button
          type="submit"
          className="w-full"
          disabled={pending}
          aria-busy={pending}
        >
          {pending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
              Entrando…
            </>
          ) : (
            "Entrar"
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
        ¿No tienes cuenta?{" "}
        <Link
          href={
            redirectTo
              ? `/signup?redirect=${encodeURIComponent(redirectTo)}`
              : "/signup"
          }
          className="font-bold text-accent hover:text-accent-hover transition-colors duration-200 cursor-pointer"
        >
          Regístrate
        </Link>
      </p>
    </AuthPageShell>
  );
}
