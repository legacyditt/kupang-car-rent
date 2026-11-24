import type { BusinessProfile } from "../../generated/prisma/client.js";
import { formatIntlWhatsApp } from "../../utils/phone.js";
import {
  BusinessProfileRepository,
  DEFAULT_PROFILE_SEED,
} from "./businessProfile.repository.js";
import type { UpdateBusinessProfileInput } from "./businessProfile.schema.js";

export interface BusinessProfileDto {
  name: string;
  tagline: string;
  description: string;
  location: string;
  operatingHours: string;
  whatsappNumber: string;
  whatsappDisplayIntl: string;
  logoPath: string;
}

function toDto(row: BusinessProfile): BusinessProfileDto {
  return {
    name: row.name,
    tagline: row.tagline,
    description: row.description,
    location: row.location,
    operatingHours: row.operatingHours,
    whatsappNumber: row.whatsappNumber,
    whatsappDisplayIntl: formatIntlWhatsApp(row.whatsappNumber),
    logoPath: row.logoPath,
  };
}

export class BusinessProfileService {
  constructor(private readonly repo: BusinessProfileRepository) {}

  async getProfile(): Promise<BusinessProfileDto> {
    const row = await this.repo.findDefault();
    return toDto(row);
  }

  async updateProfile(
    input: UpdateBusinessProfileInput
  ): Promise<BusinessProfileDto> {
    const updated = await this.repo.upsertDefault({
      name: input.name,
      location: input.location,
      whatsappNumber: input.whatsappNumber,
      ...(input.tagline !== undefined ? { tagline: input.tagline || DEFAULT_PROFILE_SEED.tagline } : {}),
      ...(input.description !== undefined ? { description: input.description || DEFAULT_PROFILE_SEED.description } : {}),
      ...(input.operatingHours !== undefined ? { operatingHours: input.operatingHours || DEFAULT_PROFILE_SEED.operatingHours } : {}),
      ...(input.logoPath !== undefined ? { logoPath: input.logoPath || DEFAULT_PROFILE_SEED.logoPath } : {}),
    });
    return toDto(updated);
  }

  async resetLogo(): Promise<BusinessProfileDto> {
    const updated = await this.repo.upsertDefault({
      logoPath: DEFAULT_PROFILE_SEED.logoPath,
    });
    return toDto(updated);
  }
}

