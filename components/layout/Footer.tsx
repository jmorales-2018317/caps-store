import Link from "next/link";

const shopLinks = [
  { href: "/products?style=snapback", label: "Snapback" },
  { href: "/products?style=fitted", label: "Fitted" },
  { href: "/products?style=dad-hat", label: "Gorra dad" },
  { href: "/products?style=bucket", label: "Bucket" },
];

const infoLinks = [
  { href: "#", label: "Nosotros" },
  { href: "#", label: "Guía de tallas" },
  { href: "#", label: "Envíos y devoluciones" },
  { href: "#", label: "Preguntas frecuentes" },
  { href: "#", label: "Contacto" },
];

export function Footer() {
  return (
    <footer className="border-t border-border mt-auto">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link
              href="/"
              className="font-black text-3xl tracking-tighter text-text hover:text-accent transition-colors duration-200"
            >
              Crea Caps
            </Link>
            <p className="mt-4 text-xs text-muted leading-relaxed max-w-xs">
              Gorras premium pensadas para quienes buscan estilo y calidad en cada detalle.
            </p>
            <div className="flex items-center gap-5 mt-6">
              {["IG", "TW", "YT"].map((handle) => (
                <a
                  key={handle}
                  href="#"
                  className="text-[10px] font-black uppercase tracking-widest text-muted hover:text-text transition-colors duration-200"
                  aria-label={handle}
                >
                  {handle}
                </a>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-text mb-4">
              Tienda
            </h4>
            <ul className="flex flex-col gap-3">
              {shopLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-xs text-muted hover:text-text transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-text mb-4">
              Información
            </h4>
            <ul className="flex flex-col gap-3">
              {infoLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-xs text-muted hover:text-text transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-faint">
            © 2026 Crea Caps. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-[11px] text-faint hover:text-muted transition-colors">
              Política de privacidad
            </a>
            <a href="#" className="text-[11px] text-faint hover:text-muted transition-colors">
              Términos del servicio
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
