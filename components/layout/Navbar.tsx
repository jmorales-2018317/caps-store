"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShoppingBag,
  Menu,
  X,
  Search,
  LogOut,
  LayoutDashboard,
  ChevronDown,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logoutAction } from "@/app/actions/auth";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useCurrentProfile } from "@/hooks/use-current-profile";
import type { User } from "@supabase/supabase-js";

const navLinks = [
  { href: "/", label: "Inicio" },
  { href: "/products", label: "Tienda" },
];

function profileInitial(user: User): string {
  const name = user.user_metadata?.full_name;
  if (typeof name === "string" && name.trim()) {
    return name.trim().charAt(0).toUpperCase();
  }
  const email = user.email;
  if (email) return email.charAt(0).toUpperCase();
  return "?";
}

export function Navbar() {
  const pathname = usePathname();
  const { cartCount } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartBump, setCartBump] = useState(false);
  const prevCount = useState(cartCount)[0];
  const [, startLogoutTransition] = useTransition();

  const { data: user } = useCurrentUser();
  const { data: profile } = useCurrentProfile();
  const profileRole = profile?.role ?? null;

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    if (cartCount !== prevCount && cartCount > 0) {
      setCartBump(true);
      const t = setTimeout(() => setCartBump(false), 400);
      return () => clearTimeout(t);
    }
  }, [cartCount, prevCount]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled
            ? "bg-bg/95 backdrop-blur-md border-b border-border"
            : "bg-transparent"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4 min-w-0">
            <div className="flex items-center gap-6 lg:gap-10 min-w-0 shrink-0">
              <Link
                href="/"
                className="font-black text-2xl tracking-tighter text-text hover:text-accent transition-colors duration-200 shrink-0"
              >
                Crea Caps
              </Link>

              <nav className="hidden md:flex items-center gap-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "text-[11px] font-bold uppercase tracking-[0.2em] transition-colors duration-200",
                      pathname === link.href
                        ? "text-text"
                        : "text-muted hover:text-text"
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="flex items-center justify-end gap-2 sm:gap-3 shrink-0 ml-auto">
              <Link
                href="/products"
                className="hidden md:flex items-center justify-center w-9 h-9 text-muted hover:text-text transition-colors duration-200 cursor-pointer"
                aria-label="Buscar"
              >
                <Search className="w-4 h-4" />
              </Link>

              <Link
                href="/cart"
                className={cn(
                  "relative flex items-center justify-center w-9 h-9 text-muted hover:text-text transition-colors duration-200",
                  cartBump && "animate-pop"
                )}
                aria-label={`Carrito (${cartCount} artículos)`}
              >
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center w-4 h-4 bg-accent text-bg text-[9px] font-black rounded-full">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </Link>

              {!user ? (
                <Link
                  href="/login"
                  className="inline-flex items-center text-[10px] font-bold uppercase tracking-[0.2em] text-muted hover:text-text transition-colors duration-200 cursor-pointer px-2 py-1.5"
                >
                  Entrar
                </Link>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className={cn(
                        "relative flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-text outline-none transition-opacity hover:opacity-90 data-[state=open]:opacity-90",
                        "data-[state=open]:[&_.chevron-badge]:-translate-y-px data-[state=open]:[&_.chevron-icon]:rotate-180"
                      )}
                      aria-label="Menú de cuenta"
                    >
                      <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-border bg-muted text-sm font-black uppercase tracking-tight">
                        {profileInitial(user)}
                      </span>
                      <span
                        className="chevron-badge pointer-events-none absolute bottom-0 right-0 flex h-4 w-4 items-center justify-center rounded-full border border-border bg-bg shadow-sm transition-transform duration-200"
                        aria-hidden
                      >
                        <ChevronDown className="chevron-icon h-2.5 w-2.5 text-muted transition-transform duration-200" />
                      </span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="min-w-[220px]">
                    <DropdownMenuLabel className="px-3 py-2.5 font-normal">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted">
                        Sesión
                      </p>
                      <p
                        className="mt-0.5 truncate text-xs font-medium text-text"
                        title={user.email ?? undefined}
                      >
                        {user.email}
                      </p>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {profileRole === "admin" && (
                      <DropdownMenuItem asChild className="focus:text-accent">
                        <Link href="/dashboard" className="cursor-pointer hover:text-accent">
                          <LayoutDashboard className="h-4 w-4 shrink-0" aria-hidden />
                          Dashboard
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onSelect={() => {
                        startLogoutTransition(async () => {
                          await logoutAction();
                          window.location.reload();
                        });
                      }}
                    >
                      <LogOut className="h-4 w-4 shrink-0" aria-hidden />
                      Salir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="md:hidden flex items-center justify-center w-9 h-9 text-muted hover:text-text transition-colors duration-200"
                aria-label="Abrir menú"
              >
                {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div
          className={cn(
            "md:hidden border-t border-border bg-bg overflow-hidden transition-all duration-300",
            menuOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
          )}
        >
          <nav className="px-4 py-6 flex flex-col gap-5">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-bold uppercase tracking-[0.2em] transition-colors duration-200",
                  pathname === link.href ? "text-text" : "text-muted"
                )}
              >
                {link.label}
              </Link>
            ))}
            {!user ? (
              <Link
                href="/login"
                className="text-sm font-bold uppercase tracking-[0.2em] text-muted hover:text-text transition-colors duration-200 cursor-pointer"
              >
                Entrar
              </Link>
            ) : (
              <button
                type="button"
                className="text-left text-sm font-bold uppercase tracking-[0.2em] text-muted hover:text-text transition-colors duration-200 cursor-pointer"
                onClick={() => {
                  startLogoutTransition(async () => {
                    await logoutAction();
                    window.location.reload();
                  });
                }}
              >
                Salir
              </button>
            )}
          </nav>
        </div>
      </header>

      {/* Spacer so content doesn't hide under sticky nav */}
      <div className="h-16" />
    </>
  );
}
