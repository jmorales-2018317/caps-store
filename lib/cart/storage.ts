import type { CartLineRef } from "@/types";

export const CART_STORAGE_KEY = "caps_cart_v1";

export function lineKey(line: Pick<CartLineRef, "productId" | "colorName" | "size">) {
  return `${line.productId}|${line.colorName}|${line.size}`;
}

function isBrowser() {
  return typeof window !== "undefined";
}

export function readCartLines(): CartLineRef[] {
  if (!isBrowser()) return [];

  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidLine);
  } catch {
    return [];
  }
}

function isValidLine(value: unknown): value is CartLineRef {
  if (!value || typeof value !== "object") return false;
  const line = value as Record<string, unknown>;
  return (
    typeof line.productId === "string" &&
    typeof line.colorName === "string" &&
    typeof line.colorHex === "string" &&
    typeof line.size === "string" &&
    typeof line.quantity === "number" &&
    line.quantity > 0
  );
}

export function writeCartLines(lines: CartLineRef[]) {
  if (!isBrowser()) return;
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(lines));
}

export function clearLines() {
  writeCartLines([]);
}

export function upsertLine(
  line: CartLineRef,
  mode: "add" | "set" = "add"
): CartLineRef[] {
  const lines = readCartLines();
  const key = lineKey(line);
  const idx = lines.findIndex((l) => lineKey(l) === key);

  if (idx >= 0) {
    const existing = lines[idx]!;
    const quantity =
      mode === "set" ? line.quantity : existing.quantity + line.quantity;
    if (quantity <= 0) {
      lines.splice(idx, 1);
    } else {
      lines[idx] = { ...existing, ...line, quantity };
    }
  } else if (line.quantity > 0) {
    lines.push(line);
  }

  writeCartLines(lines);
  return lines;
}

export function removeLine(productId: string, colorName: string, size: string) {
  const lines = readCartLines().filter(
    (l) =>
      !(
        l.productId === productId &&
        l.colorName === colorName &&
        l.size === size
      )
  );
  writeCartLines(lines);
  return lines;
}

export function setLineQuantity(
  productId: string,
  colorName: string,
  size: string,
  quantity: number
) {
  if (quantity <= 0) {
    return removeLine(productId, colorName, size);
  }

  const lines = readCartLines();
  const key = lineKey({ productId, colorName, size });
  const idx = lines.findIndex((l) => lineKey(l) === key);

  if (idx >= 0) {
    lines[idx] = { ...lines[idx]!, quantity };
    writeCartLines(lines);
    return lines;
  }

  return lines;
}
