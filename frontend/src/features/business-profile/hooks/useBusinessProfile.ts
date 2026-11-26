import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiError, apiFetch } from "@/lib/api";
import { notifyError, notifySuccess } from "@/lib/notify";
import type {
  BusinessProfile,
  BusinessProfileInput,
} from "../types/business-profile.types";
import { DEFAULT_BUSINESS_PROFILE } from "../utils/business-profile";

export const BUSINESS_PROFILE_QUERY_KEY = ["business-profile"] as const;

export function useBusinessProfile() {
  const qc = useQueryClient();

  const { data: profile = DEFAULT_BUSINESS_PROFILE, isLoading } = useQuery({
    queryKey: BUSINESS_PROFILE_QUERY_KEY,
    queryFn: () => apiFetch<BusinessProfile>("/business-profile"),
    placeholderData: DEFAULT_BUSINESS_PROFILE,
  });

  const saveProfile = async (
    input: BusinessProfileInput
  ): Promise<{ ok: true; profile: BusinessProfile } | { ok: false; error: string }> => {
    try {
      const updated = await apiFetch<BusinessProfile>(
        "/admin/business-profile",
        {
          method: "PATCH",
          body: JSON.stringify(input),
        }
      );
      qc.setQueryData(BUSINESS_PROFILE_QUERY_KEY, updated);
      notifySuccess("Profil bisnis disimpan");
      return { ok: true, profile: updated };
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Gagal menyimpan profil bisnis.";
      notifyError("Gagal menyimpan profil bisnis", message);
      return { ok: false, error: message };
    }
  };

  const resetLogo = async (): Promise<
    { ok: true; profile: BusinessProfile } | { ok: false; error: string }
  > => {
    try {
      const updated = await apiFetch<BusinessProfile>(
        "/admin/business-profile/reset-logo",
        { method: "POST" }
      );
      qc.setQueryData(BUSINESS_PROFILE_QUERY_KEY, updated);
      notifySuccess("Logo direset ke default");
      return { ok: true, profile: updated };
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Gagal mereset logo.";
      notifyError("Gagal mereset logo", message);
      return { ok: false, error: message };
    }
  };

  return {
    profile,
    isLoading,
    saveProfile,
    resetLogo,
  };
}
