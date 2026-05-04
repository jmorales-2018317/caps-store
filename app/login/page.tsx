import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Iniciar sesión",
  description: "Accede a tu cuenta Crea Caps con correo o Google.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; redirect?: string }>;
}) {
  const q = await searchParams;
  return <LoginForm urlError={q.error} redirectTo={q.redirect} />;
}
