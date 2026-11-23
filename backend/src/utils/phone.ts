/** Normalizes Indonesian phone input to 628... digits. */
export function normalizeWhatsAppPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("0")) return `62${digits.slice(1)}`;
  if (digits.startsWith("62")) return digits;
  return `62${digits}`;
}

/** Formats normalized 628... number as +62 812-3898-9891 for UI display. */
export function formatIntlWhatsApp(normalized: string): string {
  if (!normalized.startsWith("62")) return normalized;
  const local = normalized.slice(2);
  if (local.length < 7) return `+62 ${local}`;
  const part1 = local.slice(0, 3);
  const part2 = local.slice(3, 7);
  const part3 = local.slice(7);
  return part3 ? `+62 ${part1}-${part2}-${part3}` : `+62 ${part1}-${part2}`;
}

