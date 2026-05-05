import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HeroSearchForm } from "@/components/home/HeroSearchForm";
import { HeroImageSlider } from "@/components/home/HeroImageSlider";
import { heroSliderImages } from "@/data/heroSlider";
import { cn } from "@/lib/utils";

const quickLinks = [
  { label: "Snapback", href: "/products?q=snapback" },
  { label: "Fitted", href: "/products?q=fitted" },
  { label: "Dad hat", href: "/products?q=dad" },
  { label: "Novedades", href: "/products?reciente=1" },
] as const;

export function Hero() {
  return (
    <section className="relative isolate flex min-h-[min(100dvh,920px)] items-center overflow-hidden bg-bg">
      {/* Ambient light */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -top-40 right-[-10%] h-[min(520px,80vw)] w-[min(520px,80vw)] rounded-full bg-accent/14 blur-[120px]" />
        <div className="absolute bottom-[-20%] left-[-5%] h-[420px] w-[420px] rounded-full bg-accent/6 blur-[100px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(193,161,88,0.08),transparent)]" />
      </div>

      {/* Lectura: más oscuro a la izquierda; la derecha se deja limpia para la foto */}
      <div
        className="pointer-events-none absolute inset-0 bg-linear-to-r from-bg from-35% via-bg/75 via-55% to-transparent lg:from-40% lg:via-50%"
        aria-hidden
      />

      <div className="relative mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
        <div className="grid min-h-0 items-center gap-12 lg:grid-cols-2 lg:items-center lg:gap-10 xl:gap-12">
          <div className="relative z-10 max-w-xl lg:py-4">
            <p className="mb-5 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-accent">
              <span className="h-px w-6 bg-accent/60" aria-hidden />
              Temporada 2026
            </p>

            <h1 className="max-w-[22ch] text-[clamp(2rem,5vw,3.5rem)] font-semibold leading-[1.08] tracking-tight text-text">
              Diseña tu gorra completamente{" "}
              <span className="bg-linear-to-r from-accent via-[#e4d4a8] to-accent bg-clip-text font-semibold text-transparent">
                personalizable
              </span>
            </h1>

            <p className="mt-6 max-w-lg text-pretty text-base leading-relaxed text-muted sm:text-[17px]">
              Piezas premium, sin ruido: snapbacks, fitted y dad hats pensadas
              para quien prefiere calidad a tendencias pasajeras.
            </p>

            <HeroSearchForm className="mt-10" />

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-medium uppercase tracking-wider text-muted/80">
                Popular:
              </span>
              {quickLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-full border border-border/80 bg-surface/40 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted",
                    "transition-colors hover:border-accent/35 hover:text-text"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="max-md:hidden mt-12 flex flex-wrap items-center gap-x-8 gap-y-4 border-t border-border/60 pt-10">
              <Link
                href="/products"
                className="group inline-flex items-center gap-2 text-sm font-medium text-text transition-colors hover:text-accent"
              >
                Ver toda la tienda
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>

          {/* Slider: centrado en la columna */}
          <div className="relative z-0 flex w-full min-w-0 items-center justify-center self-stretch md:pt-4 lg:pt-0">
            <HeroImageSlider slides={heroSliderImages} />
          </div>
        </div>
      </div>

      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-40 bg-linear-to-t from-bg to-transparent"
        aria-hidden
      />
    </section>
  );
}
