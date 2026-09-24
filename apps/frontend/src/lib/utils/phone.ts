export function normalizePhone(raw: string): string {
  return raw.trim().replace(/[\s\-()]/g, "");
}
