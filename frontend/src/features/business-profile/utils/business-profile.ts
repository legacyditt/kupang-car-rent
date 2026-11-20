import type {
  BusinessProfile,
  BusinessProfileInput,
} from "../types/business-profile.types";

export const DEFAULT_BUSINESS_PROFILE: BusinessProfile = {
  name: "Aventra Rental",
  tagline: "Driven in Gold Standard",
  description:
    "Sewa mobil harian di Kota Kupang. Avanza, Innova Reborn, Brio, dan Hilux — lepas kunci atau dengan sopir.",
  location: "Kota Kupang, Nusa Tenggara Timur",
  operatingHours: "24 Jam / Setiap Hari (Antar-Jemput Bandara El Tari)",
  whatsappNumber: "6281238989891",
  whatsappDisplayIntl: "+62 812-3898-9891",
  logoPath: "/logo-aventra.jpg",
};

export function normalizeAdminWhatsApp(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("0")) return `62${digits.slice(1)}`;
  if (digits.startsWith("62")) return digits;
  return `62${digits}`;
}

export function formatIntlWhatsApp(normalized: string): string {
  if (!normalized.startsWith("62")) return normalized;
  const local = normalized.slice(2);
  if (local.length < 7) return `+62 ${local}`;
  const part1 = local.slice(0, 3);
  const part2 = local.slice(3, 7);
  const part3 = local.slice(7);
  return part3 ? `+62 ${part1}-${part2}-${part3}` : `+62 ${part1}-${part2}`;
}

export function validateAndNormalizeProfile(
  input: BusinessProfileInput
): { ok: true; profile: BusinessProfile } | { ok: false; error: string } {
  const name = input.name.trim();
  const tagline = input.tagline.trim();
  const description = input.description.trim();
  const location = input.location.trim();
  const operatingHours = input.operatingHours.trim();
  const whatsappNumber = normalizeAdminWhatsApp(input.whatsappNumber);
  const logoPath = input.logoPath.trim() || DEFAULT_BUSINESS_PROFILE.logoPath;

  if (!name) {
    return { ok: false, error: "Nama bisnis wajib diisi." };
  }
  if (whatsappNumber.length < 10) {
    return {
      ok: false,
      error: "Nomor WhatsApp admin minimal 10 digit.",
    };
  }
  if (!location) {
    return { ok: false, error: "Alamat rental wajib diisi." };
  }

  return {
    ok: true,
    profile: {
      name,
      tagline: tagline || DEFAULT_BUSINESS_PROFILE.tagline,
      description: description || DEFAULT_BUSINESS_PROFILE.description,
      location,
      operatingHours:
        operatingHours || DEFAULT_BUSINESS_PROFILE.operatingHours,
      whatsappNumber,
      whatsappDisplayIntl: formatIntlWhatsApp(whatsappNumber),
      logoPath,
    },
  };
}

