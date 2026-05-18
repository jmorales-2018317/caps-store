import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HeroSearchForm } from "@/components/home/HeroSearchForm";
import { HeroProductShowcase } from "@/components/home/HeroProductShowcase";
import { heroFeaturedImage } from "@/data/heroSlider";
import { cn } from "@/lib/utils";

const quickLinks = [
  { label: "Snapback", href: "/products?q=snapback" },
  { label: "Fitted", href: "/products?q=fitted" },
  { label: "Dad hat", href: "/products?q=dad" },
  { label: "Novedades", href: "/products?reciente=1" },
] as const;

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-bg">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #f5f5f5 1px, transparent 1px), linear-gradient(to bottom, #f5f5f5 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className="absolute -top-32 right-[-8%] h-[min(560px,90vw)] w-[min(560px,90vw)] rounded-full bg-accent/12 blur-[130px]" />
        <div className="absolute bottom-[-25%] left-[-10%] h-[480px] w-[480px] rounded-full bg-accent/5 blur-[110px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_45%_at_72%_18%,rgba(193,161,88,0.14),transparent_58%)]" />
      </div>

      <div
        className="pointer-events-none absolute inset-0 bg-linear-to-r from-bg via-bg/92 via-45% to-transparent lg:via-38%"
        aria-hidden
      />

      <div className="relative mx-auto w-full max-w-7xl px-4 pb-16 pt-10 sm:px-6 sm:pb-20 sm:pt-14 lg:px-8 lg:pb-0 lg:pt-0">
        <div className="lg:hidden mb-10 flex justify-center">
          <HeroProductShowcase image={heroFeaturedImage} />
        </div>

        <div className="grid items-end gap-10 lg:min-h-[min(100dvh,940px)] lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-6 xl:gap-10">
          <div className="relative z-10 flex flex-col justify-center lg:max-w-xl lg:py-20 xl:py-24">
            <p className="mb-5 inline-flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.28em] text-accent">
              <span className="h-px w-7 bg-accent/70" aria-hidden />
              Tienda oficial
            </p>

            <h1 className="max-w-[14ch] text-[clamp(2.25rem,6vw,4rem)] font-semibold leading-[1.02] tracking-tight text-text">
              Gorras con
              <span className="mt-1 block bg-linear-to-r from-accent via-[#e8d9a8] to-accent bg-clip-text font-semibold text-transparent">
                actitud real
              </span>
            </h1>

            <p className="mt-6 max-w-lg text-pretty text-base leading-relaxed text-muted sm:text-[17px]">
              Snapbacks, fitted y dad hats listas para llevar — o personalízalas con
              colores, estilo y logo para que hablen de ti.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/products"
                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3.5 text-[13px] font-semibold text-bg transition-colors hover:bg-accent-hover"
              >
                Explorar colección
                <ArrowRight className="size-4" aria-hidden />
              </Link>
              <Link
                href="/products?reciente=1"
                className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-border/90 bg-surface/50 px-6 py-3.5 text-[13px] font-semibold text-text transition-colors hover:border-accent/40 hover:text-accent"
              >
                Ver novedades
              </Link>
            </div>

            <HeroSearchForm className="mt-8" />

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-medium uppercase tracking-wider text-muted/80">
                Popular:
              </span>
              {quickLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "cursor-pointer rounded-full border border-border/80 bg-surface/40 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted",
                    "transition-colors duration-200 hover:border-accent/35 hover:text-text"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <ul className="mt-12 hidden gap-8 border-t border-border/60 pt-10 sm:flex">
              {[
                { value: "16+", label: "Estilos" },
                { value: "Premium", label: "Materiales" },
                { value: "GT", label: "Envíos locales" },
              ].map((stat) => (
                <li key={stat.label}>
                  <p className="text-lg font-semibold tracking-tight text-text">
                    {stat.value}
                  </p>
                  <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wider text-muted">
                    {stat.label}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative hidden lg:flex lg:items-end lg:justify-end">
            <HeroProductShowcase
              image={heroFeaturedImage}
              className="lg:absolute lg:bottom-0 lg:right-[-6%] xl:right-[-4%]"
            />
          </div>
        </div>
      </div>

      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-bg to-transparent"
        aria-hidden
      />
    </section>
  );
}
