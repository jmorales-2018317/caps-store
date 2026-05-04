"use client";

import type { Table } from "@tanstack/react-table";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
}

export function DataTablePagination<TData>({
  table,
}: DataTablePaginationProps<TData>) {
  const selected = table.getFilteredSelectedRowModel().rows.length;
  const total = table.getFilteredRowModel().rows.length;

  return (
    <div className="flex items-center justify-between gap-4 border-t border-border/70 pt-4">
      <p className="text-sm text-muted">
        {selected > 0 ? (
          <>
            <span className="font-medium text-text">{selected}</span> de{" "}
            <span className="font-medium text-text">{total}</span> fila(s) seleccionada(s)
          </>
        ) : (
          <>
            <span className="font-medium text-text">{total}</span> registro(s)
          </>
        )}
      </p>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <label
            htmlFor="dt-page-size"
            className="text-xs text-muted whitespace-nowrap"
          >
            Filas por pagina
          </label>
          <select
            id="dt-page-size"
            value={table.getState().pagination.pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
            className="h-7 rounded border border-border bg-surface px-1.5 text-xs text-text focus:outline-none focus:border-accent"
          >
            {[10, 20, 30, 50].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>

        <p className="text-xs text-muted whitespace-nowrap">
          Pág{" "}
          <span className="font-medium text-text">
            {table.getState().pagination.pageIndex + 1}
          </span>{" "}
          de{" "}
          <span className="font-medium text-text">{table.getPageCount()}</span>
        </p>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            aria-label="Primera pagina"
          >
            <ChevronsLeft />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            aria-label="Pagina anterior"
          >
            <ChevronLeft />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            aria-label="Pagina siguiente"
          >
            <ChevronRight />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            aria-label="Ultima pagina"
          >
            <ChevronsRight />
          </Button>
        </div>
      </div>
    </div>
  );
}
