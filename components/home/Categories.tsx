"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { useStylesWithCount } from "@/hooks/use-styles";

export function Categories() {
  const { data: hatStyles = [] } = useStylesWithCount();

  return (
    <section className="bg-surface border-y border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        {/* Header */}
        <div className="mb-12">
          <p className="text-[11px] font-black uppercase tracking-[0.3em] text-accent mb-2">
            Explora por estilo
          </p>
          <h2 className="font-black uppercase text-4xl sm:text-5xl tracking-tighter text-text leading-none">
            Categorías
          </h2>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {hatStyles.map((style) => (
            <Link
              key={style.id}
              href={`/products?style=${style.id}`}
              className="group relative overflow-hidden bg-surface-2"
              style={{ aspectRatio: "3/4" }}
            >
              <div className="relative h-full min-h-[200px] sm:min-h-[280px]">
                {style.image && (
                  <Image
                    src={style.image}
                    alt={style.label}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-80"
                    sizes="(max-width: 640px) 50vw, 25vw"
                  />
                )}

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-bg/90 via-bg/20 to-transparent" />

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted mb-1">
                    {style.count} estilos
                  </p>
                  <h3 className="font-black uppercase text-xl tracking-tight text-text leading-none mb-3">
                    {style.label}
                  </h3>
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-accent opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                    Ver
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>

                {/* Accent line on hover */}
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
