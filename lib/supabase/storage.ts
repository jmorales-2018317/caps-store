"use client";

import { createClient } from "@/lib/supabase/client";

const BUCKET = "caps-store";

export type StorageFolder = "products" | "categories" | "hat-styles";

const ALLOWED_EXT = new Set(["jpg", "jpeg", "png"]);

function extensionFromFile(file: File): string | null {
  const name = file.name.toLowerCase();
  const dot = name.lastIndexOf(".");
  if (dot === -1) return null;
  return name.slice(dot + 1);
}

function validateImageFile(file: File): string | undefined {
  const ext = extensionFromFile(file);
  if (!ext || !ALLOWED_EXT.has(ext)) {
    return "Solo se permiten imagenes JPG o PNG.";
  }
  const mime = file.type.toLowerCase();
  if (mime && mime !== "image/jpeg" && mime !== "image/png") {
    return "Solo se permiten imagenes JPG o PNG.";
  }
  return undefined;
}

/**
 * Sube un archivo al bucket `caps-store` y devuelve la URL publica.
 */
export async function uploadImage(
  file: File,
  folder: StorageFolder
): Promise<{ url: string; error?: string }> {
  const validation = validateImageFile(file);
  if (validation) return { url: "", error: validation };

  const ext = extensionFromFile(file)!;
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;

  const supabase = createClient();
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type || (ext === "png" ? "image/png" : "image/jpeg"),
  });

  if (error) {
    const msg = error.message ?? "";
    const isRls =
      msg.toLowerCase().includes("row-level security") ||
      msg.toLowerCase().includes("policy") ||
      (error as { statusCode?: string }).statusCode === "403";
    return {
      url: "",
      error: isRls
        ? "Permiso denegado en Storage (RLS). Ejecuta las politicas en supabase/migrations/20260504120000_caps_store_storage_policies.sql y asegurate de estar logueado."
        : msg || "No se pudo subir la imagen. Verifica el bucket caps-store y las politicas de Storage.",
    };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(path);

  return { url: publicUrl };
}
