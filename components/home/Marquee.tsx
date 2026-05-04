import { FREE_SHIPPING_MINIMUM_GTQ } from "@/lib/utils";

const freeShippingLabel = `Envío gratis en pedidos superiores a Q${FREE_SHIPPING_MINIMUM_GTQ}`;

const items = [
  "Novedades disponibles",
  freeShippingLabel,
  "Stock limitado — compra ya",
  "Gorras premium Crea Caps",
  "Estilo con clase",
  "Más de 16 estilos",
  "Novedades disponibles",
  freeShippingLabel,
  "Stock limitado — compra ya",
  "Gorras premium Crea Caps",
  "Estilo con clase",
  "Más de 16 estilos",
];

export function Marquee() {
  return (
    <div className="bg-accent overflow-hidden py-3 relative">
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-16 bg-linear-to-r from-accent to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 bg-linear-to-l from-accent to-transparent z-10 pointer-events-none" />

      <div
        className="flex items-center gap-0 whitespace-nowrap animate-marquee"
        style={{ width: "max-content" }}
      >
        {items.map((item, i) => (
          <span key={i} className="flex items-center">
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-bg px-6">
              {item}
            </span>
            <span className="text-bg/35 text-[8px]">◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}
