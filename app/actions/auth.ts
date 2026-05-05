"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getPostAuthRedirectPath } from "@/lib/auth/redirect-path";
import { getSafeInternalPath } from "@/lib/auth/safe-redirect";

export type AuthFormState = {
  error?: string;
  success?: string;
  fieldErrors?: {
    email?: string;
    password?: string;
  };
};

function appOrigin(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "http://localhost:3000"
  );
}

export async function loginAction(
  _prev: AuthFormState | undefined,
  formData: FormData
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email) {
    return { fieldErrors: { email: "Introduce tu correo electrónico." } };
  }
  if (!password) {
    return { fieldErrors: { password: "Introduce tu contraseña." } };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return {
      error:
        error.message === "Invalid login credentials"
          ? "Correo o contraseña incorrectos."
          : error.message,
    };
  }

  if (!data.user) {
    return { error: "No se pudo iniciar sesión. Inténtalo de nuevo." };
  }

  const next = getSafeInternalPath(String(formData.get("redirect") ?? ""));
  if (next) {
    redirect(next);
  }

  const path = await getPostAuthRedirectPath(supabase, data.user.id);
  redirect(path);
}

export async function signupAction(
  _prev: AuthFormState | undefined,
  formData: FormData
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email) {
    return { fieldErrors: { email: "Introduce tu correo electrónico." } };
  }
  if (password.length < 6) {
    return {
      fieldErrors: {
        password: "La contraseña debe tener al menos 6 caracteres.",
      },
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${appOrigin()}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (data.session && data.user) {
    const next = getSafeInternalPath(String(formData.get("redirect") ?? ""));
    if (next) {
      redirect(next);
    }
    redirect("/");
  }

  return {
    success:
      "Cuenta creada. Si pides confirmación por correo, revisa tu bandeja de entrada.",
  };
}

export async function googleOAuthAction(formData: FormData) {
  const supabase = await createClient();
  const next = getSafeInternalPath(String(formData.get("redirect") ?? ""));
  const callbackUrl =
    next != null
      ? `${appOrigin()}/auth/callback?next=${encodeURIComponent(next)}`
      : `${appOrigin()}/auth/callback`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: callbackUrl,
    },
  });

  if (error) {
    const extra =
      next != null ? `&redirect=${encodeURIComponent(next)}` : "";
    redirect(`/login?error=${encodeURIComponent(error.message)}${extra}`);
  }

  if (data.url) {
    redirect(data.url);
  }

  redirect("/login?error=oauth");
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut({ scope: "global" });
}
