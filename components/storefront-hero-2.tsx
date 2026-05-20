import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Diamond, PenLine, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { heroFeaturedImage } from "@/data/heroSlider";

const features = [
  { icon: Diamond, label: "Personalizable" },
  { icon: PenLine, label: "Bordado de alta calidad" },
  { icon: Truck, label: "Envío gratis" },
] as const;

function HeroCapVisual() {
  return (
    <div className="relative mx-auto flex w-full max-w-[min(100%,420px)] items-center justify-center sm:max-w-[500px] lg:mx-0 lg:max-w-none lg:justify-end">
      <div
        className="pointer-events-none absolute right-[8%] top-[10%] z-0 aspect-square w-[75%] rounded-full bg-primary/20 blur-[72px] sm:blur-[80px]"
        aria-hidden
      />
      <div className="relative z-10 aspect-square w-full sm:aspect-square lg:aspect-square lg:w-full">
        <Image
          src={heroFeaturedImage.src}
          alt={heroFeaturedImage.alt}
          fill
          priority
          sizes="(max-width: 1024px) 92vw, 60vw"
          className="object-contain object-center drop-shadow-[0_24px_48px_rgba(0,0,0,0.18)]"
        />
      </div>
    </div>
  );
}

export function StorefrontHero2() {
  return (
    <section className="relative isolate -mt-16 min-h-[calc(100dvh-4rem)] overflow-hidden pt-16">
      <div className="relative mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-7xl flex-col justify-center px-4 pb-14 pt-8 sm:px-6 sm:pb-20 sm:pt-12 lg:pb-24 lg:pt-14">
        <div className="grid grid-cols-1 items-center gap-10 sm:gap-12 lg:grid-cols-[2fr_3fr] lg:gap-12">
          <div className="order-2 flex flex-col gap-7 sm:gap-8 lg:order-1 lg:gap-9">
            <div className="flex items-center gap-3">
              <span
                className="h-px w-9 shrink-0 bg-primary sm:w-11"
                aria-hidden
              />
              <p className="text-[10px] font-medium uppercase tracking-[0.38em] text-primary sm:text-[11px]">
                Temporada 2026
              </p>
            </div>

            <h1 className="max-w-xl lg:max-w-none text-balance text-[2.35rem] leading-[1.06] font-semibold tracking-tight text-text sm:text-5xl lg:text-[3.25rem] xl:text-6xl">
              Crea tu gorra completamente{" "}
              <span className="block bg-linear-to-r from-primary via-[#e8d9a8] to-primary bg-clip-text font-semibold text-transparent">
                personalizada
              </span>
            </h1>

            <p className="max-w-lg lg:max-w-none text-base leading-relaxed text-muted sm:text-lg sm:leading-relaxed font-light">
              Convierte tu idea en una pieza única diseñada para representar tu estilo, identidad o marca.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
              <Button
                size="lg"
                className="h-12 rounded-full bg-primary px-7 text-sm font-semibold text-primary-foreground hover:bg-primary/90 sm:h-11"
                asChild
              >
                <Link href="/products">
                  Diseña la tuya
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 rounded-full border-border/80 bg-transparent px-7 text-sm font-semibold text-text hover:border-primary/40 hover:bg-primary/5 hover:text-primary sm:h-11"
                asChild
              >
                <Link href="/products">Ver colección</Link>
              </Button>
            </div>

            <ul className="flex-wrap flex gap-x-6 gap-y-4 pt-1 sm:gap-x-8 sm:pt-2">
              {features.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-2.5">
                  <Icon
                    className="size-4 shrink-0 text-primary"
                    strokeWidth={1.5}
                    aria-hidden
                  />
                  <span className="text-sm text-muted">{label}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="order-1 flex justify-center lg:order-2 lg:justify-end">
            <HeroCapVisual />
          </div>
        </div>
      </div>
    </section>
  );
}

export default StorefrontHero2;
