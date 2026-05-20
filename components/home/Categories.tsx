"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useStylesWithCount } from "@/hooks/use-styles";

function getTrendingStyleIds(styles: { id: string; count: number }[]) {
  return new Set(
    [...styles]
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
      .map((style) => style.id),
  );
}

export function Categories() {
  const { data: hatStyles = [] } = useStylesWithCount();
  const trendingIds = getTrendingStyleIds(hatStyles);

  return (
    <section className="bg-surface border-y border-border py-12 sm:py-16">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <p className="mb-2 text-[11px] font-black uppercase tracking-[0.3em] text-primary">
            Explora por estilo
          </p>
          <h2 className="text-balance text-3xl font-bold tracking-tight text-text sm:text-4xl">
            Categorías
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Descubre gorras en nuestros estilos más populares
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {hatStyles.map((style) => (
            <Link
              key={style.id}
              href={`/products?style=${style.id}`}
              className="group block"
            >
              <Card className="relative cursor-pointer overflow-hidden py-0 transition-all duration-500 hover:shadow-lg">
                <div className="relative aspect-5/4 overflow-hidden">
                  {style.image ? (
                    <Image
                      src={style.image}
                      alt={style.label}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="size-full bg-surface-2" />
                  )}

                  <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent" />

                  {trendingIds.has(style.id) ? (
                    <Badge className="absolute top-4 left-4 rounded-sm px-2.5 py-0.5 font-semibold">
                      Destacado
                    </Badge>
                  ) : null}

                  <div className="absolute right-0 bottom-0 left-0 p-6 text-card-foreground">
                    <h3 className="mb-1 text-xl font-bold">{style.label}</h3>
                    <p className="mb-3 text-sm text-card-foreground/60">
                      {style.description ??
                        `Gorras y accesorios estilo ${style.label.toLowerCase()}`}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">
                        {style.count.toLocaleString("es-ES")}{" "}
                        {style.count === 1 ? "producto" : "productos"}
                      </span>
                      <span className="inline-flex h-8 cursor-pointer items-center gap-1 rounded-md border border-white/30 bg-white/20 px-3 text-xs text-white backdrop-blur-sm transition-colors group-hover:bg-white/30">
                        Ver
                        <ArrowRight className="size-3.5" />
                      </span>
                    </div>
                  </div>
                </div>

                <div className="absolute right-0 bottom-0 left-0 h-0.5 origin-left scale-x-0 bg-primary transition-transform duration-300 group-hover:scale-x-100" />
              </Card>
            </Link>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button size="lg" className="h-10 cursor-pointer gap-2 px-4" asChild>
            <Link href="/products">
              <ShoppingBag className="size-5" />
              Ver todas las categorías
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
