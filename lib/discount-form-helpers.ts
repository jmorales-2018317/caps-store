/** Convierte ISO de la API a valor de input datetime-local (hora local). */
export function toDatetimeLocalValue(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Convierte datetime-local del formulario a ISO para Supabase. */
export function fromDatetimeLocalToIso(local: string): string {
  return new Date(local).toISOString();
}

export function defaultDatetimeLocalRange(): { start: string; end: string } {
  const start = new Date();
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  const pad = (n: number) => String(n).padStart(2, "0");
  const fmt = (d: Date) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  return { start: fmt(start), end: fmt(end) };
}
