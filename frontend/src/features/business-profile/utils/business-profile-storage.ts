import type { BusinessProfile } from "../types/business-profile.types";
import { DEFAULT_BUSINESS_PROFILE } from "./business-profile";

export const BUSINESS_PROFILE_STORAGE_KEY = "aventra-business-profile";
export const BUSINESS_PROFILE_UPDATED_EVENT = "aventra:business-profile-updated";

export function readStoredBusinessProfile(): BusinessProfile {
  try {
    const raw = window.localStorage.getItem(BUSINESS_PROFILE_STORAGE_KEY);
    if (!raw) return DEFAULT_BUSINESS_PROFILE;
    const parsed = JSON.parse(raw) as Partial<BusinessProfile>;
    return {
      ...DEFAULT_BUSINESS_PROFILE,
      ...parsed,
    };
  } catch {
    return DEFAULT_BUSINESS_PROFILE;
  }
}

export function writeStoredBusinessProfile(profile: BusinessProfile): void {
  try {
    window.localStorage.setItem(
      BUSINESS_PROFILE_STORAGE_KEY,
      JSON.stringify(profile)
    );
    window.dispatchEvent(new CustomEvent(BUSINESS_PROFILE_UPDATED_EVENT));
  } catch {
    // Ignore storage write failure in restricted contexts
  }
}

export function subscribeBusinessProfile(onChange: () => void): () => void {
  const handleCustom = () => onChange();
  const handleStorage = (e: StorageEvent) => {
    if (e.key === BUSINESS_PROFILE_STORAGE_KEY) onChange();
  };

  window.addEventListener(BUSINESS_PROFILE_UPDATED_EVENT, handleCustom);
  window.addEventListener("storage", handleStorage);
  return () => {
    window.removeEventListener(BUSINESS_PROFILE_UPDATED_EVENT, handleCustom);
    window.removeEventListener("storage", handleStorage);
  };
}

