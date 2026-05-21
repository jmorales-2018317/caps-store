"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronRight, ImagePlus, Info, RotateCcw, Trash2 } from "lucide-react";
import { CapViewer } from "@/components/cap/cap-viewer";
import { Button } from "@/components/ui/button";
import {
  CAP_MODEL_CONFIGS,
  DEFAULT_CAP_BUTTON_COLOR,
  DEFAULT_CAP_FABRIC_COLOR,
  DEFAULT_CAP_MODEL_TYPE,
  type CapModelType,
} from "@/lib/cap-colors";
import {
  CAP_LOGO_ACCEPT,
  CAP_LOGO_MAX_BYTES,
  CAP_LOGO_SCALE_DEFAULT,
  CAP_LOGO_SCALE_MAX,
  CAP_LOGO_SCALE_MIN,
} from "@/lib/cap-logo";

function ColorField({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (hex: string) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <label
        htmlFor={id}
        className="text-[11px] font-bold uppercase tracking-wider text-text shrink-0 cursor-pointer"
      >
        {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          id={id}
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 w-10 cursor-pointer border border-border bg-transparent p-0.5 transition-opacity hover:opacity-80"
          aria-label={label}
        />
        <span className="text-[10px] font-mono text-muted uppercase tabular-nums">
          {value}
        </span>
      </div>
    </div>
  );
}

export function CapCustomizationClient() {
  const [modelType, setModelType] = useState<CapModelType>(
    DEFAULT_CAP_MODEL_TYPE
  );
  const [fabricColor, setFabricColor] = useState(DEFAULT_CAP_FABRIC_COLOR);
  const [buttonColor, setButtonColor] = useState(DEFAULT_CAP_BUTTON_COLOR);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoFileName, setLogoFileName] = useState<string | null>(null);
  const [logoScale, setLogoScale] = useState(CAP_LOGO_SCALE_DEFAULT);
  const [logoError, setLogoError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (logoUrl) URL.revokeObjectURL(logoUrl);
    };
  }, [logoUrl]);

  function clearLogo() {
    if (logoUrl) URL.revokeObjectURL(logoUrl);
    setLogoUrl(null);
    setLogoFileName(null);
    setLogoError(null);
    setLogoScale(CAP_LOGO_SCALE_DEFAULT);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleLogoUpload(file: File | undefined) {
    if (!file) return;
    setLogoError(null);

    if (!file.type.startsWith("image/")) {
      setLogoError("Solo se permiten archivos de imagen.");
      return;
    }
    if (file.size > CAP_LOGO_MAX_BYTES) {
      setLogoError("La imagen no puede superar 5 MB.");
      return;
    }

    if (logoUrl) URL.revokeObjectURL(logoUrl);
    setLogoUrl(URL.createObjectURL(file));
    setLogoFileName(file.name);
  }

  function handleReset() {
    setFabricColor(DEFAULT_CAP_FABRIC_COLOR);
    setButtonColor(DEFAULT_CAP_BUTTON_COLOR);
    clearLogo();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <nav className="flex items-center gap-2 mb-6 text-[11px] uppercase tracking-widest">
        <Link href="/" className="text-muted hover:text-text transition-colors">
          Inicio
        </Link>
        <ChevronRight className="w-3 h-3 text-faint" />
        <span className="text-text">Personalizar</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 xl:gap-12">
        <div className="space-y-2">
          <div className="relative aspect-square min-h-[280px] bg-surface overflow-hidden border border-border">
            <CapViewer
              modelType={modelType}
              fabricColor={fabricColor}
              buttonColor={buttonColor}
              logoUrl={logoUrl}
              logoScale={logoScale}
            />
          </div>
          <p className="text-[10px] uppercase tracking-widest text-muted text-center">
            Arrastra para rotar · scroll para zoom
          </p>
          <p
            role="note"
            className="flex gap-2 border border-border bg-surface/80 px-3 py-2.5 text-[11px] leading-snug text-muted"
          >
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-faint" aria-hidden />
            <span>
              Vista previa orientativa. El producto final puede variar en color,
              proporciones y acabados.
            </span>
          </p>
        </div>

        <div className="flex flex-col gap-5 lg:pt-0">
          <header>
            <h1 className="font-black uppercase text-2xl sm:text-3xl tracking-tighter text-text leading-tight">
              Personaliza tu gorra
            </h1>
            <p className="mt-2 text-sm text-muted leading-relaxed">
              Color de tela y broche, y logo frontal en tiempo real.
            </p>
          </header>

          <section className="space-y-3 border border-border p-4">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-text">
              Tipo de gorra
            </p>
            <div className="flex gap-2">
              {(Object.keys(CAP_MODEL_CONFIGS) as CapModelType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setModelType(type)}
                  className={[
                    "flex-1 py-2 text-[11px] font-bold uppercase tracking-[0.15em] border transition-colors cursor-pointer",
                    modelType === type
                      ? "border-text bg-text text-background"
                      : "border-border text-muted hover:border-text hover:text-text",
                  ].join(" ")}
                >
                  {CAP_MODEL_CONFIGS[type].label}
                </button>
              ))}
            </div>
          </section>

          <section className="space-y-3 border border-border p-4">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-text">
              Colores
            </p>
            <div className="space-y-3 divide-y divide-border">
              <ColorField
                id="fabric-color"
                label="Gorra"
                value={fabricColor}
                onChange={setFabricColor}
              />
              {CAP_MODEL_CONFIGS[modelType].claspMaterials.length > 0 && (
                <div className="pt-3">
                  <ColorField
                    id="button-color"
                    label="Broche"
                    value={buttonColor}
                    onChange={setButtonColor}
                  />
                </div>
              )}
            </div>
          </section>

          <section className="space-y-3 border border-border p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-text">
                Logo frontal
              </p>
              {logoFileName ? (
                <span className="text-[10px] text-muted truncate max-w-[140px]">
                  {logoFileName}
                </span>
              ) : null}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept={CAP_LOGO_ACCEPT}
              className="sr-only"
              onChange={(e) => handleLogoUpload(e.target.files?.[0])}
            />

            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5 cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <ImagePlus className="w-3.5 h-3.5" />
                Subir logo
              </Button>
              {logoUrl ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 text-muted hover:text-destructive cursor-pointer"
                  onClick={clearLogo}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Quitar
                </Button>
              ) : null}
            </div>

            {logoUrl ? (
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={logoUrl}
                  alt="Vista previa del logo"
                  className="h-12 w-12 object-contain border border-border bg-surface p-0.5 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <label
                    htmlFor="logo-scale"
                    className="text-[10px] uppercase tracking-widest text-muted font-bold block mb-1.5"
                  >
                    Tamaño
                  </label>
                  <input
                    id="logo-scale"
                    type="range"
                    min={CAP_LOGO_SCALE_MIN}
                    max={CAP_LOGO_SCALE_MAX}
                    step={0.01}
                    value={logoScale}
                    onChange={(e) => setLogoScale(Number(e.target.value))}
                    className="w-full accent-primary cursor-pointer"
                  />
                </div>
              </div>
            ) : null}

            {logoError ? (
              <p className="text-xs text-destructive">{logoError}</p>
            ) : null}
            <p className="text-[10px] text-muted leading-snug">
              PNG transparente recomendado · máx. 5 MB
            </p>
          </section>

          <div className="flex flex-wrap gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Restablecer
            </Button>
            <Button asChild size="sm" className="flex-1 sm:flex-none cursor-pointer">
              <Link href="/products">Ver catálogo</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
