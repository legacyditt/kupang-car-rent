export interface BusinessProfile {
  name: string;
  tagline: string;
  description: string;
  location: string;
  operatingHours: string;
  whatsappNumber: string;
  whatsappDisplayIntl: string;
  logoPath: string;
}

export type BusinessProfileInput = Omit<
  BusinessProfile,
  "whatsappDisplayIntl"
>;

