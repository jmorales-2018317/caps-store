"use client";

import type { Table } from "@tanstack/react-table";
import { Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const COLUMN_LABELS: Record<string, string> = {
  select: "Seleccionar",
  name: "Nombre",
  label: "Nombre",
  full_name: "Nombre",
  price: "Precio",
  featured: "Destacado",
  hat_style: "Estilo",
  categories: "Categorias",
  images: "Imagen",
  description: "Descripcion",
  status: "Estado",
  contact_name: "Cliente",
  contact_email: "Email",
  total: "Total",
  created_at: "Fecha",
  email: "Email",
  role: "Rol",
  avatar_url: "Avatar",
  type: "Tipo",
  value: "Valor",
  period: "Vigencia",
  products: "Productos",
};

export function DataTableViewOptions<TData>({
  table,
}: {
  table: Table<TData>;
}) {
  const hideable = table
    .getAllColumns()
    .filter((col) => typeof col.accessorFn !== "undefined" && col.getCanHide());

  if (hideable.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1.5">
          <Settings2 className="size-3.5" />
          Columnas
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuLabel className="text-[11px] uppercase tracking-widest text-muted">
          Columnas visibles
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {hideable.map((column) => (
          <DropdownMenuCheckboxItem
            key={column.id}
            checked={column.getIsVisible()}
            onCheckedChange={(value) => column.toggleVisibility(!!value)}
          >
            {COLUMN_LABELS[column.id] ?? column.id}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
