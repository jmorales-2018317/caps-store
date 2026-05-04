/**
 * Returns a same-origin path safe to use after login/OAuth, or null if invalid.
 * Only allows absolute paths on this app (starts with `/`, not `//`).
 */
export function getSafeInternalPath(
  candidate: string | null | undefined
): string | null {
  if (candidate == null) return null;
  const t = String(candidate).trim();
  if (!t.startsWith("/") || t.startsWith("//")) return null;
  if (t.includes("://")) return null;
  return t;
}
