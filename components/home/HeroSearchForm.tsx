"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

type HeroSearchFormProps = {
  className?: string;
};

export function HeroSearchForm({ className }: HeroSearchFormProps) {
  const router = useRouter();
  const [value, setValue] = useState("");

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = value.trim();
    if (q) {
      router.push(`/products?q=${encodeURIComponent(q)}`);
    } else {
      router.push("/products");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("w-full max-w-xl", className)}
      role="search"
      aria-label="Buscar gorras"
    >
      <div className="flex items-stretch gap-0 rounded-2xl border border-white/12 bg-white/4 p-1.5 shadow-[0_0_0_1px_rgba(0,0,0,0.2)_inset] backdrop-blur-xl">
        <label htmlFor="hero-search" className="sr-only">
          Buscar gorras
        </label>
        <div className="flex min-w-0 flex-1 items-center gap-3 pl-4">
          <Search
            className="size-5 shrink-0 text-muted"
            strokeWidth={1.75}
            aria-hidden
          />
          <input
            id="hero-search"
            name="q"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Nombre, estilo, color…"
            autoComplete="off"
            className="min-w-0 flex-1 appearance-none bg-transparent py-3.5 text-[15px] mr-2.5 text-text placeholder:text-muted/70 focus:outline-none focus-visible:outline-none"
          />
        </div>
        <button
          type="submit"
          className="shrink-0 rounded-xl bg-accent px-5 py-3 text-[13px] font-semibold text-bg transition-colors hover:bg-accent-hover active:scale-[0.98]"
        >
          Buscar
        </button>
      </div>
    </form>
  );
}
