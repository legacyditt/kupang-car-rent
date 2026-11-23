import type { BusinessProfile } from "@/features/business-profile/types/business-profile.types";
import { DEFAULT_BUSINESS_PROFILE } from "@/features/business-profile/utils/business-profile";
import { queryClient } from "./query-client";

export function buildWhatsAppUrl(message?: string): string {
  const cached = queryClient.getQueryData<BusinessProfile>([
    "business-profile",
  ]);
  const whatsappNumber =
    cached?.whatsappNumber ?? DEFAULT_BUSINESS_PROFILE.whatsappNumber;
  const defaultMessage =
    "Halo, saya ingin menanyakan ketersediaan dan informasi sewa mobil di Rental Mobil Kupang.";
  const text = encodeURIComponent(message ?? defaultMessage);
  return `https://wa.me/${whatsappNumber}?text=${text}`;
}
