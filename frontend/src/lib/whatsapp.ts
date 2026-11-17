import { BUSINESS_INFO } from "./constants";

export function buildWhatsAppUrl(message?: string): string {
  const defaultMessage =
    "Halo, saya ingin menanyakan ketersediaan dan informasi sewa mobil di Rental Mobil Kupang.";
  const text = encodeURIComponent(message ?? defaultMessage);
  return `https://wa.me/${BUSINESS_INFO.whatsappNumber}?text=${text}`;
}

