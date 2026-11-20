import { readStoredBusinessProfile } from "@/features/business-profile/utils/business-profile-storage";

export function buildWhatsAppUrl(message?: string): string {
  const { whatsappNumber } = readStoredBusinessProfile();
  const defaultMessage =
    "Halo, saya ingin menanyakan ketersediaan dan informasi sewa mobil di Rental Mobil Kupang.";
  const text = encodeURIComponent(message ?? defaultMessage);
  return `https://wa.me/${whatsappNumber}?text=${text}`;
}

