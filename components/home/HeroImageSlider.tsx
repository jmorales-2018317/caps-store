"use client";

import Image from "next/image";
import Autoplay from "embla-carousel-autoplay";
import { useEffect, useMemo, useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import type { HeroSlide } from "@/data/heroSlider";

/** Tamaño lógico del marco (ratio). Exporta assets a 2× (p. ej. 1500×1100) para Retina. */
export const HERO_SLIDE_WIDTH = 750;
export const HERO_SLIDE_HEIGHT = 550;

type HeroImageSliderProps = {
  slides: readonly HeroSlide[];
  /** Intervalo entre cambios (ms). Ignorado si hay una sola imagen o reduced motion. */
  intervalMs?: number;
  className?: string;
  /** Clases del marco del carrusel (contenedor con borde y máscara) */
  imageAreaClassName?: string;
};

export function HeroImageSlider({
  slides,
  intervalMs = 5500,
  className,
  imageAreaClassName,
}: HeroImageSliderProps) {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduceMotion(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const plugins = useMemo(() => {
    if (reduceMotion || slides.length <= 1) return undefined;
    return [
      Autoplay({
        delay: intervalMs,
        stopOnMouseEnter: true,
        stopOnInteraction: false,
      }),
    ];
  }, [reduceMotion, slides.length, intervalMs]);

  if (slides.length === 0) return null;

  const many = slides.length > 1;

  return (
    <div
      className={cn(
        "relative mx-auto w-full max-w-[750px]",
        className
      )}
    >
      <div
        className={cn(
          "relative aspect-750/550 w-full overflow-hidden rounded-[28px] border border-white/12 bg-linear-to-b from-surface/95 via-bg to-bg shadow-[0_32px_100px_-32px_rgba(0,0,0,0.92),inset_0_1px_0_rgba(255,255,255,0.07),inset_0_-1px_0_rgba(0,0,0,0.18)] ring-1 ring-white/6 backdrop-blur-sm",
          imageAreaClassName
        )}
      >
        <div
          className="pointer-events-none absolute inset-0 z-0 rounded-[28px] shadow-[inset_0_0_80px_rgba(193,161,88,0.06)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-12 -top-12 z-0 h-56 w-56 rounded-full bg-accent/16 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-8 left-1/2 z-0 h-40 w-[min(88%,480px)] -translate-x-1/2 rounded-full bg-accent/4.5 blur-[48px]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_72%_58%_at_68%_28%,rgba(193,161,88,0.11),transparent_62%)]"
          aria-hidden
        />

        <div
          className="pointer-events-none absolute inset-x-[10%] bottom-[6%] z-0 h-[14%] rounded-[100%] bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.28)_0%,transparent_75%)] blur-md"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-x-[14%] bottom-[7%] z-0 h-[8%] rounded-[100%] bg-[radial-gradient(ellipse_at_center,rgba(193,161,88,0.08)_0%,transparent_72%)] opacity-80 mix-blend-screen"
          aria-hidden
        />

        <Carousel
          key={`${reduceMotion ? "reduced" : "motion"}-${intervalMs}`}
          className="relative z-1 h-full outline-none"
          opts={{
            loop: many,
            duration: reduceMotion ? 0 : 28,
            watchDrag: many,
          }}
          plugins={plugins}
          aria-label="Modelos con gorras"
          tabIndex={many ? 0 : undefined}
        >
          <CarouselContent className="ml-0 h-full">
            {slides.map((slide, i) => (
              <CarouselItem key={slide.src} className="pl-0">
                <div className="relative h-full min-h-0 w-full">
                  <Image
                    src={slide.src}
                    alt={slide.alt}
                    fill
                    sizes="(max-width: 1023px) 100vw, min(2000px, 50vw)"
                    priority={i === 0}
                    loading={i === 0 ? "eager" : "lazy"}
                    className={cn(
                      "select-none object-contain object-bottom",
                      "drop-shadow-[0_10px_32px_rgba(0,0,0,0.22)]"
                    )}
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        <div
          className="pointer-events-none absolute inset-0 z-4 bg-[radial-gradient(ellipse_88%_78%_at_50%_42%,transparent_42%,rgba(8,8,8,0.22)_100%)]"
          aria-hidden
        />

        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-5 h-[28%] bg-linear-to-t from-bg/95 via-bg/45 to-transparent"
          aria-hidden
        />
      </div>
    </div>
  );
}
