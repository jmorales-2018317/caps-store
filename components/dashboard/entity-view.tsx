import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type Row = {
  principal: string
  secondary: string
  amount: string
  status: string
}

interface EntityViewProps {
  badge: string
  title: string
  description: string
  ctaLabel: string
  ctaHref: string
  rows: Row[]
}

export function EntityView({
  badge,
  title,
  description,
  ctaLabel,
  ctaHref,
  rows,
}: EntityViewProps) {
  return (
    <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
      <section className="rounded-xl border border-border bg-surface px-5 py-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-accent">
              {badge}
            </p>
            <h1 className="mt-2 text-2xl font-black tracking-tight text-text sm:text-3xl">
              {title}
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted">{description}</p>
          </div>
          <Button asChild className="bg-accent text-bg hover:bg-accent-hover">
            <Link href={ctaHref}>{ctaLabel}</Link>
          </Button>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-surface p-4 sm:p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Detalle</TableHead>
              <TableHead>Monto</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={`${row.principal}-${row.secondary}`}>
                <TableCell className="font-medium">{row.principal}</TableCell>
                <TableCell>{row.secondary}</TableCell>
                <TableCell>{row.amount}</TableCell>
                <TableCell>{row.status}</TableCell>
                <TableCell className="text-right">
                  <div className="inline-flex gap-2">
                    <Button variant="outline" size="sm">
                      Editar
                    </Button>
                    <Button variant="destructive" size="sm">
                      Eliminar
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>
    </div>
  )
}
