export function BrandStatement() {
  return (
    <section className="relative overflow-hidden py-32 bg-bg">
      {/* Background text */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden"
        aria-hidden="true"
      >
        <span
          className="font-black uppercase text-[clamp(80px,20vw,240px)] tracking-tighter text-surface-2 leading-none whitespace-nowrap"
        >
          CREA CAPS
        </span>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          {/* Label */}
          <p className="text-[11px] font-black uppercase tracking-[0.4em] text-accent mb-8">
            Nuestra filosofía
          </p>

          {/* Statement */}
          <blockquote className="font-black uppercase text-[clamp(28px,5vw,56px)] tracking-tighter text-text leading-[1.05] mb-10">
            &quot;Cada gorra que hacemos es una declaración.{" "}
            <span className="text-muted">
              No solo lo que llevas puesto, sino cómo lo llevas.&quot;
            </span>
          </blockquote>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-10">
            <div className="w-12 h-0.5 bg-accent" />
            <p className="text-[11px] uppercase tracking-[0.3em] text-muted">
              Crea Caps
            </p>
          </div>

          {/* Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              {
                icon: "◆",
                title: "Materiales premium",
                text: "Cada tela y cada puntada pensadas para durar y sentirse bien.",
              },
              {
                icon: "◈",
                title: "Diseño con identidad",
                text: "Inspirado en la cultura, pulido con oficio. Sin atajos.",
              },
              {
                icon: "◇",
                title: "Tiradas limitadas",
                text: "No fabricamos miles. Hacemos piezas que vale la pena tener.",
              },
            ].map((pillar) => (
              <div key={pillar.title}>
                <span className="text-accent text-lg mb-3 block">{pillar.icon}</span>
                <h4 className="text-xs font-black uppercase tracking-widest text-text mb-2">
                  {pillar.title}
                </h4>
                <p className="text-xs text-muted leading-relaxed">{pillar.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
