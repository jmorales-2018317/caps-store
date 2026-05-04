import type { Metadata } from "next";
import { SignupForm } from "@/components/auth/SignupForm";

export const metadata: Metadata = {
  title: "Crear cuenta",
  description: "Regístrate en Crea Caps con correo o Google.",
};

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const q = await searchParams;
  return <SignupForm redirectTo={q.redirect} />;
}
