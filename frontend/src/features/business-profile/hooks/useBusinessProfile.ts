import { useEffect, useState } from "react";
import type {
  BusinessProfile,
  BusinessProfileInput,
} from "../types/business-profile.types";
import {
  DEFAULT_BUSINESS_PROFILE,
  validateAndNormalizeProfile,
} from "../utils/business-profile";
import {
  readStoredBusinessProfile,
  subscribeBusinessProfile,
  writeStoredBusinessProfile,
} from "../utils/business-profile-storage";

export function useBusinessProfile() {
  const [profile, setProfile] = useState<BusinessProfile>(
    readStoredBusinessProfile
  );

  useEffect(() => {
    return subscribeBusinessProfile(() => {
      setProfile(readStoredBusinessProfile());
    });
  }, []);

  const saveProfile = (
    input: BusinessProfileInput
  ): { ok: true; profile: BusinessProfile } | { ok: false; error: string } => {
    const validated = validateAndNormalizeProfile(input);
    if (!validated.ok) {
      return validated;
    }
    setProfile(validated.profile);
    writeStoredBusinessProfile(validated.profile);
    return { ok: true, profile: validated.profile };
  };

  const resetLogo = () => {
    const next: BusinessProfile = {
      ...profile,
      logoPath: DEFAULT_BUSINESS_PROFILE.logoPath,
    };
    setProfile(next);
    writeStoredBusinessProfile(next);
  };

  return {
    profile,
    saveProfile,
    resetLogo,
  };
}

