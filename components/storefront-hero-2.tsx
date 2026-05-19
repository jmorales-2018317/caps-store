"use client";

import { useState, useEffect, type ComponentProps } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Search,
  ArrowRight,
  TrendingUp,
  ShoppingBag,
  Flame,
} from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { cn, formatPrice } from "@/lib/utils";
import type { Product } from "@/types";

type StorefrontHero2Props = {
  products: Product[];
  isLoading?: boolean;
};

function productTag(product: Product): string {
  return (
    product.categories[0]?.label ??
    product.hat_style.label ??
    "Colección"
  );
}

export function StorefrontHero2({
  products,
  isLoading = false,
}: StorefrontHero2Props) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [api, setApi] = useState<CarouselApi>();
  const [currentSlide, setCurrentSlide] = useState(0);
  const slideCount = products.length;

  useEffect(() => {
    if (!api) return;

    const onSelect = () => setCurrentSlide(api.selectedScrollSnap());
    onSelect();
    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  useEffect(() => {
    if (!api || slideCount <= 1) return;

    const interval = setInterval(() => {
      const next = (api.selectedScrollSnap() + 1) % slideCount;
      api.scrollTo(next);
    }, 5000);

    return () => clearInterval(interval);
  }, [api, slideCount]);

  function handleSearch(
    e: Parameters<NonNullable<ComponentProps<"form">["onSubmit"]>>[0]
  ) {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) {
      router.push(`/products?q=${encodeURIComponent(q)}`);
    } else {
      router.push("/products");
    }
  }

  return (
    <section className="relative isolate min-h-[min(88dvh,820px)] overflow-hidden bg-linear-to-b from-bg to-primary/10">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        aria-hidden
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(to right, #f5f5f5 1px, transparent 1px), linear-gradient(to bottom, #f5f5f5 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>
      <div
        className="pointer-events-none absolute -top-32 right-[-8%] h-[min(560px,90vw)] w-[min(560px,90vw)] rounded-full bg-primary/12 blur-[130px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-linear-to-t from-bg to-transparent"
        aria-hidden
      />

      <div className="relative mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-2 lg:gap-16">
          <header className="relative z-10 flex flex-col gap-8">
            <Badge
              variant="outline"
              className="flex h-auto w-fit items-center gap-2 rounded-full border-primary/35 px-4 py-2 font-semibold text-primary"
            >
              <TrendingUp className="size-4" aria-hidden />
              Tienda oficial
            </Badge>

            <h1 className="text-balance text-5xl leading-tight font-bold tracking-tight text-text md:text-6xl lg:text-7xl">
              Gorras con{" "}
              <span className="bg-linear-to-r from-primary via-[#e4d4a8] to-primary bg-clip-text font-semibold text-transparent">
                actitud real
              </span>
            </h1>

            <p className="max-w-lg text-balance text-xl text-muted">
              Snapbacks, fitted y dad hats listas para llevar — o personalízalas
              con colores, estilo y logo para que hablen de ti.
            </p>

            <form
              onSubmit={handleSearch}
              className="relative max-w-md"
              role="search"
            >
              <Input
                type="search"
                placeholder="Nombre, estilo, color…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-14 rounded-full border-border/80 bg-surface/60 pe-28 ps-12 text-lg text-text placeholder:text-muted/70"
                aria-label="Buscar gorras"
              />
              <Search
                className="absolute start-4 top-1/2 size-5 -translate-y-1/2 text-muted"
                aria-hidden
              />
              <Button
                type="submit"
                size="lg"
                className="absolute end-2 top-1/2 h-10 -translate-y-1/2 cursor-pointer rounded-full bg-primary px-6 text-bg hover:bg-primary/90"
              >
                Buscar
              </Button>
            </form>

            <div className="flex flex-wrap items-center gap-4">
              <Button
                size="lg"
                className="h-10 cursor-pointer rounded-full bg-primary px-6 text-bg hover:bg-primary/90"
                asChild
              >
                <Link href="/products">
                  Explorar colección
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-10 cursor-pointer rounded-full border-border/80 px-6 text-text hover:border-primary/40 hover:text-primary"
                asChild
              >
                <Link href="/products?reciente=1">
                  <ShoppingBag className="size-4" aria-hidden />
                  Ver novedades
                </Link>
              </Button>
            </div>
          </header>

          <div className="relative z-10 flex flex-col gap-4">
            <div className="relative h-[min(440px,62vh)] w-full sm:h-[500px]">
              {isLoading ? (
                <Card className="size-full animate-pulse border-border/60 bg-surface/40" />
              ) : slideCount === 0 ? (
                <Card className="flex size-full items-center justify-center border-border/60 bg-surface/40">
                  <p className="text-sm text-muted">Próximamente más gorras</p>
                </Card>
              ) : (
                <Carousel
                  className="group size-full"
                  setApi={setApi}
                  opts={{
                    align: "start",
                    loop: slideCount > 1,
                    duration: 20,
                    skipSnaps: true,
                  }}
                >
                  <CarouselContent className="h-full">
                    {products.map((product) => {
                      const image = product.images[0];
                      return (
                        <CarouselItem key={product.id} className="h-full">
                          <Card className="relative size-full overflow-hidden border-border/60 py-4">
                            <CardContent className="px-4">
                              <div className="relative h-[min(400px,58vh)] overflow-hidden rounded-md bg-surface sm:h-[460px]">
                                {image ? (
                                  <Image
                                    src={image}
                                    alt={product.name}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 1024px) 100vw, 50vw"
                                    priority={products[0]?.id === product.id}
                                  />
                                ) : (
                                  <div className="flex size-full items-center justify-center">
                                    <ShoppingBag className="size-12 text-muted/40" />
                                  </div>
                                )}
                                <div className="absolute inset-0 bg-linear-to-t from-bg/95 via-bg/40 to-transparent" />
                                <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8">
                                  <div className="relative z-10 flex max-w-md flex-col gap-4">
                                    <Badge className="w-fit rounded-full bg-primary px-2.5 py-0.5 font-semibold text-bg">
                                      {productTag(product)}
                                    </Badge>
                                    <h2 className="text-3xl font-bold text-text sm:text-4xl">
                                      {product.name}
                                    </h2>
                                    <p className="line-clamp-2 text-lg text-muted">
                                      {product.description ||
                                        product.hat_style.label}
                                    </p>
                                    <div className="flex flex-wrap items-center gap-4 pt-2">
                                      <Button
                                        size="lg"
                                        className="h-10 cursor-pointer rounded-full bg-primary px-8 text-bg hover:bg-primary/90"
                                        asChild
                                      >
                                        <Link href={`/products/${product.id}`}>
                                          Ver producto
                                        </Link>
                                      </Button>
                                      <p className="text-xl font-semibold text-text">
                                        {formatPrice(product.price)}
                                        {product.originalPrice != null &&
                                          product.originalPrice >
                                          product.price && (
                                            <span className="ml-2 text-sm font-medium text-muted line-through">
                                              {formatPrice(
                                                product.originalPrice
                                              )}
                                            </span>
                                          )}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                {product.featured && (
                                  <div className="absolute end-4 top-4 flex items-center gap-1 rounded-full bg-bg/30 px-3 py-1 text-sm font-medium text-text backdrop-blur-xs sm:end-6 sm:top-6">
                                    <Flame
                                      className="size-4 text-primary"
                                      aria-hidden
                                    />
                                    Destacado
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        </CarouselItem>
                      );
                    })}
                  </CarouselContent>
                </Carousel>
              )}
            </div>

            {slideCount > 1 && (
              <div className="relative mt-4 flex justify-center gap-3">
                {products.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => api?.scrollTo(index)}
                    className={cn(
                      "size-3 rounded-full transition-all",
                      currentSlide === index
                        ? "bg-primary"
                        : "bg-muted/40 hover:bg-muted/70"
                    )}
                    aria-label={`Ir al slide ${index + 1}`}
                    aria-current={currentSlide === index ? "step" : undefined}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default StorefrontHero2;
