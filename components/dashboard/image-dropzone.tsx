"use client";

import { type DragEvent, useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { GripVertical, ImagePlus, Trash2 } from "lucide-react";
import { uploadImage, type StorageFolder } from "@/lib/supabase/storage";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";

type Base = {
  folder: StorageFolder;
  disabled?: boolean;
  className?: string;
};

type SingleProps = Base & {
  multiple: false;
  value: string;
  onChange: (url: string) => void;
};

type MultiProps = Base & {
  multiple: true;
  value: string[];
  onChange: (urls: string[]) => void;
};

export type ImageDropzoneProps = SingleProps | MultiProps;

export function ImageDropzone(props: ImageDropzoneProps) {
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [rowDrag, setRowDrag] = useState<number | null>(null);

  const disabled = props.disabled ?? false;

  const handleFiles = useCallback(
    async (fileList: FileList | File[]) => {
      const files = Array.from(fileList).filter((f) => f.size > 0);
      if (files.length === 0) return;
      setError(null);
      setUploading(true);

      try {
        if (!props.multiple) {
          const file = files[0];
          const { url, error: upErr } = await uploadImage(file, props.folder);
          if (upErr || !url) {
            setError(upErr ?? "Error al subir");
            return;
          }
          props.onChange(url);
          return;
        }

        const next = [...props.value];
        for (const file of files) {
          const { url, error: upErr } = await uploadImage(file, props.folder);
          if (upErr || !url) {
            setError(upErr ?? "Error al subir una imagen");
            return;
          }
          next.push(url);
        }
        props.onChange(next);
      } finally {
        setUploading(false);
      }
    },
    [props]
  );

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      void handleFiles(acceptedFiles);
    },
    [handleFiles]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
    },
    maxFiles: props.multiple ? undefined : 1,
    disabled: disabled || uploading,
    multiple: props.multiple,
  });

  function removeAt(index: number) {
    if (!props.multiple) {
      props.onChange("");
      return;
    }
    props.onChange(props.value.filter((_, i) => i !== index));
  }

  function onRowDragOver(e: DragEvent<HTMLLIElement>) {
    e.preventDefault();
  }

  function onRowDrop(index: number) {
    if (!props.multiple || rowDrag === null || rowDrag === index) return;
    const next = [...props.value];
    const [moved] = next.splice(rowDrag, 1);
    next.splice(index, 0, moved);
    props.onChange(next);
    setRowDrag(null);
  }

  const zoneClass = cn(
    "flex w-full min-h-[120px] cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-6 text-center transition-colors duration-200",
    disabled ? "cursor-not-allowed opacity-50" : "hover:border-accent/50 hover:bg-muted/10",
    isDragActive ? "border-accent bg-accent/5" : "border-border",
    props.className
  );

  const overlayActionClass =
    "transition-opacity duration-200 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 motion-reduce:opacity-100 motion-reduce:transition-none";

  return (
    <div className="w-full space-y-3">
      <div {...getRootProps({ className: zoneClass })}>
        <input {...getInputProps()} />
        <ImagePlus className="size-8 text-muted" />
        <span className="text-sm font-medium text-text">
          {uploading ? "Subiendo..." : "Arrastra JPG o PNG aqui o haz clic"}
        </span>
        <span className="text-xs text-muted">Bucket Supabase: caps-store</span>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {!props.multiple && props.value ? (
        <div className="group mx-auto w-full max-w-md overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
          <div className="relative aspect-4/3 w-full">
            <Image width={50} height={50} src={props.value} alt="Vista previa" className="size-full object-cover" />
            <div
              className={cn(
                "pointer-events-none absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100 sm:opacity-0 sm:group-hover:opacity-100",
                "motion-reduce:opacity-0 motion-reduce:group-hover:opacity-0"
              )}
              aria-hidden
            />
            <Button
              type="button"
              variant="secondary"
              size="icon-sm"
              className={cn(
                "absolute right-2 top-2 z-10 cursor-pointer border border-border/80 bg-surface/95 text-destructive shadow-sm backdrop-blur-sm hover:bg-surface hover:text-destructive",
                overlayActionClass
              )}
              onClick={() => removeAt(0)}
              disabled={disabled || uploading}
              title="Quitar imagen"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        </div>
      ) : null}

      {props.multiple && props.value.length > 0 ? (
        <ul className="grid max-h-[min(70vh,32rem)] grid-cols-2 gap-3 overflow-y-auto rounded-xl border border-border bg-surface/30 p-3 sm:grid-cols-3">
          {props.value.map((url, index) => (
            <li
              key={`${url}-${index}`}
              draggable={!disabled && !uploading}
              onDragStart={() => setRowDrag(index)}
              onDragOver={onRowDragOver}
              onDrop={() => onRowDrop(index)}
              className={cn(
                "group aspect-square cursor-grab overflow-hidden rounded-xl border border-border bg-surface shadow-sm outline-none transition-[box-shadow,transform] duration-200 active:cursor-grabbing",
                !disabled && !uploading && "hover:border-accent/40 hover:shadow-md",
                rowDrag === index && "ring-2 ring-accent/50"
              )}
            >
              <div className="relative size-full">
                <Image
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 200px"
                  src={url}
                  alt={`Imagen ${index + 1}`}
                  className="object-cover"
                  draggable={false}
                />
                {index === 0 ? (
                  <span className="pointer-events-none absolute left-2 top-2 z-10 rounded-md bg-black/20 px-2 py-0.5 text-[8px] font-semibold uppercase tracking-wide backdrop-blur-sm">
                    Portada
                  </span>
                ) : null}
                <div
                  className="pointer-events-none absolute bottom-0 left-0 right-0 flex items-center justify-center gap-1 bg-linear-to-t from-black/55 to-transparent py-2 pt-8 opacity-0 transition-opacity duration-200 group-hover:opacity-100 sm:opacity-0 sm:group-hover:opacity-100 motion-reduce:opacity-0 motion-reduce:group-hover:opacity-0"
                  aria-hidden
                >
                  <GripVertical className="size-4 text-white/90 drop-shadow" />
                  <span className="text-[10px] font-medium text-white/90">Arrastrar</span>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon-sm"
                  className={cn(
                    "absolute right-2 top-2 z-10 cursor-pointer border border-border/80 bg-surface/95 text-destructive shadow-sm backdrop-blur-sm hover:bg-surface hover:text-destructive",
                    overlayActionClass
                  )}
                  onClick={() => removeAt(index)}
                  disabled={disabled || uploading}
                  title="Quitar"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
