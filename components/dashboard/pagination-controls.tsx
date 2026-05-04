"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

type PaginationControlsProps = {
  page: number;
  pageSize: number;
  totalCount: number;
};

export function PaginationControls({
  page,
  pageSize,
  totalCount,
}: PaginationControlsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const safePage = page > 0 ? page : 1;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const canGoPrev = safePage > 1;
  const canGoNext = safePage < totalPages;

  function navigate(nextPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(nextPage));
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex items-center justify-between gap-4 border-t border-border/70 pt-4">
      <p className="text-sm text-muted">
        Pagina {safePage} de {totalPages} ({totalCount} registros)
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(safePage - 1)}
          disabled={!canGoPrev}
        >
          <ChevronLeft />
          Anterior
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(safePage + 1)}
          disabled={!canGoNext}
        >
          Siguiente
          <ChevronRight />
        </Button>
      </div>
    </div>
  );
}
