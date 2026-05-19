"use client";

import { useState } from "react";

export function FooterNewsletter() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (email.trim()) setDone(true);
  }

  if (done) {
    return (
      <p className="text-xs text-text font-bold">
        ¡Listo! Ya estás en la lista ✓
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="tu@correo.com"
        required
        className="flex-1 bg-surface border border-border text-text text-xs px-4 py-3 placeholder:text-faint focus:outline-none focus:border-primary transition-colors duration-200 min-w-0"
      />
      <button
        type="submit"
        className="bg-primary text-bg text-[10px] font-black uppercase tracking-widest px-4 py-3 hover:bg-primary/90 transition-colors duration-200 whitespace-nowrap"
      >
        Unirme
      </button>
    </form>
  );
}
