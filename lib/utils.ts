import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const CATEGORY_LABELS_ES: Record<string, string> = {
  snapback: "Snapback",
  fitted: "Fitted",
  "dad-hat": "Gorra dad",
  bucket: "Bucket",
};

/** Etiqueta de categoría en español para UI */
export function categoryLabelEs(category: string): string {
  return CATEGORY_LABELS_ES[category] ?? category.replace("-", " ");
}

/** Monto mínimo del carrito para envío gratis (quetzales) */
export const FREE_SHIPPING_MINIMUM_GTQ = 590;

export const SHIPPING_STANDARD_GTQ = 79;
export const SHIPPING_EXPRESS_GTQ = 157;

/** Envío a domicilio en checkout (único método; quetzales) */
export const CHECKOUT_SHIPPING_FEE_GTQ = 25;

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("es-GT", {
    style: "currency",
    currency: "GTQ",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatPriceDecimal(price: number): string {
  return new Intl.NumberFormat("es-GT", {
    style: "currency",
    currency: "GTQ",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
}
